var dbmngr = require("./dbmngr");
var db = dbmngr.db;

exports.getNames = () => {
    const sql  = "SELECT * FROM Local";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}
