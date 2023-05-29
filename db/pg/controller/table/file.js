const list = async (client, data) => {
  try {
    const search = data.search || '';
    const query1 = `SELECT id, name, size, mimetype, path FROM file WHERE LOWER(name) LIKE $1`
    const params1 = ['%' + search.toLowerCase() + '%'];
    const res1 = await client.query(query1, params1);
    return res1.rows;
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, name, size, mimetype, path FROM files WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO files (id, name, size, mimetype, path) VALUES ($1,$2,$3,$4,$5)';
    const params1 = [data.id, data.name, data.size, data.mimetype, data.path];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE files SET 
      name = COALESCE($1,name), 
      size = COALESCE($2,size), 
      mimetype = COALESCE($3,mimetype),
      path = COALESCE($4,path)
      WHERE id = $5`;
    const params1 = [data.name, data.size, data.mimetype, data.path, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM files WHERE id = $1`;
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
