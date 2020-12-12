const db = require('../db');

exports.saveTemplate = async (body,user) => {
    return db.query(
        `INSERT INTO templates
            (name, description, "template", state, "creationUser")
            VALUES($1, $2, $3, $4, $5)
        RETURNING id;`,
        [body.name, body.description, body.template, body.state,user.userName]
      );
}