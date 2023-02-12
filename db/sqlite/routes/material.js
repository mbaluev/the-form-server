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
  const blockId = req.body.blockId || '';
  const query = `SELECT m.id, m.blockId, m.documentId, 
    d.name, d.description, d.fileId,
    f.name as filename, f.size, f.mimetype, f.path
    FROM materials m
    LEFT JOIN blocks b ON b.id = m.blockId
    LEFT JOIN documents d ON d.id = m.documentId
    LEFT JOIN files f ON f.id = d.fileId
    WHERE m.blockId = ?`;
  const params = [blockId];
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.json({
      success: true,
      data: rows.map((row) => {
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
        }
      })
    })
  });
});
router.get("/get/:id", verifyAdmin, (req, res, next) => {
  const query = `SELECT m.id, m.blockId, m.documentId, 
    d.name, d.description, d.fileId,
    f.name as filename, f.size, f.mimetype, f.path
    FROM materials m
    LEFT JOIN blocks b ON b.id = m.blockId
    LEFT JOIN documents d ON d.id = m.documentId
    LEFT JOIN files f ON f.id = d.fileId
    WHERE m.id = ?`;
  const params = [req.params.id]
  db.get(query, params, (err, row) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      });
      return;
    }
    res.json({
      success: true,
      data: {
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
      }
    })
  });
});
router.post("/create", verifyAdmin, (req, res, next) => {
  const errors = []
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
    }
  };
  const query = 'INSERT INTO documents (id, fileId, name, description) VALUES (?,?,?,?)'
  const params = [data.document.id, data.document.file.id, data.document.name, data.document.description];
  db.run(query, params, function (err, result) {
    if (err){
      res.status(400).json({
        success: false,
        message: err.message
      })
      return;
    }
    const query = 'INSERT INTO materials (id, blockId, documentId) VALUES (?,?,?)'
    const params = [data.id, data.blockId, data.document.id];
    db.run(query, params, function (err, result) {
      if (err){
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({
        success: true,
        data: { id : this.lastID, ...data }
      })
    });
  });
});
router.patch("/update/:id", verifyAdmin, (req, res, next) => {
  const errors = []
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
    document: req.body.document
  };
  const updateDocuments = () => {
    const query = `UPDATE documents SET
        name = COALESCE(?,name), 
        description = COALESCE(?,description), 
        fileId = COALESCE(?,fileId)
        WHERE id = ?`;
    const params = [data.document.name, data.document.description, data.document.file.id, data.document.id];
    db.run(query, params, function (err, result) {
      if (err){
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      res.json({
        success: true,
        changes: this.changes,
        data: data
      })
    });
  }

  const query = `SELECT f.id, f.path
    FROM documents d
    LEFT JOIN files f ON f.id = d.fileId
    WHERE d.id = ?`;
  const params = [data.document.id];
  db.get(query, params, (err, file) => {
    if (err) {
      res.status(400).json({
        success: false,
        message: err.message
      })
      return;
    }
    if (file.id !== data.document.file.id) {
      if (fs.existsSync(`./${file.path}`)) {
        fs.unlinkSync(`./${file.path}`);
      }
      const query = `DELETE FROM files WHERE id = ?`;
      const params = [file.id];
      db.run(query, params, function (err, result) {
        if (err){
          res.status(400).json({
            success: false,
            message: err.message
          })
          return;
        }
        updateDocuments();
      });
    } else {
      updateDocuments();
    }
  });
})
router.delete("/delete", verifyAdmin, (req, res, next) => {
  const ids = req.body.ids;
  let changes = 0;
  ids?.forEach((id) => {
    const query = `SELECT m.id, m.blockId, m.documentId, 
    d.name, d.description, d.fileId,
    f.name as filename, f.size, f.mimetype, f.path
    FROM materials m
    LEFT JOIN blocks b ON b.id = m.blockId
    LEFT JOIN documents d ON d.id = m.documentId
    LEFT JOIN files f ON f.id = d.fileId
    WHERE m.id = ?`;
    const params = [id]
    db.get(query, params, (err, row) => {
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
        }
      };
      if (err) {
        res.status(400).json({
          success: false,
          message: err.message
        })
        return;
      }
      if (fs.existsSync(`./${data.document.file.path}`)) {
        fs.unlinkSync(`./${data.document.file.path}`);
      }
      const query = `DELETE FROM files WHERE id = ?`;
      const params = [data.document.file.id];
      db.run(query, params, function (err, result) {
        if (err) {
          res.status(400).json({
            success: false,
            message: err.message
          })
          return;
        }
        const query = `DELETE FROM documents WHERE id = ?`;
        const params = [data.document.id];
        db.run(query, params, function (err, result) {
          if (err) {
            res.status(400).json({
              success: false,
              message: err.message
            })
            return;
          }
          const query = `DELETE FROM materials WHERE id = ?`;
          const params = [data.id];
          db.run(query, params, function (err, result) {
            if (err) {
              res.status(400).json({
                success: false,
                message: err.message
              })
              return;
            }
            changes += this.changes;
          });
        });
      });
    });
  });
  res.json({
    success: true,
    changes: changes,
  })
})

module.exports = router
