const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    title: row.title
  }
}

const list = async (client, data) => {
  try {
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT id, blockid, title FROM questions WHERE blockid = $1`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, blockid, title FROM questions`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, blockid, title FROM questions WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO questions (id, blockid, title) VALUES ($1,$2,$3)';
    const params1 = [data.id, data.blockId, data.title];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE questions SET 
      blockid = COALESCE($1,blockid), 
      title = COALESCE($2,title)
      WHERE id = $3`;
    const params1 = [data.blockId, data.title, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM questions WHERE id = $1`;
    const params1 = [id];
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
  del
}
