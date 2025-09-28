// Dados dos colaboradores armazenados em memória
let collaborators = [];

function showPanel(panelId) {
    // Ocultar todos os painéis
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.remove('active'));
    
    // Mostrar o painel selecionado
    document.getElementById(panelId).classList.add('active');
}

function showWelcomePanel() {
    showPanel('welcome-panel');
}

function showSearchPanel() {
    showPanel('search-panel');
    document.getElementById('search-name').focus();
}

function showLoginPanel() {
    showPanel('login-panel');
    document.getElementById('username').focus();
}

function searchCollaborator() {
    const searchTerm = document.getElementById('search-name').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    
    if (!searchTerm) {
        alert('Por favor, digite um nome ou código para pesquisar.');
        return;
    }
    
    if (collaborators.length === 0) {
        resultsList.innerHTML = '<p>Nenhum colaborador cadastrado no sistema.</p>';
        resultsContainer.style.display = 'block';
        return;
    }
    
    const results = collaborators.filter(collaborator => 
        collaborator.name.toLowerCase().includes(searchTerm) ||
        collaborator.code.toLowerCase().includes(searchTerm)
    );
    
    resultsList.innerHTML = '';
    
    if (results.length > 0) {
        results.forEach(collaborator => {
            const item = document.createElement('div');
            item.className = 'collaborator-item';
            item.innerHTML = `
                <strong>${collaborator.name}</strong><br>
                <small>Cargo: ${collaborator.position} | Código: ${collaborator.code}</small>
            `;
            resultsList.appendChild(item);
        });
    } else {
        resultsList.innerHTML = '<p>Nenhum colaborador encontrado com esse nome ou código.</p>';
    }
    
    resultsContainer.style.display = 'block';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('login-message');
    
    if (username === 'rddigital' && password === '32518731') {
        showPanel('admin-panel');
        messageDiv.innerHTML = '';
        // Limpar campos de login
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        // Atualizar lista de colaboradores
        updateCollaboratorsList();
    } else {
        messageDiv.innerHTML = '<div class="error-message">Usuário ou senha incorretos!</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

function addCollaborator() {
    const name = document.getElementById('collaborator-name').value.trim();
    const position = document.getElementById('collaborator-position').value.trim();
    const code = document.getElementById('collaborator-code').value.trim();
    const messageDiv = document.getElementById('admin-message');
    
    if (!name || !position || !code) {
        messageDiv.innerHTML = '<div class="error-message">Por favor, preencha todos os campos!</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
        return;
    }
    
    // Verificar se o código já existe
    const existingCollaborator = collaborators.find(c => c.code === code);
    if (existingCollaborator) {
        messageDiv.innerHTML = '<div class="error-message">Código do contribuinte já existe!</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
        return;
    }
    
    // Adicionar novo colaborador
    collaborators.push({ name, position, code });
    
    // Limpar campos
    document.getElementById('collaborator-name').value = '';
    document.getElementById('collaborator-position').value = '';
    document.getElementById('collaborator-code').value = '';
    
    messageDiv.innerHTML = '<div class="success-message">Colaborador adicionado com sucesso!</div>';
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 3000);
    
    // Atualizar lista de colaboradores
    updateCollaboratorsList();
}

function removeCollaborator(code) {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
        collaborators = collaborators.filter(c => c.code !== code);
        updateCollaboratorsList();
        
        const messageDiv = document.getElementById('admin-message');
        messageDiv.innerHTML = '<div class="success-message">Colaborador removido com sucesso!</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

function updateCollaboratorsList() {
    const listContainer = document.getElementById('collaborators-list');
    const collaboratorsList = document.getElementById('admin-collaborators-list');
    
    if (collaborators.length === 0) {
        listContainer.style.display = 'none';
        return;
    }
    
    collaboratorsList.innerHTML = '';
    
    collaborators.forEach(collaborator => {
        const item = document.createElement('div');
        item.className = 'collaborator-admin-item';
        item.innerHTML = `
            <div>
                <strong>${collaborator.name}</strong><br>
                <small>Cargo: ${collaborator.position} | Código: ${collaborator.code}</small>
            </div>
            <button class="remove-btn" onclick="removeCollaborator('${collaborator.code}')">
                🗑️ Remover
            </button>
        `;
        collaboratorsList.appendChild(item);
    });
    
    listContainer.style.display = 'block';
}

function logout() {
    showWelcomePanel();
    // Limpar dados do painel administrativo ao sair
    document.getElementById('admin-message').innerHTML = '';
    document.getElementById('collaborators-list').style.display = 'none';
}

// Eventos de teclado para melhor usabilidade
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activePanel = document.querySelector('.panel.active');
        
        if (activePanel.id === 'search-panel') {
            searchCollaborator();
        } else if (activePanel.id === 'login-panel') {
            login();
        } else if (activePanel.id === 'admin-panel') {
            addCollaborator();
        }
    }
});