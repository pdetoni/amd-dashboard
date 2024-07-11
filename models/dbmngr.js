const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const dbPath = path.join(__dirname, 'roip.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  }
});

exports.db = db;

exports.getLocal = () => {
  try {
    const sql = "SELECT * FROM Local";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Erro ao obter os locais:', err.message);
        return [];
      }
      return rows;
    });
  } catch (error) {
    console.error('Error fetching Local data:', error.message);
    return []; // Return an empty array or handle error as per your application's logic
  }
};
