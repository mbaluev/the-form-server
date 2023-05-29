getQuery = (base, data) => {
  let where = ''
  let index = 1;
  const params = []
  for (let key in data) {
    where += `${index === 1 ? 'WHERE' : ' AND' } ${key} = $${index}`
    index += 1;
    const value = data[key];
    params.push(value);
  }
  return { query: `${base} ${where}`, params };
}

module.exports = getQuery