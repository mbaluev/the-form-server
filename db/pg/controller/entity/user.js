const mapRow = (row) => {
  return {
    id: row.id,
    firstname: row.firstname,
    lastname: row.lastname,
    username: row.username,
    active: row.active,
    paid: row.paid,
    admin: row.admin,
    refreshToken: row.refreshtoken
  }
}

const list = async (client, data) => {
  try {
    const search = data.search || '';
    const query1 = `SELECT id, firstname, lastname, username, active, paid, admin FROM users WHERE LOWER(username) LIKE $1`
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
    const query1 = `SELECT id, firstname, lastname, username, password, salt, active, paid, admin, refreshtoken FROM users WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO users (id, firstname, lastname, username, password, salt, active, paid, admin, refreshtoken) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)';
    const params1 = [data.id, data.firstname, data.lastname, data.username, data.password, data.salt, data.active, data.paid, data.admin, data.refreshToken];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE users SET 
      firstname = COALESCE($1,firstname), 
      lastname = COALESCE($2,lastname), 
      username = COALESCE($3,username), 
      password = COALESCE($4,password), 
      salt = COALESCE($5,salt), 
      active = COALESCE($6,active),
      paid = COALESCE($7,paid),
      admin = COALESCE($8,admin),
      refreshtoken = COALESCE($9,refreshtoken)
      WHERE id = $10`;
    const params1 = [data.firstname, data.lastname, data.username, data.password, data.salt, data.active, data.paid, data.admin, data.refreshToken, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM users WHERE id = $1`;
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
