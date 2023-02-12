const mapRow = (row) => {
  return {
    id: row.id,
    moduleId: row.moduleid,
    title: row.title,
    name: row.name,
    position: row.position
  }
}

const list = async (client, data) => {
  try {
    const search = data.search || '';
    const moduleId = data.moduleId;
    let query1 = `SELECT b.id, b.moduleId, b.title, b.name, b.position
      FROM blocks b 
      INNER JOIN modules m ON m.id = b.moduleId 
      WHERE (LOWER(b.title) LIKE $1 OR LOWER(b.name) LIKE $2)`
    const params1 = ['%' + search.toLowerCase() + '%', '%' + search.toLowerCase() + '%'];
    if (moduleId) {
      query1 += " AND b.moduleId = $3";
      params1.push(moduleId);
    }
    query1 += ` ORDER BY m.position, b.position`
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, moduleId, title, name, position FROM blocks WHERE id = $1`
    const params1 = [id];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO blocks (id, moduleId, title, name, position) VALUES ($1,$2,$3,$4,$5)';
    const params1 = [data.id, data.moduleId, data.title, data.name, data.position];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE blocks SET
      moduleId = COALESCE($1,moduleId), 
      title = COALESCE($2,title), 
      name = COALESCE($3,name),
      position = COALESCE($4,position)
      WHERE id = $5`;
    const params1 = [data.moduleId, data.title, data.name, data.position, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM blocks WHERE id = $1`;
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
