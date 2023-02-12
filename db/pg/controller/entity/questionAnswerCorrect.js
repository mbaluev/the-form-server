const mapRow = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    questionAnswerId: row.questionanswerid
  }
}

const list = async (client, data) => {
  try {
    const questionId = data.questionId;
    if (questionId) {
      const query1 = `SELECT id, questionid, questionanswerid FROM questionAnswersCorrect WHERE questionid = $1`
      const params1 = [questionId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, questionid, questionanswerid FROM questionAnswersCorrect`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, questionid, questionanswerid FROM questionAnswersCorrect WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO questionAnswersCorrect (id, questionid, questionanswerid) VALUES ($1,$2,$3)';
    const params1 = [data.id, data.questionId, data.questionAnswerId];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE questionAnswersCorrect SET 
      questionid = COALESCE($1,questionid), 
      questionanswerid = COALESCE($2,questionanswerid)
      WHERE id = $3`;
    const params1 = [data.questionId, data.questionAnswerId, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM questionAnswersCorrect WHERE id = $1`;
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
