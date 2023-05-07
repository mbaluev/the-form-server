const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid
  }
}
const mapRowUser = (row) => {
  const min = 1;
  const max = 4;
  let status = Math.floor(Math.random() * (max - min + 1) + min);
  switch (status) {
    case 1: status = undefined; break;
    case 2: status = 'done'; break;
    case 3: status = 'sent'; break;
    case 4: status = 'inbox'; break;
  }
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid,
    status
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
    if (blockId) {
      const query1 = `SELECT id, blockid, documentid FROM tasks WHERE blockid = $1`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRowUser);
    }
    const query1 = `SELECT id, blockid, documentid FROM tasks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRowUser);
  } catch (err) {
    throw err;
  }
}
const getUser = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, blockid, documentid FROM tasks WHERE id = $1`
    const params1 = [id]
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
