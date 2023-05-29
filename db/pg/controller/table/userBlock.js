const mapRow = (row) => {
  return {
    id: row.id,
    blockId: row.blockid,
    userId: row.userid,
    enable: row.enable,
    complete: row.complete,
    completeMaterials: row.completematerials,
    completeQuestions: row.completequestions,
    completeTasks: row.completetasks,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, blockid, userid, enable, complete, completeMaterials, completeQuestions, completeTasks FROM userBlocks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const blockId = data.blockId;
    if (id) {
      const query1 = `SELECT id, blockid, userid, enable, complete, completeMaterials, completeQuestions, completeTasks 
        FROM userBlocks WHERE id = $1`
      const params1 = [id]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
    if (blockId) {
      const query1 = `SELECT id, blockid, userid, enable, complete, completeMaterials, completeQuestions, completeTasks 
        FROM userBlocks WHERE blockid = $1`
      const params1 = [blockId]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO userBlocks (id, blockid, userid, enable, complete, completeMaterials, completeQuestions, completeTasks) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)';
    const params1 = [data.id, data.blockId, data.userId, data.enable, data.complete, data.completeMaterials, data.completeQuestions, data.completeTasks];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userBlocks SET 
      blockid = COALESCE($1,blockid), 
      userid = COALESCE($2,userid), 
      enable = COALESCE($3,enable), 
      complete = COALESCE($4,complete),
      completematerials = COALESCE($5,completematerials),
      completequestions = COALESCE($6,completequestions),
      completetasks = COALESCE($7,completetasks)
      WHERE id = $8`;
    const params1 = [data.blockId, data.userId, data.enable, data.complete, data.completeMaterials, data.completeQuestions, data.completeTasks, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userBlocks WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userBlocks WHERE userid = $1`;
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
