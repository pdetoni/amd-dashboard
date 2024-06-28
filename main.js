// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('request-database', (event) => {
  const dbPath = path.join(__dirname, 'roip.db'); // Caminho para o banco de dados
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao abrir o banco de dados:', err.message);
      event.reply('response-database', { locals: [], dashboardConfigs: [], roips: [] }); // Envie uma resposta vazia em caso de erro
      return;
    }

    let localsPromise = new Promise((resolve, reject) => {
      db.all('SELECT * FROM Local', (err, rows) => {
        if (err) {
          console.error('Erro ao obter os locais:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    let dashboardConfigsPromise = new Promise((resolve, reject) => {
      db.all('SELECT * FROM DashboardConfig', (err, rows) => {
        if (err) {
          console.error('Erro ao obter as configurações do dashboard:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    let roipsPromise = new Promise((resolve, reject) => {
      db.all('SELECT * FROM Roip', (err, rows) => {
        if (err) {
          console.error('Erro ao obter os Roips:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });

    Promise.all([localsPromise, dashboardConfigsPromise, roipsPromise])
      .then((values) => {
        const [locals, dashboardConfigs, roips] = values;
        event.reply('response-database', { locals, dashboardConfigs, roips }); // Envie os resultados de volta para o processo de renderização
      })
      .catch((err) => {
        event.reply('response-database', { locals: [], dashboardConfigs: [], roips: [] }); // Envie uma resposta vazia em caso de erro
      })
      .finally(() => {
        db.close((err) => {
          if (err) {
            console.error('Erro ao fechar o banco de dados:', err.message);
          }
        });
      });
  });
});

ipcMain.on('edit-local', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { id, type, name, mainRoipId, secundaryRoipId } = data;
  console.log('Dados recebidos: ', data);
  db.run(
    'UPDATE Local SET type = ?, name = ?, mainRoipId = ?, secundaryRoipId = ? WHERE id = ?',
    [type, name, mainRoipId, secundaryRoipId, id],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar o local:', err.message);
      }else {
        console.log('Local updated successfully'); // Verificar se a consulta de atualização está sendo executada corretamente
      }
      event.reply('request-database');
      db.close();
    }
  );
});

ipcMain.on('update-locals', async (event, updatedLocals) => {
  try {
      for (let local of updatedLocals) {
          await db.run(
              `UPDATE local SET name = ?, mainRoipId = ? WHERE id = ?`,
              [local.name, local.mainRoipId, local.id]
          );
      }
      event.reply('update-locals-success', { status: 'success' });
  } catch (error) {
      console.error('Erro ao atualizar locais:', error);
      event.reply('update-locals-failure', { status: 'failure', error: error.message });
  }
});

ipcMain.on('edit-dashboardConfig', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { id, operatorId, localAId, localBId } = data;
  db.run(
    'UPDATE DashboardConfig SET operatorId = ?, localAId = ?, localBId = ? WHERE id = ?',
    [operatorId, localAId, localBId, id],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar a configuração do dashboard:', err.message);
      }
      event.reply('request-database');
      db.close();
    }
  );
});

ipcMain.on('edit-roip', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { id, name, ip, mac } = data;
  db.run(
    'UPDATE Roip SET name = ?, ip = ?, mac = ? WHERE id = ?',
    [name, ip, mac, id],
    (err) => {
      if (err) {
        console.error('Erro ao atualizar o Roip:', err.message);
      }
      event.reply('request-database');
      db.close();
    }
  );
});

ipcMain.on('delete-local', (event, id) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  db.run('DELETE FROM Local WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir o local:', err.message);
    }
    event.reply('request-database');
    db.close();
  });
});

ipcMain.on('delete-dashboardConfig', (event, id) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  db.run('DELETE FROM DashboardConfig WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir a configuração do dashboard:', err.message);
    }
    event.reply('request-database');
    db.close();
  });
});

ipcMain.on('delete-roip', (event, id) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  db.run('DELETE FROM Roip WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('Erro ao excluir o Roip:', err.message);
    }
    event.reply('request-database');
    db.close();
  });
});

// Handler para adicionar um novo Local
ipcMain.on('add-local', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { type, name, mainRoipId, secundaryRoipId } = data;
  db.run(
    'INSERT INTO Local (type, name, mainRoipId, secundaryRoipId) VALUES (?, ?, ?, ?)',
    [type, name, mainRoipId, secundaryRoipId],
    (err) => {
      if (err) {
        console.error('Erro ao adicionar o local:', err.message);
      }
      event.reply('request-database');
      db.close();
    }
  );
});

// Handler para adicionar um novo DashboardConfig
ipcMain.on('add-dashboardConfig', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { operatorId, localAId, localBId } = data;
  db.run(
    'INSERT INTO DashboardConfig (operatorId, localAId, localBId) VALUES (?, ?, ?)',
    [operatorId, localAId, localBId],
    (err) => {
      if (err) {
        console.error('Erro ao adicionar a configuração do dashboard:', err.message);
      }
      event.reply('request-database');
      db.close();
    }
  );
});

// Handler para adicionar um novo Roip
ipcMain.on('add-roip', (event, data) => {
  const dbPath = path.join(__dirname, 'roip.db');
  const db = new sqlite3.Database(dbPath);
  const { name, ip, mac } = data;
  db.run(
    'INSERT INTO Roip (name, ip, mac) VALUES (?, ?, ?)',
    [name, ip, mac],
    (err) => {
      if (err) {
        console.error('Erro ao adicionar o Roip:', err.message);
      }
      event.reply('request-database');
      db.close();
    }
  );
});

