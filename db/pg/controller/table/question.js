const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    title: row.title,
    position: row.position
  }
}
const mapRowUser = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    title: row.title,
    position: row.position,
    complete: row.complete,
  }
}

const list = async (client, data) => {
  try {
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT id, blockid, title, position 
        FROM questions WHERE blockid = $1
        ORDER BY position`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, blockid, title, position
      FROM questions
      ORDER BY position`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, blockid, title, position FROM questions WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO questions (id, blockid, title, position) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.blockId, data.title, data.position];
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
      title = COALESCE($2,title),
      position = COALESCE($3,position)
      WHERE id = $4`;
    const params1 = [data.blockId, data.title, data.position, data.id];
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

const listUser = async (client, data) => {
  try {
    const userId = data.userId;
    const blockId = data.blockId;
    if (blockId) {
      const query1 = `SELECT q.id, q.blockid, q.title, q.position, uq.complete 
        FROM questions q
        LEFT JOIN userQuestions uq ON uq.questionId = q.id AND uq.userId = $1
        WHERE q.blockid = $2`
      const params1 = [userId, blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRowUser);
    }
    const query1 = `SELECT q.id, q.blockid, q.title, q.position, uq.complete
      FROM questions q
      LEFT JOIN userQuestions uq ON uq.questionId = q.id AND uq.userId = $1`
    const params1 = [userId];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRowUser);
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

  listUser
}
