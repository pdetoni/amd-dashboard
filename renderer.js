document.addEventListener('DOMContentLoaded', async () => {
    // Enviar solicitação ao processo principal para obter dados do banco de dados
    window.electron.ipcRenderer.send('request-database');

    // Receber resposta do processo principal com os dados do banco de dados
    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals, dashboardConfigs, roips } = data;

        fillTable(locals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"], editLocal, deleteLocal);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"], editDashboardConfig, deleteDashboardConfig);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"], editRoip, deleteRoip);
    });

    // Adicionar funcionalidade de alternar visibilidade das tabelas ao clicar nos títulos
    const toggleVisibility = (titleId, tableId) => {
        const titleElement = document.getElementById(titleId);
        const tableElement = document.getElementById(tableId);
        const arrowElement = titleElement.querySelector('.arrow');

        titleElement.addEventListener('click', () => {
            tableElement.classList.toggle('hidden');
            arrowElement.classList.toggle('down');
        });
    };

    toggleVisibility('local-title', 'local');
    toggleVisibility('dashboardConfig-title', 'dashboardConfig');
    toggleVisibility('roip-title', 'roip');
});

function fillTable(rows, tableId, columns, editFunction, deleteFunction) {
    let tableBody = document.getElementById(tableId);

    // Limpa o corpo da tabela antes de adicionar novos dados
    tableBody.innerHTML = '';

    // Itera sobre os dados recebidos e adiciona cada item como uma nova linha na tabela
    rows.forEach(row => {
        let newRow = tableBody.insertRow();
        columns.forEach((column, index) => {
            newRow.insertCell(index).textContent = row[column];
        });

        // Adiciona célula com botão de editar
        let editCell = newRow.insertCell(columns.length);
        let editButton = document.createElement('button');
        editButton.className = 'btn btn-warning';
        editButton.textContent = 'Editar';
        editButton.onclick = () => editFunction(row);
        editCell.appendChild(editButton);

        // Adiciona célula com botão de excluir
        let deleteCell = newRow.insertCell(columns.length + 1);
        let deleteButton = document.createElement('button');
        deleteButton.className = 'btn btn-danger';
        deleteButton.textContent = 'Excluir';
        deleteButton.onclick = () => deleteFunction(row.id);
        deleteCell.appendChild(deleteButton);
    });
}

function editLocal(row) {
    // Lógica para editar um item local
    console.log('Edit local:', row);
    document.getElementById('localModalLabel').textContent = `Editando Local: ${row.id}`;
    // Preencher o conteúdo do modal com os dados do local
    // document.getElementById('localModalBody').innerHTML = `<p>ID: ${row.id}</p><p>Type: ${row.type}</p><p>Name: ${row.name}</p>`;
    // Abre o modal local
    new bootstrap.Modal(document.getElementById('localModal')).show();
}

function deleteLocal(id) {
    // Lógica para excluir um item local
    console.log('Delete local with id:', id);
    window.electron.ipcRenderer.send('delete-local', id);
}

function editDashboardConfig(row) {
    // Lógica para editar uma configuração de dashboard
    console.log('Edit dashboard config:', row);
    document.getElementById('dashboardConfigModalLabel').textContent = `Editando Configuração: ${row.id}`;
    // Preencher o conteúdo do modal com os dados da configuração
    // document.getElementById('dashboardConfigModalBody').innerHTML = `<p>ID: ${row.id}</p><p>Operator ID: ${row.operatorId}</p>`;
    // Abre o modal de configuração do dashboard
    new bootstrap.Modal(document.getElementById('dashboardConfigModal')).show();
}

function deleteDashboardConfig(id) {
    // Lógica para excluir uma configuração de dashboard
    console.log('Delete dashboard config with id:', id);
    window.electron.ipcRenderer.send('delete-dashboard-config', id);
}

function editRoip(row) {
    // Lógica para editar um roip
    console.log('Edit roip:', row);
    document.getElementById('roipModalLabel').textContent = `Editando Roip: ${row.id}`;
    // Preencher o conteúdo do modal com os dados do roip
    // document.getElementById('roipModalBody').innerHTML = `<p>ID: ${row.id}</p><p>Name: ${row.name}</p>`;
    // Abre o modal roip
    new bootstrap.Modal(document.getElementById('roipModal')).show();
}

function deleteRoip(id) {
    // Lógica para excluir um roip
    console.log('Delete roip with id:', id);
    window.electron.ipcRenderer.send('delete-roip', id);
}
