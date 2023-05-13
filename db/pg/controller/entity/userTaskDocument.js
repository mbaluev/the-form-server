const mapRow = (row) => {
  return {
    id: row.id,
    taskDocumentId: row.taskdocumentid,
    documentId: row.documentid,
    userId: row.userid,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, taskdocumentid, documentid, userid FROM userTaskDocuments`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, taskdocumentid, documentid, userid FROM userTaskDocuments  
      WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO userTaskDocuments (id, taskdocumentid, documentid, userid) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.taskDocumentId, data.documentId, data.userId];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userTaskDocuments SET 
      taskdocumentid = COALESCE($1,taskdocumentid), 
      documentid = COALESCE($2,documentid), 
      userid = COALESCE($3,userid)
      WHERE id = $4`;
    const params1 = [data.taskDocumentId, data.documentId, data.userId, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userTaskDocuments WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userTaskDocuments WHERE userid = $1`;
    const params1 = [userId];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  del,
  delByUserId
}
