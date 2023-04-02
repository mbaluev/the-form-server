const mapRow = (row) => {
  return {
    id: row.id,
    materialId: row.materialid,
    userId: row.userid,
    complete: row.complete,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, materialid, userid, complete FROM userMaterials`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const materialId = data.materialId;
    const userId = data.userId;
    if (id) {
      const query1 = `SELECT id, materialid, userid, complete FROM userMaterials WHERE id = $1`
      const params1 = [id]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
    if (materialId && userId) {
      const query1 = `SELECT id, materialid, userid, complete 
        FROM userMaterials WHERE materialid = $1 and userid = $2`
      const params1 = [materialId, userId]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO userMaterials (id, materialid, userid, complete) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.materialId, data.userId, data.complete];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userMaterials SET 
      materialid = COALESCE($1,materialid), 
      userid = COALESCE($2,userid), 
      complete = COALESCE($3,complete)
      WHERE id = $4`;
    const params1 = [data.materialId, data.userId, data.complete, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userMaterials WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userMaterials WHERE userid = $1`;
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
