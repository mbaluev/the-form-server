const mapRow = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    title: row.title,
    correct: row.correct
  }
}
const mapRowUser = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    title: row.title
  }
}

const list = async (client, data) => {
  try {
    const questionId = data.questionId;
    if (questionId) {
      const query1 = `SELECT id, questionid, title, correct FROM questionOptions WHERE questionid = $1`
      const params1 = [questionId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, questionid, title, correct FROM questionOptions`
    const res1 = await client.query(query1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, questionid, title, correct FROM questionOptions WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO questionOptions (id, questionid, title, correct) VALUES ($1,$2,$3,$4)';
    const dataCorrect = data.correct || false
    const params1 = [data.id, data.questionId, data.title, dataCorrect];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE questionOptions SET 
      questionid = COALESCE($1,questionid), 
      title = COALESCE($2,title),
      correct = COALESCE($3,correct)
      WHERE id = $4`;
    const dataCorrect = data.correct || false
    const params1 = [data.questionId, data.title, dataCorrect, data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM questionOptions WHERE id = $1`;
    const params1 = [id];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}

const listUser = async (client, data) => {
  try {
    const userId = data.userId;
    const questionId = data.questionId;
    if (questionId) {
      const query1 = `SELECT qo.id, qo.questionid, qo.title
       FROM questionOptions qo 
       LEFT JOIN userQuestionAnswers uqa on uqa.optionId = qo.id AND uqa.userId = $1
       WHERE qo.questionid = $2`
      const params1 = [userId, questionId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query2 = `SELECT qo.id, qo.questionid, qo.title
       FROM questionOptions qo 
       LEFT JOIN userQuestionAnswers uqa on uqa.optionId = qo.id AND uqa.userId = $1`
    const params2 = [userId];
    const res2 = await client.query(query2, params2);
    return res2.rows.map(mapRowUser);
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

  listUser
}
