const mapRow = (row) => {
  return {
    id: row.id,
    taskLinkId: row.tasklinkid,
    userId: row.userid,
    url: row.url,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, tasklinkid, userid, url FROM userTaskLinks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, tasklinkid, userid, url FROM userTaskLinks  
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
    const query1 = 'INSERT INTO userTaskLinks (id, tasklinkid, userid, url) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.taskLinkId, data.userId, data.url];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userTaskLinks SET 
      tasklinkid = COALESCE($1,tasklinkid), 
      userid = COALESCE($2,userid), 
      url = COALESCE($3,url)
      WHERE id = $4`;
    const params1 = [data.taskLinkId, data.userId, data.url, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userTaskLinks WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userTaskLinks WHERE userid = $1`;
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
