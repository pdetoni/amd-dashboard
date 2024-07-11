const { db } = require('./dbmngr');

exports.getLocal = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Local";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Erro ao obter os locais:', err.message);
        reject([]);
      }
      resolve(rows);
    });
  });
};

exports.getDashboardConfig = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM DashboardConfig";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Erro ao obter as configurações do dashboard:', err.message);
        reject([]);
      }
      resolve(rows);
    });
  });
};

exports.getRoip = () => {
  return new Promise((resolve, reject) => {
    const sql = "SELECT * FROM Roip";
    db.all(sql, (err, rows) => {
      if (err) {
        console.error('Erro ao obter os Roips:', err.message);
        reject([]);
      }
      resolve(rows);
    });
  });
};

exports.deleteLocal = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Local WHERE id = ?";
    db.run(sql, id, (err) => {
      if (err) {
        console.error('Erro ao excluir local:', err.message);
        reject(err);
      }
      resolve();
    });
  });
};

exports.deleteDashboardConfig = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM DashboardConfig WHERE id = ?";
    db.run(sql, id, (err) => {
      if (err) {
        console.error('Erro ao excluir configuração do dashboard:', err.message);
        reject(err);
      }
      resolve();
    });
  });
};

exports.deleteRoip = (id) => {
  return new Promise((resolve, reject) => {
    const sql = "DELETE FROM Roip WHERE id = ?";
    db.run(sql, id, (err) => {
      if (err) {
        console.error('Erro ao excluir Roip:', err.message);
        reject(err);
      }
      resolve();
    });
  });
};
