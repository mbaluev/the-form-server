const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid,
  }
}
const mapRowUser = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    documentId: row.documentid,
    complete: row.complete || false,
  }
}

const list = async (client, data) => {
  try {
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT id, blockid, documentid FROM materials WHERE blockid = $1`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, blockid, documentid FROM materials`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, blockid, documentid FROM materials WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO materials (id, blockid, documentid) VALUES ($1,$2,$3)';
    const params1 = [data.id, data.blockId, data.documentId];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE materials SET 
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
    const query1 = `DELETE FROM materials WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}

const listUser = async (client, data) => {
  try {
    const userId = data.userId;
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT m.id, m.blockid, m.documentid, um.complete 
        FROM materials m
        LEFT JOIN userMaterials um ON um.materialId = m.id AND um.userId = $1
        WHERE m.blockid = $2`
      const params1 = [userId, blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRowUser);
    }
    const query1 = `SELECT m.id, m.blockid, m.documentid, um.complete
      FROM materials m
      LEFT JOIN userMaterials um ON um.materialId = m.id AND um.userId = $1`
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
    const query1 = `SELECT m.id, m.blockid, m.documentid, um.complete
      FROM materials m
      LEFT JOIN userMaterials um ON um.materialId = m.id AND um.userId = $1
      WHERE m.id = $2`
    const params1 = [userId, id]
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
