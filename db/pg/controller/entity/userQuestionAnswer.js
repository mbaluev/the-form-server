const mapRow = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    questionAnswerId: row.questionanswerid,
    userId: row.userid,
    correct: row.correct
  }
}

const list = async (client, data) => {
  try {
    const questionId = data.questionId;
    const userId = data.userId;
    if (questionId) {
      const query1 = `SELECT id, questionid, questionanswerid, userid, correct
        FROM userQuestionAnswers
        WHERE questionid = $1 AND userid = $2`
      const params1 = [questionId, userId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, questionid, questionanswerid, userid, correct
      FROM userQuestionAnswers
      WHERE userid = $1`
    const params1 = [userId];
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow);
  } catch (err) {
    throw err;
  }
}
const get = async (client, data) => {
  try {
    const id = data.id;
    const query1 = `SELECT id, questionid, questionanswerid, userid, correct
      FROM userQuestionAnswers WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = `INSERT INTO userQuestionAnswers (id, questionid, questionanswerid, userid, correct)
      VALUES ($1,$2,$3,$4,$5)`;
    const params1 = [data.id, data.questionId, data.questionAnswerId, data.userId, data.correct];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const update = async (client, data) => {
  try {
    const query1 = `UPDATE userQuestionAnswers SET 
      questionid = COALESCE($1,questionid), 
      questionanswerid = COALESCE($2,questionanswerid),
      userid = COALESCE($3,userid),
      correct = COALESCE($4,correct)
      WHERE id = $5`;
    const params1 = [data.questionId, data.questionAnswerId, data.userId, data.correct , data.id];
    await client.query(query1, params1);
    return data;
  } catch (err) {
    throw err;
  }
}
const del = async (client, id) => {
  try {
    const query1 = `DELETE FROM userQuestionAnswers WHERE id = $1`;
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
