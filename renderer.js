

// document.addEventListener('DOMContentLoaded', async () => {
//     window.electron.ipcRenderer.send('request-database');

//     window.electron.ipcRenderer.on('response-database', (event, rows) => {
//         let tableBody = document.getElementById("local-body");

//         // Limpa o corpo da tabela antes de adicionar novos dados
//         tableBody.innerHTML = '';

//         // Itera sobre os dados recebidos e adiciona cada item como uma nova linha na tabela
//         rows.forEach(row => {
//             let newRow = tableBody.insertRow();
//             newRow.insertCell(0).textContent = row.id; // Coluna de ID
//             newRow.insertCell(1).textContent = row.type; // Coluna de Tipo
//             newRow.insertCell(2).textContent = row.name; // Coluna de Nome
//             newRow.insertCell(3).textContent = row.mainRoipId; // Coluna de Main Roip ID
//             newRow.insertCell(4).textContent = row.secundaryRoipId; // Coluna de Secondary Roip ID
//         });
//     });

//     window.electron.ipcRenderer.on('response-database', (event, rows) => {
//         let tableBody = document.getElementById("dashboardConfig-body");

//         // Limpa o corpo da tabela antes de adicionar novos dados
//         tableBody.innerHTML = '';

//         // Itera sobre os dados recebidos e adiciona cada item como uma nova linha na tabela
//         rows.forEach(row => {
//             let newRow = tableBody.insertRow();
//             newRow.insertCell(0).textContent = row.id; 
//             newRow.insertCell(1).textContent = row.operatorId; 
//             newRow.insertCell(2).textContent = row.localAId; 
//             newRow.insertCell(3).textContent = row.localBId; 
//         });
//     });
// });



// document.addEventListener('DOMContentLoaded', async () => {
//     window.electron.ipcRenderer.send('request-database');

//     window.electron.ipcRenderer.on('response-database', (event, rows) => {
//         fillTable(rows, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"]);
//         fillTable(rows, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"]);
//     });
// });

// function fillTable(rows, tableId, columns) {
//     let tableBody = document.getElementById(tableId);

//     // Limpa o corpo da tabela antes de adicionar novos dados
//     tableBody.innerHTML = '';

//     // Itera sobre os dados recebidos e adiciona cada item como uma nova linha na tabela
//     rows.forEach(row => {
//         let newRow = tableBody.insertRow();
//         columns.forEach((column, index) => {
//             newRow.insertCell(index).textContent = row[column]; 
//         });
//     });
// }


document.addEventListener('DOMContentLoaded', async () => {
    window.electron.ipcRenderer.send('request-database');

    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals, dashboardConfigs, roips } = data;

        fillTable(locals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"]);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"]);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"]);
    });
});

function fillTable(rows, tableId, columns) {
    let tableBody = document.getElementById(tableId);

    // Limpa o corpo da tabela antes de adicionar novos dados
    tableBody.innerHTML = '';

    // Itera sobre os dados recebidos e adiciona cada item como uma nova linha na tabela
    rows.forEach(row => {
        let newRow = tableBody.insertRow();
        columns.forEach((column, index) => {
            newRow.insertCell(index).textContent = row[column];
        });
    });
}
