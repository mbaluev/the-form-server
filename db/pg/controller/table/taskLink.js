const mapRow = (row) => {
  return {
    id: row.id,
    taskId: row.taskid,
    title: row.title
  }
}

const list = async (client, data) => {
  try {
    const taskId = data.taskId;
    if (taskId) {
      const query1 = `SELECT id, taskid, title FROM tasklinks WHERE taskid = $1`
      const params1 = [taskId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, taskid, title FROM tasklinks`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, taskid, title FROM tasklinks WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO tasklinks (id, taskid, title) VALUES ($1,$2,$3)';
    const params1 = [data.id, data.taskId, data.title];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE tasklinks SET 
      taskid = COALESCE($1,taskid), 
      title = COALESCE($2,title)
      WHERE id = $3`;
    const params1 = [data.taskId, data.title, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM tasklinks WHERE id = $1`;
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
