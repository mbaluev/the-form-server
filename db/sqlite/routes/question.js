const express = require("express")
const uuid = require("uuid");

const router = express.Router()
const db = require("../utils/init")
const { verifyAdmin } = require("../passport/auth")

router.post("/list", verifyAdmin, (req, res, next) => {
  const errors = []
  if (!req.body.blockId) errors.push("No blockId specified");
  if (errors.length) {
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  db.beginTransaction(async (err, transaction) => {
    const blockId = req.body.blockId;
    const query1 = `SELECT id, blockId, title FROM questions WHERE blockId = ?`;
    const params1 = [blockId];
    const rows = await transaction.allAsync(query1, ...params1);

    const promises1 = rows.map((row) => {
      const query2 = `SELECT id, title FROM questionAnswers WHERE questionId = ?`
      const params2 = [row.id];
      return transaction.allAsync(query2, ...params2);
    })
    const options = await Promise.all(promises1);

    const promises2 = rows.map((row) => {
      const query2 = `SELECT questionAnswerId FROM questionAnswersCorrect WHERE questionId = ?`
      const params2 = [row.id];
      return transaction.allAsync(query2, ...params2);
    })
    const optionsCorrectId = await Promise.all(promises2);

    const data = rows.map((row, index) => {
      return {
        id: row.id,
        blockId: row.blockId,
        title: row.title,
        options: options[index],
        optionsCorrectId: optionsCorrectId[index].map(d => d.questionAnswerId)
      }
    });
    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, data })
    });
  })
});
router.get("/get/:id", verifyAdmin, (req, res, next) => {
  db.beginTransaction(async (err, transaction) => {
    const query1 = `SELECT id, blockId, title FROM questions WHERE id = ?`;
    const params1 = [req.params.id];
    const row = await transaction.getAsync(query1, ...params1);

    const query2 = `SELECT id, title FROM questionAnswers WHERE questionId = ?`;
    const params2 = [req.params.id];
    const options = await transaction.allAsync(query2, ...params2);

    const query3 = `SELECT questionAnswerId FROM questionAnswersCorrect WHERE questionId = ?`;
    const params3 = [req.params.id];
    const optionsCorrectId = await transaction.allAsync(query3, ...params3);

    const data = {
      id: row.id,
      blockId: row.blockId,
      title: row.title,
      options,
      optionsCorrectId: optionsCorrectId.map(d => d.questionAnswerId)
    }
    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, data })
    });
  })
});
router.post("/create", verifyAdmin, (req, res, next) => {
  const errors = [];
  if (!req.body.blockId) {
    errors.push("No blockId specified");
  }
  if (!req.body.title) {
    errors.push("No title specified");
  }
  if (!req.body.options) {
    errors.push("No options specified");
  }
  if (!req.body.optionsCorrectId) {
    errors.push("No optionsCorrectId specified");
  }
  if (errors.length) {
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const data = {
    id: uuid.v4(),
    blockId: req.body.blockId,
    title: req.body.title,
    options: req.body.options,
    optionsCorrectId: req.body.optionsCorrectId
  };
  db.beginTransaction(async (err, transaction) => {
    const query1 = 'INSERT INTO questions (id, blockId, title) VALUES (?,?,?)';
    const params1 = [data.id, data.blockId, data.title];
    transaction.run(query1, params1);

    data.options.forEach((option) => {
      const query2 = 'INSERT INTO questionAnswers (id, questionId, title) VALUES (?,?,?)';
      const params2 = [option.id, data.id, option.title];
      transaction.run(query2, params2);
    })

    data.optionsCorrectId.forEach((optionCorrect) => {
      const query3 = 'INSERT INTO questionAnswersCorrect (id, questionId, questionAnswerId) VALUES (?,?,?)';
      const params3 = [uuid.v4(), data.id, optionCorrect];
      transaction.run(query3, params3);
    })

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({
        success: true,
        data: { ...data }
      })
    });
  })
});
router.patch("/update/:id", verifyAdmin, (req, res, next) => {
  const errors = [];
  if (!req.body.blockId) {
    errors.push("No blockId specified");
  }
  if (!req.body.title) {
    errors.push("No title specified");
  }
  if (!req.body.options) {
    errors.push("No options specified");
  }
  if (!req.body.optionsCorrectId) {
    errors.push("No optionsCorrectId specified");
  }
  if (errors.length) {
    res.status(400).json({
      success: false,
      message: errors.join(", ")
    })
    return;
  }
  const data = {
    id: req.params.id,
    blockId: req.body.blockId,
    title: req.body.title,
    options: req.body.options,
    optionsCorrectId: req.body.optionsCorrectId
  };
  db.beginTransaction(async (err, transaction) => {
    // update questions
    const query1 = `UPDATE questions SET
      title = COALESCE(?,title)
      WHERE id = ?`;
    const params1 = [data.title, data.id];
    transaction.run(query1, params1);

    // update options
    const promises1 = data.options.map((option) => {
      const query2 = `SELECT id, title FROM questionAnswers WHERE id = ?`;
      const params2 = [option.id];
      return transaction.getAsync(query2, ...params2);
    })
    const options = await Promise.all(promises1);

    // UPDATE CREATE options
    const promises2 = data.options.map((item) => {
      const option = options.find(d => d?.id === item.id);
      if (option) {
        const query3 = `UPDATE questionAnswers SET title = COALESCE(?,title) WHERE id = ?`;
        const params3 = [item.title, item.id];
        return transaction.run(query3, ...params3);
      } else {
        const query4 = 'INSERT INTO questionAnswers (id, questionId, title) VALUES (?,?,?)';
        const params4 = [item.id, data.id, item.title];
        return transaction.run(query4, params4);
      }
    });
    await Promise.all(promises2);

    // DELETE options
    const query5 = `DELETE FROM questionAnswers WHERE questionId = ? AND id NOT IN (${ data.options.map(_ => '?') })`;
    const params5 = [data.id, ...data.options.map(d => d.id)];
    transaction.run(query5, params5);

    // update optionsCorrectId
    const query6 = `DELETE FROM questionAnswersCorrect WHERE questionId = ?`;
    const params6 = [data.id];
    transaction.run(query6, params6);
    data.optionsCorrectId.forEach((optionCorrect) => {
      const query7 = 'INSERT INTO questionAnswersCorrect (id, questionId, questionAnswerId) VALUES (?,?,?)';
      const params7 = [uuid.v4(), data.id, optionCorrect];
      transaction.run(query7, params7);
    })

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, data })
    });
  })
});
router.delete("/delete", verifyAdmin, (req, res, next) => {
  const ids = req.body.ids;
  db.beginTransaction(async (err, transaction) => {
    const query1 = `DELETE FROM questionAnswersCorrect WHERE questionId IN (${ ids.map(_ => '?') })`;
    const params1 = [...ids];
    transaction.run(query1, params1);

    const query2 = `DELETE FROM questionAnswers WHERE questionId IN (${ ids.map(_ => '?') })`;
    const params2 = [...ids];
    transaction.run(query2, params2);

    const query3 = `DELETE FROM questions WHERE id IN (${ ids.map(_ => '?') })`;
    const params3 = [...ids];
    transaction.run(query3, params3);

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, changes: ids.length })
    });
  })
})

module.exports = router
