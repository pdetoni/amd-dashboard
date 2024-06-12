var dbmngr = require("./dbmngr");
var db = dbmngr.db;

exports.getLocal = () => {
    const sql  = "SELECT * FROM Local";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}

exports.getDashboardConfig = () => {
    const sql  = "SELECT * FROM DashboardConfig";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}

exports.getRoip = () => {
    const sql  = "SELECT * FROM Roip";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
}


