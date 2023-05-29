const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid
  }
}
const mapRowUser = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid,
    userTaskId: row.usertaskid,
    complete: row.complete,
    status: row.status
  }
}

const list = async (client, data) => {
  try {
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT id, blockid, documentid FROM tasks WHERE blockid = $1`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, blockid, documentid FROM tasks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, blockid, documentid FROM tasks WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO tasks (id, blockid, documentid) VALUES ($1,$2,$3)';
    const params1 = [data.id, data.blockId, data.documentId];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE tasks SET 
      blockid = COALESCE($1,blockid), 
      documentid = COALESCE($2,documentid)
      WHERE id = $3`;
    const params1 = [data.blockId, data.documentId, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM tasks WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}

const listUser = async (client, data) => {
  try {
    const blockId = data.blockId;
    const userId = data.userId;
    if (blockId) {
      const query1 = `SELECT t.id, t.blockid, t.documentid, ut.complete, ut.status
        FROM tasks t
        LEFT JOIN userTasks ut ON ut.taskId = t.id AND ut.userId = $1 
        WHERE t.blockId = $2`
      const params1 = [userId, blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRowUser);
    }
    const query1 = `SELECT t.id, t.blockid, t.documentid, ut.id as usertaskid, ut.complete, ut.status
      FROM tasks t
      LEFT JOIN userTasks ut ON ut.taskId = t.id 
      WHERE ut.userId = $1`
    const params1 = [userId];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRowUser);
  } catch (err) {
    throw err;
  }
}
const getUser = async (client, data) => {
  try {
    const id = data.id;
    const userId = data.userId;
    const query1 = `SELECT t.id, t.blockid, t.documentid, ut.id as usertaskid, ut.complete, ut.status
      FROM tasks t
      LEFT JOIN userTasks ut ON ut.taskId = t.id AND ut.userId = $1
      WHERE t.id = $2`
    const params1 = [userId, id];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRowUser)[0];
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

  listUser,
  getUser
}
