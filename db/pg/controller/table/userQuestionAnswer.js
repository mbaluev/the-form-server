const mapRow = (row) => {
  return {
    id: row.id,
    questionId: row.questionid,
    optionId: row.optionid,
    userId: row.userid
  }
}

const list = async (client, data) => {
  try {
    const { questionId, userId } = data
    if (questionId) {
      const query1 = `SELECT uqa.id, uqa.questionid, uqa.optionid, uqa.userid 
        FROM userQuestionAnswers uqa
        INNER JOIN questionOptions qo ON qo.id = uqa.optionid
        INNER JOIN questions as q ON q.id = qo.questionid
        WHERE q.id = $1 AND uqa.userid = $2`
      const params1 = [questionId, userId];
      const res1 = await client.query(query1, params1);
      return res1.rows.map(mapRow);
    }
    const query1 = `SELECT id, questionid, optionid, userid 
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
    const query1 = `SELECT id, questionid, optionid, userid FROM userQuestionAnswers WHERE id = $1`
    const params1 = [id]
    const res1 = await client.query(query1, params1);
    return res1.rows.map(mapRow)[0];
  } catch (err) {
    throw err;
  }
}
const create = async (client, data) => {
  try {
    const query1 = 'INSERT INTO userQuestionAnswers (id, questionid, optionid, userid) VALUES ($1,$2,$3,$4)';
    const params1 = [data.id, data.questionId, data.optionId, data.userId];
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
      optionid = COALESCE($2,optionid), 
      userid = COALESCE($3,userid)
      WHERE id = $4`;
    const params1 = [data.questionId, data.optionId, data.userId, data.id];
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
const delByUserId = async (client, userId) => {
  try {
    const query1 = `DELETE FROM userQuestionAnswers WHERE userid = $1`;
    const params1 = [userId];
    await client.query(query1, params1);
    return true;
  } catch (err) {
    throw err;
  }
}
const delByQuestionIdUserId = async (client, questionId, userId) => {
  try {
    const query1 = `DELETE FROM userQuestionAnswers 
      WHERE questionid = $1 AND userid = $2`;
    const params1 = [questionId, userId];
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
  delByUserId,
  delByQuestionIdUserId
}
