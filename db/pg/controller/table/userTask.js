const mapRow = (row) => {
  return {
    id: row.id,
    taskId: row.taskid,
    userId: row.userid,
    complete: row.complete,
    status: row.status,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, taskid, userid, complete, status FROM userTasks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const taskId = data.taskId;
    if (taskId) {
      const query1 = `SELECT id, taskid, userid, complete, status FROM userTasks 
        WHERE taskid = $1`
      const params1 = [taskId]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
    const query1 = `SELECT id, taskid, userid, complete, status FROM userTasks  
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
    const query1 = 'INSERT INTO userTasks (id, taskid, userid, complete, status) VALUES ($1,$2,$3,$4,$5)';
    const params1 = [data.id, data.taskId, data.userId, data.complete, data.status];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userTasks SET 
      taskid = COALESCE($1,taskid), 
      userid = COALESCE($2,userid), 
      complete = COALESCE($4,complete)
      status = COALESCE($5,status)
      WHERE id = $4`;
    const params1 = [data.taskId, data.userId, data.status, data.complete, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userTasks WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userTasks WHERE userid = $1`;
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
