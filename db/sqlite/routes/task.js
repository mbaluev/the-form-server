const express = require("express")
const fs = require('fs');
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
    const blockId = req.body.blockId || '';
    const query1 = `SELECT t.id, t.blockId, t.documentId, 
    d.name, d.description, d.fileId,
    f.name as filename, f.size, f.mimetype, f.path
    FROM tasks t
    LEFT JOIN blocks b ON b.id = t.blockId
    LEFT JOIN documents d ON d.id = t.documentId
    LEFT JOIN files f ON f.id = d.fileId
    WHERE t.blockId = ?`;
    const params1 = [blockId];
    const rows = await transaction.allAsync(query1, ...params1);

    const promises = rows.map((row) => {
      const query2 = `SELECT id, 'link' as type, title FROM taskLinks WHERE taskId IN (?)
        UNION ALL SELECT id, 'file' as type, title FROM taskDocuments WHERE taskId IN (?)`;
      const params2 = [row.id, row.id];
      return transaction.allAsync(query2, ...params2);
    })
    const answers = await Promise.all(promises);

    const data = rows.map((row, index) => {
      return {
        id: row.id,
        blockId: row.blockId,
        document: {
          id: row.documentId,
          name: row.name,
          description: row.description,
          file: {
            id: row.fileId,
            name: row.filename,
            size: row.size,
            mimetype: row.mimetype,
            path: row.path
          }
        },
        taskAnswers: answers[index]
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
    const query1 = `SELECT t.id, t.blockId, t.documentId,
      d.name, d.description, d.fileId,
      f.name as filename, f.size, f.mimetype, f.path
      FROM tasks t
      LEFT JOIN blocks b ON b.id = t.blockId
      LEFT JOIN documents d ON d.id = t.documentId
      LEFT JOIN files f ON f.id = d.fileId
      WHERE t.id = ?`;
    const params1 = [req.params.id];
    const row = await transaction.getAsync(query1, ...params1);

    const query2 = `SELECT id, 'link' as type, title FROM taskLinks WHERE taskId = ?
        UNION ALL SELECT id, 'file' as type, title FROM taskDocuments WHERE taskId = ?`;
    const params2 = [req.params.id, req.params.id];
    const taskAnswers = await transaction.allAsync(query2, ...params2);

    const data = {
      id: row.id,
      blockId: row.blockId,
      document: {
        id: row.documentId,
        name: row.name,
        description: row.description,
        file: {
          id: row.fileId,
          name: row.filename,
          size: row.size,
          mimetype: row.mimetype,
          path: row.path
        }
      },
      taskAnswers
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
  if (!req.body.document) {
    errors.push("No document specified");
  }
  if (!req.body.document.name) {
    errors.push("No name specified");
  }
  if (!req.body.document.description) {
    errors.push("No description specified");
  }
  if (!req.body.document.file.id) {
    errors.push("No fileId specified");
  }
  if (!req.body.taskAnswers) {
    errors.push("No task answers specified");
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
    document: {
      id: uuid.v4(),
      name: req.body.document.name,
      description: req.body.document.description,
      file: req.body.document.file
    },
    taskAnswers: req.body.taskAnswers
  };
  db.beginTransaction(async (err, transaction) => {
    const query1 = 'INSERT INTO documents (id, fileId, name, description) VALUES (?,?,?,?)';
    const params1 = [data.document.id, data.document.file.id, data.document.name, data.document.description];
    transaction.run(query1, params1);

    const query2 = 'INSERT INTO tasks (id, blockId, documentId) VALUES (?,?,?)';
    const params2 = [data.id, data.blockId, data.document.id];
    transaction.run(query2, params2);

    data.taskAnswers.forEach((answer) => {
      if (answer.type === 'file') {
        const query2 = 'INSERT INTO taskDocuments (id, taskId, title) VALUES (?,?,?)';
        const params2 = [answer.id, data.id, answer.title];
        transaction.run(query2, params2);
      }
      if (answer.type === 'link') {
        const query2 = 'INSERT INTO taskLinks (id, taskId, title) VALUES (?,?,?)';
        const params2 = [answer.id, data.id, answer.title];
        transaction.run(query2, params2);
      }
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
  if (!req.body.document) {
    errors.push("No document specified");
  }
  if (!req.body.document.name) {
    errors.push("No name specified");
  }
  if (!req.body.document.description) {
    errors.push("No description specified");
  }
  if (!req.body.document.file.id) {
    errors.push("No fileId specified");
  }
  if (!req.body.taskAnswers) {
    errors.push("No task answers specified");
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
    document: req.body.document,
    taskAnswers: req.body.taskAnswers
  };
  db.beginTransaction(async (err, transaction) => {
    // update files
    const query1 = `SELECT f.id, f.path
      FROM documents d
      LEFT JOIN files f ON f.id = d.fileId
      WHERE d.id = ?`;
    const params1 = [data.document.id];
    const file = await transaction.getAsync(query1, ...params1)
    if (file.id !== data.document.file.id) {
      if (fs.existsSync(`./${file.path}`)) {
        fs.unlinkSync(`./${file.path}`);
      }
      const query2 = `DELETE FROM files WHERE id = ?`;
      const params2 = [file.id];
      transaction.run(query2, params2);
    }

    // update documents
    const query3 = `UPDATE documents SET
      name = COALESCE(?,name), 
      description = COALESCE(?,description), 
      fileId = COALESCE(?,fileId)
      WHERE id = ?`;
    const params3 = [data.document.name, data.document.description, data.document.file.id, data.document.id];
    transaction.run(query3, params3);

    // update taskAnswers
    const promises1 = data.taskAnswers.map((answer) => {
      const query4 = `SELECT id, 'link' as type, title FROM taskLinks WHERE id = ?
        UNION ALL SELECT id, 'file' as type, title FROM taskDocuments WHERE id = ?`;
      const params4 = [answer.id, answer.id];
      return transaction.getAsync(query4, ...params4);
    })
    const answers = await Promise.all(promises1);

    // UPDATE CREATE taskAnswers
    const promises2 = data.taskAnswers.map((item) => {
      const answer = answers.find(d => d?.id === item.id);
      if (answer) {
        if (item.type === 'link') {
          const query5 = `UPDATE taskLinks SET title = COALESCE(?,title) WHERE id = ?`;
          const params5 = [item.title, item.id];
          return transaction.run(query5, ...params5);
        }
        if (item.type === 'file') {
          const query5 = `UPDATE taskDocuments SET title = COALESCE(?,title) WHERE id = ?`;
          const params5 = [item.title, item.id];
          return transaction.run(query5, ...params5);
        }
      } else {
        if (item.type === 'file') {
          const query6 = 'INSERT INTO taskDocuments (id, taskId, title) VALUES (?,?,?)';
          const params6 = [item.id, data.id, item.title];
          return transaction.run(query6, params6);
        }
        if (item.type === 'link') {
          const query6 = 'INSERT INTO taskLinks (id, taskId, title) VALUES (?,?,?)';
          const params6 = [item.id, data.id, item.title];
          return transaction.run(query6, params6);
        }
      }
    });
    await Promise.all(promises2);

    // DELETE taskAnswers
    const query7 = `DELETE FROM taskLinks WHERE taskId = ? AND id NOT IN (${ data.taskAnswers.map(_ => '?') })`;
    const params7 = [data.id, ...data.taskAnswers.map(d => d.id)];
    transaction.run(query7, params7);
    const query8 = `DELETE FROM taskDocuments WHERE taskId = ? AND id NOT IN (${ data.taskAnswers.map(_ => '?') })`;
    const params8 = [data.id, ...data.taskAnswers.map(d => d.id)];
    transaction.run(query8, params8);

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, data: data })
    });
  })
})
router.delete("/delete", verifyAdmin, (req, res, next) => {
  const ids = req.body.ids;
  db.beginTransaction(async (err, transaction) => {
    const promises = ids.map((id) => {
      const query = `SELECT t.id, t.blockId, t.documentId, 
        d.name, d.description, d.fileId,
        f.name as filename, f.size, f.mimetype, f.path
        FROM tasks t
        LEFT JOIN blocks b ON b.id = t.blockId
        LEFT JOIN documents d ON d.id = t.documentId
        LEFT JOIN files f ON f.id = d.fileId
        WHERE t.id = ?`;
      const params = [id]
      return transaction.getAsync(query, ...params);
    });
    const rows = await Promise.all(promises);
    const data = rows.map(row => {
      return {
        id: row.id,
        blockId: row.blockId,
        document: {
          id: row.documentId,
          name: row.name,
          description: row.description,
          file: {
            id: row.fileId,
            name: row.filename,
            size: row.size,
            mimetype: row.mimetype,
            path: row.path
          }
        }
      };
    })

    data.forEach((item) => {
      if (fs.existsSync(`./${item.document.file.path}`)) {
        fs.unlinkSync(`./${item.document.file.path}`);
      }
      const query1 = `DELETE FROM files WHERE id = ?`;
      const params1 = [item.document.file.id];
      transaction.run(query1, params1);

      const query2 = `DELETE FROM documents WHERE id = ?`;
      const params2 = [item.document.id];
      transaction.run(query2, params2);

      const query3 = `DELETE FROM taskDocuments WHERE taskId = ?`;
      const params3 = [item.id];
      transaction.run(query3, params3);

      const query4 = `DELETE FROM taskLinks WHERE taskId = ?`;
      const params4 = [item.id];
      transaction.run(query4, params4);

      const query5 = `DELETE FROM tasks WHERE id = ?`;
      const params5 = [item.id];
      transaction.run(query5, params5);
    });

    transaction.commit((err) => {
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({ success: true, changes: rows.length })
    });
  })
})

module.exports = router
