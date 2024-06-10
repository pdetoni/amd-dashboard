const sqlite = require('better-sqlite3') 
const db = new sqlite("./roip.db")
exports.db = db