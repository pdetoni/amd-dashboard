const { db } = require('./dbmngr');

exports.getLocal = () => {
  const sql = "SELECT * FROM Local";
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erro ao obter os locais:', err.message);
      return [];
    }
    return rows;
  });
};

exports.getDashboardConfig = () => {
  const sql = "SELECT * FROM DashboardConfig";
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erro ao obter as configurações do dashboard:', err.message);
      return [];
    }
    return rows;
  });
};

exports.getRoip = () => {
  const sql = "SELECT * FROM Roip";
  db.all(sql, (err, rows) => {
    if (err) {
      console.error('Erro ao obter os Roips:', err.message);
      return [];
    }
    return rows;
  });
};
