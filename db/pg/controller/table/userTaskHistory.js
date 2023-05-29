const mapRow = (row) => {
  return {
    id: row.id,
    userTaskId: row.usertaskid,
    userTaskDocumentId: row.usertaskdocumentid,
    userTaskLinkId: row.usertasklinkid,
    userId: row.userid,
    date: row.date,
  }
}

const list = async (client, data) => {
  try {
    const userTaskId = data.userTaskId;
    if (userTaskId) {
      const query1 = `SELECT id, usertaskid, usertaskdocumentid, usertasklinkid, userid, date
        FROM userTaskHistory
        WHERE usertaskid = $1`
      const params1 = [userTaskId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, usertaskid, usertaskdocumentid, usertasklinkid, userid, date
      FROM userTaskHistory`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, usertaskid, usertaskdocumentid, usertasklinkid, userid, date
      FROM userTaskHistory
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
    const query1 = `'INSERT INTO userTaskHistory 
      (id, usertaskid, usertaskdocumentid, usertasklinkid, userid, date)
      VALUES ($1,$2,$3,$4,$5,$6)';`
    const params1 = [data.id, data.userTaskId, data.userTaskDocumentId, data.userTaskLinkId, data.userId, data.date];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userTaskHistory SET 
      usertaskid = COALESCE($1,usertaskid), 
      usertaskdocumentid = COALESCE($2,usertaskdocumentid), 
      usertasklinkid = COALESCE($3,usertasklinkid), 
      userid = COALESCE($4,userid), 
      date = COALESCE($5,date)
      WHERE id = $6`;
    const params1 = [data.userTaskId, data.userTaskDocumentId, data.userTaskLinkId, data.userId, data.date, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userTaskHistory WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userTaskHistory WHERE userid = $1`;
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
