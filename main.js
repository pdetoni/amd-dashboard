// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, './preload.js'),
      contextIsolation: true,
      enableRemoteModule: false
    },
  })


  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  mainWindow.webContents.openDevTools()

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('request-database', (event) => {
  const dbPath = path.join(__dirname, 'roip.db'); // Caminho para o banco de dados
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Erro ao abrir o banco de dados:', err.message);
      event.reply('response-database', []); // Envie uma resposta vazia em caso de erro
      return;
    }

    db.all("SELECT * FROM Local", (err, rows) => {
      if (err) {
        console.error(err.message);
        event.reply('response-database', []); // Envie uma resposta vazia em caso de erro
      } else {
        event.reply('response-database', rows); // Envie os resultados de volta para o processo de renderização
      }

      db.close((err) => {
        if (err) {
          console.error('Erro ao fechar o banco de dados:', err.message);
        }
      });
    });
  });
});