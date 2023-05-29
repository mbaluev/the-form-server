const mapRow = (row) => {
  return {
    id: row.id,
    fileId: row.fileid,
    name: row.name,
    description: row.description
  }
}

const list = async (client, data) => {
  try {
    const search = data.search || '';
    const query1 = `SELECT id, fileid, name, description FROM documents WHERE LOWER(name) LIKE $1 OR LOWER(description) LIKE $2`
    const params1 = ['%' + search.toLowerCase() + '%', '%' + search.toLowerCase() + '%'];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, fileid, name, description FROM documents WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO documents (id, fileid, name, description) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.fileId, data.name, data.description];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE documents SET 
      fileid = COALESCE($1,fileid), 
      name = COALESCE($2,name), 
      description = COALESCE($3,description)
      WHERE id = $4`;
    const params1 = [data.fileId, data.name, data.description, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM documents WHERE id = $1`;
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
