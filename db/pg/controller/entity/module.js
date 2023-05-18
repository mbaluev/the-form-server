const list = async (client, data) => {
  try {
    const search = data.search || '';
    const query1 = `SELECT id, title, name, position FROM modules WHERE LOWER(title) LIKE $1 OR LOWER(name) LIKE $2 ORDER BY position`
    const params1 = ['%' + search.toLowerCase() + '%', '%' + search.toLowerCase() + '%'];
    const res1 = await client.query(query1, params1);
    return res1.rows;
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const blockId = data.blockId;
    const position = data.position;
    if (id) {
      const query1 = `SELECT id, title, name, position FROM modules WHERE id = $1`
      const params1 = [id];
      const res1 = await client.query(query1, params1);
      return res1.rows[0];
    }
    if (blockId) {
      const query1 = `SELECT m.id, m.title, m.name, m.position FROM modules m INNER JOIN blocks b ON b.moduleId = m.id WHERE b.id = $1`
      const params1 = [blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows[0];
    }
    if (position) {
      const query1 = `SELECT id, title, name, position FROM modules WHERE position = $1`
      const params1 = [position];
      const res1 = await client.query(query1, params1);
      return res1.rows[0];
    }
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = `INSERT INTO modules (id, title, name, position) VALUES ($1,$2,$3,$4)`;
    const params1 = [data.id, data.title, data.name, data.position];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE modules set 
      title = COALESCE($1,title), 
      name = COALESCE($2,name),
      position = COALESCE($3,position)
      WHERE id = $4`;
    const params1 = [data.title, data.name, data.position, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM modules WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}

const listUser = async (client, data) => {
  try {
    const search = data.search || '';
    const userId = data.userId;
    const enable = data.enable;
    let query1 = `SELECT m.id, m.title, m.name, m.position, um.enable, um.complete 
      FROM modules m
      INNER JOIN userModules um ON um.moduleId = m.id AND um.userId = $1
      WHERE (LOWER(title) LIKE $2 OR LOWER(name) LIKE $3)`
    const params1 = [userId, '%' + search.toLowerCase() + '%', '%' + search.toLowerCase() + '%'];
    if (enable !== undefined) {
      query1 += ' AND um.enable = $4'
      params1.push(enable);
    }
    query1 += ' ORDER BY position'
    const res1 = await client.query(query1, params1);
    return res1.rows;
  } catch (err) {
    throw err;
  }
}
const getUser = async (client, data) => {
  try {
    const id = data.id;
    const blockId = data.blockId;
    const userId = data.userId;
    if (id) {
      const query1 = `SELECT m.id, m.title, m.name, m.position, um.enable, um.complete 
        FROM modules m
        INNER JOIN userModules um ON um.moduleId = m.id AND um.userId = $1
        WHERE m.id = $2`
      const params1 = [userId, id];
      const res1 = await client.query(query1, params1);
      return res1.rows[0];
    }
    if (blockId) {
      const query1 = `SELECT m.id, m.title, m.name, m.position, um.enable, um.complete 
        FROM modules m
        INNER JOIN blocks b ON b.moduleId = m.id
        LEFT JOIN userModules um ON um.moduleId = m.id AND um.userId = $1
        WHERE b.id = $2`
      const params1 = [userId, blockId];
      const res1 = await client.query(query1, params1);
      return res1.rows[0];
    }
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
