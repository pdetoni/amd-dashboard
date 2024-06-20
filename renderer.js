document.addEventListener('DOMContentLoaded', async () => {
    window.electron.ipcRenderer.send('request-database');

    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals, dashboardConfigs, roips } = data;

        fillTable(locals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"], editLocal, deleteLocal);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"], editDashboardConfig);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"], editRoip, deleteRoip);

        document.getElementById('local').classList.remove('hidden');
        document.getElementById('dashboardConfig').classList.remove('hidden');
        document.getElementById('roip').classList.remove('hidden');
    });

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

    // Função para enviar dados editados
    const sendData = (channel, data) => {
        window.electron.ipcRenderer.send(channel, data);
    };

    // Lidar com envio de formulário do modal de Local
    document.getElementById('save-local-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('localModal').dataset.id,
            type: document.getElementById('type-input').value,
            name: document.getElementById('name-input').value,
            mainRoipId: document.getElementById('main-input').value,
            secundaryRoipId: document.getElementById('sec-input').value,
        };
        sendData('edit-local', data);
        bootstrap.Modal.getInstance(document.getElementById('localModal')).hide();
        location.reload();
    });

    // Lidar com envio de formulário do modal de DashboardConfig
    document.getElementById('save-dashboardConfig-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('dashboardConfigModal').dataset.id,
            operatorId: document.getElementById('operator-input').value,
            localAId: document.getElementById('a-input').value,
            localBId: document.getElementById('b-input').value,
        };
        sendData('edit-dashboardConfig', data);
        bootstrap.Modal.getInstance(document.getElementById('dashboardConfigModal')).hide();
        location.reload();
    });

    // Lidar com envio de formulário do modal de Roip
    document.getElementById('save-roip-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('roipModal').dataset.id,
            name: document.getElementById('rname-input').value,
            ip: document.getElementById('ip-input').value,
            mac: document.getElementById('mac-input').value,
        };
        sendData('edit-roip', data);
        bootstrap.Modal.getInstance(document.getElementById('roipModal')).hide();
        location.reload();
    });
});

function fillTable(rows, tableId, columns, editFunction, deleteFunction) {
    let tableBody = document.getElementById(tableId);

    tableBody.innerHTML = '';

    rows.forEach(row => {
        let newRow = tableBody.insertRow();
        columns.forEach((column, index) => {
            newRow.insertCell(index).textContent = row[column];
        });

        let editCell = newRow.insertCell(columns.length);
        let editButton = document.createElement('button');
        editButton.className = 'btn btn-warning';
        editButton.textContent = 'Editar';
        editButton.onclick = () => editFunction(row);
        editCell.appendChild(editButton);

        if (deleteFunction) {
            let deleteCell = newRow.insertCell(columns.length + 1);
            let deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger';
            deleteButton.textContent = 'Excluir';
            deleteButton.onclick = () => deleteFunction(row.id);
            deleteCell.appendChild(deleteButton);
        }
    });
}

function editLocal(row) {
    document.getElementById('localModal').dataset.id = row.id;
    document.getElementById('type-input').value = row.type;
    document.getElementById('name-input').value = row.name;
    document.getElementById('main-input').value = row.mainRoipId;
    document.getElementById('sec-input').value = row.secundaryRoipId;
    new bootstrap.Modal(document.getElementById('localModal')).show();
}

function deleteLocal(id) {
    window.electron.ipcRenderer.send('delete-local', id);
}

function editDashboardConfig(row) {
    document.getElementById('dashboardConfigModal').dataset.id = row.id;
    document.getElementById('operator-input').value = row.operatorId;
    document.getElementById('a-input').value = row.localAId;
    document.getElementById('b-input').value = row.localBId;
    new bootstrap.Modal(document.getElementById('dashboardConfigModal')).show();
}

function editRoip(row) {
    document.getElementById('roipModal').dataset.id = row.id;
    document.getElementById('rname-input').value = row.name;
    document.getElementById('ip-input').value = row.ip;
    document.getElementById('mac-input').value = row.mac;
    new bootstrap.Modal(document.getElementById('roipModal')).show();
}

function deleteRoip(id) {
    window.electron.ipcRenderer.send('delete-roip', id);
}
