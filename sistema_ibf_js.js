// ============================================
// CONFIGURAÇÃO DO SUPABASE
// ============================================
// SUBSTITUA com suas credenciais do Supabase
const SUPABASE_URL = 'https://mvxmpveipajcdqowwwdo.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eG1wdmVpcGFqZWRxb3d3d2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNjU0NzIsImV4cCI6MjA3NDg0MTQ3Mn0.Ve2u4J30aVP0pNQHZxd8Zuzl911I-8ClMwCe_NlZvA0';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Dados dos colaboradores armazenados em memória (cache local)
let collaborators = [];

// ============================================
// FUNÇÕES DE BANCO DE DADOS
// ============================================

// Carregar colaboradores do Supabase
async function loadCollaborators() {
    try {
        const { data, error } = await supabase
            .from('colaboradores')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        
        collaborators = data || [];
        return true;
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        alert('Erro ao carregar dados do banco de dados.');
        return false;
    }
}

// Adicionar colaborador no Supabase
async function saveCollaboratorToDB(collaborator) {
    try {
        const { data, error } = await supabase
            .from('colaboradores')
            .insert([collaborator])
            .select();
        
        if (error) throw error;
        
        return data[0];
    } catch (error) {
        console.error('Erro ao salvar colaborador:', error);
        throw error;
    }
}

// Remover colaborador do Supabase
async function removeCollaboratorFromDB(code) {
    try {
        const { error } = await supabase
            .from('colaboradores')
            .delete()
            .eq('code', code);
        
        if (error) throw error;
        
        return true;
    } catch (error) {
        console.error('Erro ao remover colaborador:', error);
        throw error;
    }
}

// ============================================
// FUNÇÕES DE NAVEGAÇÃO
// ============================================

function showPanel(panelId) {
    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => panel.classList.remove('active'));
    document.getElementById(panelId).classList.add('active');
}

function showWelcomePanel() {
    showPanel('welcome-panel');
}

async function showSearchPanel() {
    showPanel('search-panel');
    document.getElementById('search-name').focus();
    
    // Carregar dados do banco ao entrar no painel de pesquisa
    await loadCollaborators();
}

function showLoginPanel() {
    showPanel('login-panel');
    document.getElementById('username').focus();
}

// ============================================
// FUNÇÕES DE PESQUISA
// ============================================

async function searchCollaborator() {
    const searchTerm = document.getElementById('search-name').value.toLowerCase().trim();
    const resultsContainer = document.getElementById('search-results');
    const resultsList = document.getElementById('results-list');
    
    if (!searchTerm) {
        alert('Por favor, digite um nome ou código para pesquisar.');
        return;
    }
    
    // Carregar dados atualizados do banco
    await loadCollaborators();
    
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

// ============================================
// FUNÇÕES DE LOGIN E ADMINISTRAÇÃO
// ============================================

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('login-message');
    
    if (username === 'rddigital' && password === '32518731') {
        showPanel('admin-panel');
        messageDiv.innerHTML = '';
        
        // Limpar campos de login
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        
        // Carregar e atualizar lista de colaboradores
        await loadCollaborators();
        updateCollaboratorsList();
    } else {
        messageDiv.innerHTML = '<div class="error-message">Usuário ou senha incorretos!</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

async function addCollaborator() {
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
    
    try {
        // Salvar no banco de dados
        const newCollaborator = { name, position, code };
        await saveCollaboratorToDB(newCollaborator);
        
        // Adicionar ao cache local
        collaborators.push(newCollaborator);
        
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
    } catch (error) {
        messageDiv.innerHTML = '<div class="error-message">Erro ao adicionar colaborador. Tente novamente.</div>';
        setTimeout(() => {
            messageDiv.innerHTML = '';
        }, 3000);
    }
}

async function removeCollaborator(code) {
    if (confirm('Tem certeza que deseja remover este colaborador?')) {
        try {
            // Remover do banco de dados
            await removeCollaboratorFromDB(code);
            
            // Remover do cache local
            collaborators = collaborators.filter(c => c.code !== code);
            
            updateCollaboratorsList();
            
            const messageDiv = document.getElementById('admin-message');
            messageDiv.innerHTML = '<div class="success-message">Colaborador removido com sucesso!</div>';
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 3000);
        } catch (error) {
            const messageDiv = document.getElementById('admin-message');
            messageDiv.innerHTML = '<div class="error-message">Erro ao remover colaborador. Tente novamente.</div>';
            setTimeout(() => {
                messageDiv.innerHTML = '';
            }, 3000);
        }
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
    document.getElementById('admin-message').innerHTML = '';
    document.getElementById('collaborators-list').style.display = 'none';
}

// ============================================
// EVENTOS DE TECLADO
// ============================================

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

// ============================================
// INICIALIZAÇÃO
// ============================================

// Carregar dados ao iniciar a página
window.addEventListener('load', async () => {
    console.log('Sistema IBF iniciado');
    // Opcionalmente, carregar dados iniciais
    // await loadCollaborators();
});
