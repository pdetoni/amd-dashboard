document.addEventListener('DOMContentLoaded', async () => {
    window.electron.ipcRenderer.send('request-database');

    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals, dashboardConfigs, roips } = data;

        fillTable(locals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"], editLocal, deleteLocal);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"], editDashboardConfig);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"], editRoip, deleteRoip);

        document.getElementById('local').style.display = '';
        document.getElementById('add-local-btn').style.display = '';
        document.getElementById('dashboardConfig').style.display = '';
        document.getElementById('add-dashboardConfig-btn').style.display = '';
        document.getElementById('roip').style.display = '';
        document.getElementById('add-roip-btn').style.display = '';
    });

    const toggleVisibility = (titleId, tableId, buttonId) => {
        const titleElement = document.getElementById(titleId);
        const tableElement = document.getElementById(tableId);
        const buttonElement = document.getElementById(buttonId);
        const arrowElement = titleElement.querySelector('.arrow');

        titleElement.addEventListener('click', () => {
            const isHidden = tableElement.style.display === 'none';
            tableElement.style.display = isHidden ? '' : 'none';
            buttonElement.style.display = isHidden ? '' : 'none';
            arrowElement.classList.toggle('down', isHidden);
        });
    };

    toggleVisibility('local-title', 'local', 'add-local-btn');
    toggleVisibility('dashboardConfig-title', 'dashboardConfig', 'add-dashboardConfig-btn');
    toggleVisibility('roip-title', 'roip', 'add-roip-btn');

    // Function to send edited data
    const sendData = (channel, data) => {
        window.electron.ipcRenderer.send(channel, data);
    };

    // Handle form submission for Local modal
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

    // Handle form submission for DashboardConfig modal
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

    // Handle form submission for Roip modal
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

    // Handle confirmed deletion
    document.getElementById('delete-btn').addEventListener('click', () => {
        const id = document.getElementById('excluirModal').dataset.id;
        sendData('delete-roip', id);
        bootstrap.Modal.getInstance(document.getElementById('excluirModal')).hide();
        location.reload();
    });

    // Handle "Add Local" button click
    document.getElementById('add-local-btn').addEventListener('click', () => {
        document.getElementById('localModal').dataset.id = '';
        document.getElementById('type-input').value = '';
        document.getElementById('name-input').value = '';
        document.getElementById('main-input').value = '';
        document.getElementById('sec-input').value = '';
        new bootstrap.Modal(document.getElementById('localModal')).show();
    });

    // Handle "Add DashboardConfig" button click
    document.getElementById('add-dashboardConfig-btn').addEventListener('click', () => {
        document.getElementById('dashboardConfigModal').dataset.id = '';
        document.getElementById('operator-input').value = '';
        document.getElementById('a-input').value = '';
        document.getElementById('b-input').value = '';
        new bootstrap.Modal(document.getElementById('dashboardConfigModal')).show();
    });

    // Handle "Add Roip" button click
    document.getElementById('add-roip-btn').addEventListener('click', () => {
        document.getElementById('roipModal').dataset.id = '';
        document.getElementById('rname-input').value = '';
        document.getElementById('ip-input').value = '';
        document.getElementById('mac-input').value = '';
        new bootstrap.Modal(document.getElementById('roipModal')).show();
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
    confirmDelete('delete-local', id);
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
    confirmDelete('delete-roip', id);
}

function confirmDelete(channel, id) {
    document.getElementById('excluirModal').dataset.channel = channel;
    document.getElementById('excluirModal').dataset.id = id;
    new bootstrap.Modal(document.getElementById('excluirModal')).show();
}
