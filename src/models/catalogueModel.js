const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.getAllChildByParent = async (parentId) => {
  return await db.query(
    `SELECT
        id,
        "name",
        status,
        "creationDate",
        "creationUser",
        "modificationDate",
        "modificationUser",
        description,
        abbreviation,
        catalog_id
    FROM
        catalogue
    WHERE catalog_id = $1`,
    [parentId]
  );
};
