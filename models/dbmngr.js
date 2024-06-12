// const sqlite = require('better-sqlite3') 
// const db = new sqlite("./roip.db")
// exports.db = db

const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, './roip.db');
const db = new Database(dbPath, { verbose: console.log });

module.exports = {
    db
};
