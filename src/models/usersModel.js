const db = require('../db');

exports.createUser = async (user, password) => {
  return await db.query(
    `INSERT INTO users (email, "userName", name, password, "creationUser") 
      VALUES ($1, $2, $3, $4, $5)`,
    [user.email, user.userName, user.name, password, 'miguel.vargas']
  );
};

exports.getUser = async (email) => {
  return await db.query(
    `SELECT email, "userName", name, password FROM users where email = $1`,
    [email]
  );
};
