const mapRow = (row) => {
  return {
    id: row.id,
    moduleId: row.moduleid,
    userId: row.userid,
    enable: row.enable,
    complete: row.complete,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, moduleid, userid, enable, complete FROM userModules`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, moduleid, userid, enable, complete FROM userModules WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO userModules (id, moduleid, userid, enable, complete) VALUES ($1,$2,$3,$4,$5)';
    const params1 = [data.id, data.moduleId, data.userId, data.enable, data.complete];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userModules SET 
      moduleid = COALESCE($1,moduleid), 
      userid = COALESCE($2,userid), 
      enable = COALESCE($3,enable), 
      complete = COALESCE($4,complete)
      WHERE id = $5`;
    const params1 = [data.moduleId, data.userId, data.enable, data.complete, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userModules WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userModules WHERE userid = $1`;
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
