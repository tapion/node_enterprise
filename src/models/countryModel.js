const dotenv = require('dotenv');
const db = require('../db');

dotenv.config({ path: './config.env' });

exports.citiesByCountry = async (country) => {
  return await db.query(
    `SELECT c.id 
    , c.city || ' - ' || c."zone" AS name
    , c.city 
    , c."zone" 
    FROM cities c 
    INNER JOIN countries c2 ON c2.iso = c."countryIso"
      AND c2.iso = $1 AND c2.deleted = FALSE AND c2.state = TRUE 
    WHERE c.deleted = FALSE AND c.state = TRUE 
    ORDER BY upper(city),upper(c."zone")  `,
    [country]
  );
};
exports.countries = async () => {
  return await db.query(
    `SELECT 
    c.iso AS "isoCod",
    c."name" 
    FROM countries c 
    WHERE c.deleted = FALSE 
    AND c.state = TRUE 
    ORDER BY upper(c."name" )`
  );
};
