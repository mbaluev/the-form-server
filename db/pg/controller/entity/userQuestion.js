const mapRow = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    userId: row.userid,
    complete: row.complete,
  }
}

const list = async (client) => {
  try {
    const query1 = `SELECT id, questionid, userid, complete FROM userQuestions`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const questionId = data.questionId;
    if (questionId) {
      const query1 = `SELECT id, questionid, userid, complete FROM userQuestions 
        WHERE questionid = $1`
      const params1 = [questionId]
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow)[0];
    }
    const query1 = `SELECT id, questionid, userid, complete FROM userQuestions 
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
    const query1 = 'INSERT INTO userQuestions (id, questionid, userid, complete) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.questionId, data.userId, data.complete];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userQuestions SET 
      questionid = COALESCE($1,questionid), 
      userid = COALESCE($2,userid), 
      complete = COALESCE($3,complete)
      WHERE id = $4`;
    const params1 = [data.questionId, data.userId, data.complete, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userQuestions WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userQuestions WHERE userid = $1`;
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
