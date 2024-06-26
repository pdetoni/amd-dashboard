document.addEventListener('DOMContentLoaded', async () => {
    const fetchData = () => {
        window.electron.ipcRenderer.send('request-database');
    };

    fetchData();

    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals, dashboardConfigs, roips } = data;

        // Create a map of roips for quick lookup
        const roipMap = createRoipMap(roips);

        // Update locals with information from dashboardConfigs and roips
        const updatedLocals = updateLocalsWithDashboardConfig(locals, dashboardConfigs, roipMap);

        // Fill tables with updated data
        fillTable(updatedLocals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"]);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"], editDashboardConfig);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"], editRoip, deleteRoip);

        document.getElementById('local').style.display = '';
        document.getElementById('dashboardConfig').style.display = '';
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

    toggleVisibility('local-title', 'local', 'add-roip-btn');
    toggleVisibility('dashboardConfig-title', 'dashboardConfig', 'add-roip-btn');
    toggleVisibility('roip-title', 'roip', 'add-roip-btn');

    const sendData = (channel, data) => {
        window.electron.ipcRenderer.send(channel, data);
    };

    document.getElementById('save-roip-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('roipModal').dataset.id,
            name: document.getElementById('rname-input').value,
            ip: document.getElementById('ip-input').value,
            mac: document.getElementById('mac-input').value,
        };

        if (validateIp(data.ip) && validateMac(data.mac)) {
            sendData('edit-roip', data);
            bootstrap.Modal.getInstance(document.getElementById('roipModal')).hide();
            fetchData();
            location.reload();
        } else {
            showWarningModal('Endereço IP ou MAC inválido!');
        }
    });

    document.getElementById('delete-btn').addEventListener('click', () => {
        const id = document.getElementById('excluirModal').dataset.id;
        sendData('delete-roip', id);
        bootstrap.Modal.getInstance(document.getElementById('excluirModal')).hide();
        location.reload();
    });

    document.getElementById('save-add-roip-btn').addEventListener('click', () => {
        const data = {
            name: document.getElementById('add-rname-input').value,
            ip: document.getElementById('add-ip-input').value,
            mac: document.getElementById('add-mac-input').value,
        };

        if (validateIp(data.ip) && validateMac(data.mac)) {
            sendData('add-roip', data);
            bootstrap.Modal.getInstance(document.getElementById('addRoipModal')).hide();
            fetchData();
        } else {
            showWarningModal('Endereço IP ou MAC inválido!');
        }
    });

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

    const roipForm = document.getElementById('roip-form');
    roipForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = {
            name: document.getElementById('add-rname-input').value,
            ip: document.getElementById('add-ip-input').value,
            mac: document.getElementById('add-mac-input').value,
        };
        if (validateIp(data.ip) && validateMac(data.mac)) {
            sendData('add-roip', data);
            bootstrap.Modal.getInstance(document.getElementById('addRoipModal')).hide();
            fetchData();
            location.reload();
        } else {
            showWarningModal('Endereço IP ou MAC inválido!');
        }
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

        if (editFunction) {
            let editCell = newRow.insertCell(columns.length);
            let editButton = document.createElement('button');
            editButton.className = 'btn btn-warning';
            editButton.textContent = 'Editar';
            editButton.onclick = () => editFunction(row);
            editCell.appendChild(editButton);
        }

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

function getDashData(dashId, dashboardConfigs) {
    return dashboardConfigs.find(dashboardConfig => dashboardConfig.id === dashId);
}

function getRoipData(roipId, roips) {
    return roips.find(roip => roip.id === roipId);
}

function validateIp(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

function validateMac(mac) {
    const macPattern = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macPattern.test(mac);
}

function showWarningModal(message) {
    document.getElementById('warningModalBody').textContent = message;
    new bootstrap.Modal(document.getElementById('warningModal')).show();
}

function createRoipMap(roips) {
    const roipMap = {};
    roips.forEach(roip => {
        roipMap[roip.id] = roip;
    });
    return roipMap;
}

function updateLocalsWithDashboardConfig(locals, dashboardConfigs, roipMap) {
    return locals.map(local => {
        if (local.id === 2) { // Example: assuming you want to update local with id 2
            const dashboardConfig = dashboardConfigs.find(config => config.localAId === local.id);
            if (dashboardConfig) {
                const roip = roipMap[dashboardConfig.localAId];
                if (roip) {
                    local.name = roip.name;
                    local.mainRoipId = roip.id;
                }
            }
        }
        return local;
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

function deleteDashboardConfig(id) {
    confirmDelete('delete-dashboardConfig', id);
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
