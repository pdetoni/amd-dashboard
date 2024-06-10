// /**
//  * The preload script runs before `index.html` is loaded
//  * in the renderer. It has access to web APIs as well as
//  * Electron's renderer process modules and some polyfilled
//  * Node.js functions.
//  *
//  * https://www.electronjs.org/docs/latest/tutorial/sandbox
//  */
const { contextBridge, ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const testMngr = require("./models/testmngr");

// Expor APIs do Node.js para o contexto do renderizador
contextBridge.exposeInMainWorld('electron', {
  fs: {
    readFileSync: (filePath) => fs.readFileSync(filePath, 'utf-8')
  },
  ipcRenderer: {
    send: (channel, data) => ipcRenderer.send(channel, data), // Adiciona função para enviar mensagem IPC
    // Se você precisar de mais funções IPC, adicione-as aqui
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(event, ...args))
  },
  path: {
    join: (...args) => path.join(...args)
  },
  getNames: () => {
    const sql  = "SELECT * FROM Local";
    let stmt = db.prepare(sql);
    let res = stmt.all();
    return res;
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});


const getNames = () => {
  return testMngr.getNames();
}

contextBridge.exposeInMainWorld("api",{
  getNames: getNames
})


