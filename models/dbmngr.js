const sqlite3 = require('sqlite3').verbose();
const path = require('node:path');

const dbPath = path.join(__dirname, 'roip.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados:', err.message);
  }
});

exports.db = db;


