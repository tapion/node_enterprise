const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const pool = new Pool();

module.exports = {
  query: async (text, params) => {
    try {
      return await pool.query(text, params);
    } catch (e) {
      console.log('Database ERROR!!!', e);
      throw e;
    }
  },
  transactions: async (callback) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      try {
        const result = await callback(client);
        client.query('COMMIT');
        return result;
      } catch (e) {
        console.log('Database ERROR!!!', e);
        client.query('ROLLBACK');
        throw e;
      }
    } finally {
      client.release();
    }
  },
};
