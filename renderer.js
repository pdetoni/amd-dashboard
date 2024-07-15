document.addEventListener('DOMContentLoaded', async () => {
    let roips = [];
    let dashboardConfigs = [];
    let locals = [];
    let supervisors = [];
    let users = [];

    const fetchData = () => {
        window.electron.ipcRenderer.send('request-database');
    };

    const sendData = (channel, data) => {
        window.electron.ipcRenderer.send(channel, data);
    };

    fetchData();

    window.electron.ipcRenderer.on('response-database', (event, data) => {
        const { locals: localsData, dashboardConfigs: dashboardConfigsData, roips: roipsData, supervisors: supervisorsData, users: usersData } = data;
        roips = roipsData;
        dashboardConfigs = dashboardConfigsData;
        locals = localsData;
        supervisors = supervisorsData;
        users = usersData;

        updateLocalData(locals, dashboardConfigs, roips);

        // Fill tables with updated data
        fillTable(locals, "local-body", ["id", "type", "name", "mainRoipId", "secundaryRoipId"], editSecond);
        fillTable(dashboardConfigs, "dashboardConfig-body", ["id", "operatorId", "localAId", "localBId"], editDashboardConfig);
        fillTable(roips, "roip-body", ["id", "name", "ip", "mac"], editRoip, deleteRoip);

        document.getElementById('local').style.display = '';
        document.getElementById('dashboardConfig').style.display = '';
        document.getElementById('roip').style.display = '';
        document.getElementById('add-roip-btn').style.display = '';

        console.log('pagina carregada');
    });

    const toggleVisibility = (titleId, tableId, buttonId) => {
        const titleElement = document.getElementById(titleId);
        const tableElement = document.getElementById(tableId);
        const buttonElement = document.getElementById(buttonId);
        const arrowElement = titleElement.querySelector('.arrow');

        titleElement.addEventListener('click', () => {
            const isHidden = tableElement.style.display === 'none';
            tableElement.style.display = isHidden ? '' : 'none';
            if (buttonId) buttonElement.style.display = isHidden ? '' : 'none';
            arrowElement.classList.toggle('down', isHidden);
        });
    };

    toggleVisibility('local-title', 'local', null);
    toggleVisibility('dashboardConfig-title', 'dashboardConfig', null);
    toggleVisibility('roip-title', 'roip', 'add-roip-btn');

    document.getElementById('save-secRoip-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('secRoipModal').dataset.id,
            secundaryRoipId: document.getElementById('secRoip-input').value,
        };

        // console.log('Dados recebidos:', data);
        // console.log('Lista de roips:', roips);

        if (verificarSecRoip(data.secundaryRoipId, roips, locals)) {
            console.log('RoIP secundário encontrado');
            sendData('edit-secRoip', data);
            bootstrap.Modal.getInstance(document.getElementById('secRoipModal')).hide();
            fetchData();
            console.log('Dados enviados');
            location.reload();
        } else {
            console.log('RoIP secundário não encontrado');
            bootstrap.Modal.getInstance(document.getElementById('secRoipModal')).hide();
            showWarningModal('Dados inválidos!');
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
        console.log('dados recebidos');

        if (validateIp(data.ip) && validateMac(data.mac)) {

            if(!verificarDupRoip(data, roips)){
            console.log('dados validados');
            sendData('add-roip', data);
            bootstrap.Modal.getInstance(document.getElementById('addRoipModal')).hide();
            fetchData();
            location.reload();
        } else {
            showWarningModal('Já existe um ROIP com esses dados!');
        }
    }else{
        showWarningModal('Endereço IP ou MAC inválido!');
    }
    });

    document.getElementById('save-roip-btn').addEventListener('click', () => {
        const data = {
            id: document.getElementById('roipModal').dataset.id,
            name: document.getElementById('rname-input').value,
            ip: document.getElementById('ip-input').value,
            mac: document.getElementById('mac-input').value,
        };
        
        console.log('Saving edited RoIP data:', data);
    
        // Validate the IP and MAC address before sending the data
        if (validateIp(data.ip) && validateMac(data.mac)) {
            if(!verificarDupRoipExistente(data, roips, parseInt(data.id))){
            console.log('Data validated');
            sendData('edit-roip', data);
            bootstrap.Modal.getInstance(document.getElementById('roipModal')).hide();
            fetchData();
            location.reload();
            } else {
                showWarningModal('Já existe um ROIP com esses dados!');
            }
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

        if (verificarRoip(data.localAId, roips, locals) && verificarRoip(data.localBId, roips, locals)) {
            console.log('verificando dados');
            if (document.getElementById('a-input').value == document.getElementById('b-input').value) {
                console.log('roips iguais');
                showWarningModal('Local A e B não podem ser iguais!');
            }else{
                console.log('dados validados');
                sendData('edit-dashboardConfig', data);
                bootstrap.Modal.getInstance(document.getElementById('dashboardConfigModal')).hide();
                location.reload();
            }
        }else{
            console.log('dados invalidos');
            showWarningModal('Dados inválidos!');
        }

        // if (document.getElementById('a-input').value == document.getElementById('b-input').value) {
        //     showWarningModal('Local A e B não podem ser iguais!');
        // } else if (verificarRoip(data.localAId, roips)){

        // }

        // {
        //     sendData('edit-dashboardConfig', data);
        //     bootstrap.Modal.getInstance(document.getElementById('dashboardConfigModal')).hide();
        //     location.reload();
        // }
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

    function updateLocalData(locals, dashboardConfigs, roips) {
        let updatedLocals = [];

        locals.forEach(local => {
            let isUpdated = false;

            dashboardConfigs.forEach(config => {
                if (local.id === 2) {
                    const roipA = roips.find(roip => roip.id === config.localAId);
                    if (roipA) {
                        local.name = roipA.name;
                        local.mainRoipId = roipA.id;
                        isUpdated = true;
                    }
                }
                if (local.id === 3) {
                    const roipB = roips.find(roip => roip.id === config.localBId);
                    if (roipB) {
                        local.name = roipB.name;
                        local.mainRoipId = roipB.id;
                        isUpdated = true;
                    }
                }
            });

            if (isUpdated) {
                updatedLocals.push(local);
            }
        });

        // Envie os dados atualizados ao back-end para salvar no banco de dados
        sendData('update-locals', updatedLocals);
    }

    function verificarRoip(roipId, roips, locals) {
        console.log('testando dados');
        let valid = false;
        
        if(roips.some(roip => roip.id == roipId)){
            valid = true;
        }else{
            valid = false;
            return valid;
        }

        if(locals.some(local => local.secundaryRoipId == roipId)){
            valid = false;
        }

        console.log('resultado' + valid);

        return valid;
    }

    function verificarSecRoip(sec, roips, locals) {
        // const found = roips.some(roip => roip.id == sec);
        // return found;

        console.log('testando dados');
        let valid = false;
        
        if(roips.some(roip => roip.id == sec)){
            valid = true;
        }else{
            valid = false;
            return valid;
        }

        if(locals.some(local => local.mainRoipId == sec || local.secundaryRoipId == sec)){
            valid = false;
        }

        console.log('resultado' + valid);

        return valid;

    }

    function verificarDupRoip(newRoip, roips) {
        return roips.some(roip => 
            roip.name === newRoip.name || 
            roip.ip === newRoip.ip || 
            roip.mac === newRoip.mac
        );
    }

    function verificarDupRoipExistente(newRoip, roips, editingId) {
        return roips.some(roip => 
            roip.id !== editingId &&
            (roip.name === newRoip.name || 
            roip.ip === newRoip.ip || 
            roip.mac === newRoip.mac)
        );
    }
    

    function fillTable(rows, tableId, columns, editFunction, deleteFunction, editSecRoip) {
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
                editButton.textContent = tableId === 'local-body' ? 'SecRoip' : 'Editar';
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

            // if (editSecRoip) {
            //     let editSecRoipCell = newRow.insertCell(columns.length + 1);
            //     let editSecRoipButton = document.createElement('button');
            //     editSecRoipButton.className = 'btn btn-info';
            //     editSecRoipButton.textContent = 'SecRoip';
            //     editSecRoipButton.onclick = () => editSecRoip(row);
            //     editSecRoipCell.appendChild(editSecRoipButton);
            // }
        });
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

    function editLocal(row) {
        document.getElementById('localModal').dataset.id = row.id;
        document.getElementById('type-input').value = row.type;
        document.getElementById('name-input').value = row.name;
        document.getElementById('main-input').value = row.mainRoipId;
        document.getElementById('sec-input').value = row.secundaryRoipId;
        new bootstrap.Modal(document.getElementById('localModal')).show();
    }

    function editSecond(row) {
        document.getElementById('secRoipModal').dataset.id = row.id;
        document.getElementById('secRoip-input').value = row.secundaryRoipId;
        new bootstrap.Modal(document.getElementById('secRoipModal')).show();
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
});
