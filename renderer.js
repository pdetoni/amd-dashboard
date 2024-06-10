/**
 * This file is loaded via the <script> tag in the index.html file and will
 * be executed in the renderer process for that window. No Node.js APIs are
 * available in this process because `nodeIntegration` is turned off and
 * `contextIsolation` is turned on. Use the contextBridge API in `preload.js`
 * to expose Node.js functionality from the main process.
 */

// const { ipcRenderer } = require('electron');

// window.electron.ipcRenderer.send('request-database');

// window.electron.ipcRenderer.on('response-database', (event, rows) => {
//   console.log(rows);
// });

document.addEventListener('DOMContentLoaded', async () => {

    window.electron.ipcRenderer.send('request-database');

    window.electron.ipcRenderer.on('response-database', (event, rows) => {

    //let names = window.electron.getNames();

    let names = rows.map(row => row.name);

    let divnames = document.getElementById("names");

    let nameString = names.join("<br />");

    divnames.innerHTML = nameString;

    })
})
