/**
 * MRV - Organizer Plus
 * Core Client Application Logic
 */

// Application State
let currentUser = null;
let projectState = null;
let activePage = 'page-mapa';
let activeFrente = 'Janela';
let activeFilterFront = null;
let syncMode = 'local'; // 'local' or 'api'
const API_URL = ''; // Relative path for serving from Node server
let activeProjectName = sessionStorage.getItem('mrv_active_project_name') || null;
let globalCollaborators = [];

const FRENTES_SEQUENCIA = [
    "Janela", 
    "Impermeabilização", 
    "Drywall", 
    "Piso", 
    "Rejunte",
    "Pintura", 
    "Limpeza", 
    "Regularização", 
    "Piso Laminado", 
    "Checklist",
    "VQ", 
    "VA"
];

const FRENTES_DESCRICOES = {
    "Janela": "Instalação e alinhamento de esquadrias e vidros externos.",
    "Impermeabilização": "Aplicação de manta asfáltica e impermeabilizantes em áreas frias (banheiros, sacadas).",
    "Drywall": "Montagem de divisórias internas de gesso acartonado e paredes acústicas.",
    "Piso": "Assentamento de revestimentos cerâmicos, azulejos e porcelanatos nas paredes e pisos.",
    "Rejunte": "Aplicação de rejunte técnico entre as juntas de pisos e azulejos.",
    "Pintura": "Aplicação de selador, massa corrida e pintura acrílica nas paredes e tetos.",
    "Limpeza": "Limpeza grossa e fina para remoção de resíduos de obra de todas as superfícies.",
    "Regularização": "Execução de contrapiso e regularização de base para assentamento do piso final.",
    "Piso Laminado": "Colocação do piso laminado de madeira e fixação de rodapés nas salas e quartos.",
    "Checklist": "Vistoria interna prévia para identificação e correção de pequenas pendências estéticas.",
    "VQ": "Vistoria da Qualidade interna. Qualquer item em desconformidade gera uma reprova com consumo de insumo.",
    "VA": "Vistoria de Entrega do Apartamento ao cliente. Registra os retoques finais requisitados pelo comprador."
};

// Colors associated with each front
const FRENTES_CORES = {
    "Janela": "#3b82f6",
    "Impermeabilização": "#06b6d4",
    "Drywall": "#6366f1",
    "Piso": "#a855f7",
    "Rejunte": "#ec4899",
    "Pintura": "#f43f5e",
    "Limpeza": "#10b981",
    "Regularização": "#f97316",
    "Piso Laminado": "#84cc16",
    "Checklist": "#059669",
    "VQ": "#eab308",
    "VA": "#d97706",
    "Concluido": "#00c853"
};

// Document Elements
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('password');
const dbModeIndicator = document.getElementById('db-mode-indicator');
const connectionBadge = document.getElementById('connection-badge');
const syncStatusSidebar = document.getElementById('sync-status-sidebar');

// Page Navigation Elements
const navLinks = document.querySelectorAll('.nav-link');
const pageSections = document.querySelectorAll('.page-section');
const pageTitle = document.getElementById('page-title');
const userDisplayName = document.getElementById('user-display-name');
const userDisplayRole = document.getElementById('user-display-role');
const userRoleIcon = document.getElementById('user-role-icon');
const btnLogout = document.getElementById('btn-logout');
const themeToggleBtn = document.getElementById('theme-toggle');

// Summary Stats
const statConcluidos = document.getElementById('stat-concluidos');
const statReprovados = document.getElementById('stat-reprovados');
const statAtivos = document.getElementById('stat-ativos');
const statProgresso = document.getElementById('stat-progresso');

// Modals
const modalUnitDetails = document.getElementById('modal-unit-details');
const modalUpdateFront = document.getElementById('modal-update-front');
const modalAddReprova = document.getElementById('modal-add-reprova');
const modalAddUser = document.getElementById('modal-add-user');

// Setup App
document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
    setupEventListeners();
    await checkDatabaseConnection();
    checkAuthSession();
}

// Check if Backend API is running
async function checkDatabaseConnection() {
    if (!activeProjectName) {
        // Show selection page and hide others
        document.getElementById('project-selector-container').classList.remove('hidden');
        loginContainer.classList.add('hidden');
        appContainer.classList.add('hidden');
        return;
    }

    try {
        dbModeIndicator.textContent = "Verificando servidor...";
        const response = await fetch('/api/project?name=' + encodeURIComponent(activeProjectName));
        if (response.ok) {
            const data = await response.json();
            projectState = data;
            syncMode = 'api';
            updateConnectionBadge(true);
            dbModeIndicator.textContent = `Conectado: ${projectState.name || activeProjectName}`;
            await loadGlobalCollaborators();
            return;
        }
    } catch (e) {
        console.log("No backend detected, using local browser database.");
    }
    
    // Fallback to localStorage
    syncMode = 'local';
    updateConnectionBadge(false);
    dbModeIndicator.textContent = "Navegador Offline";
    
    const localKey = 'mrv_project_state_' + activeProjectName;
    const localData = localStorage.getItem(localKey);
    if (localData) {
        try {
            const parsed = JSON.parse(localData);
            projectState = parsed;
        } catch (e) {
            console.error("Error parsing local state, loading seed data", e);
            await loadSeedData();
        }
    } else {
        await loadSeedData();
    }

    // Ensure frentesConfig and its properties are present in state
    if (projectState) {
        if (!projectState.frentesConfig) {
            projectState.frentesConfig = {};
        }
        FRENTES_SEQUENCIA.forEach(f => {
            if (!projectState.frentesConfig[f]) {
                projectState.frentesConfig[f] = {
                    dataInicio: "2026-06-08",
                    capacidadeDia: 2,
                    colaboradores: []
                };
            } else if (!projectState.frentesConfig[f].colaboradores) {
                projectState.frentesConfig[f].colaboradores = [];
            }
        });
    }

    await loadGlobalCollaborators();
}

// Load seed data from script variable (prevents CORS blockages on file://)
async function loadSeedData() {
    try {
        if (window.initialProjectData) {
            // Deep clone to avoid mutating original seed
            projectState = JSON.parse(JSON.stringify(window.initialProjectData));
            // Apply project name prefix to customized title
            if (activeProjectName) {
                const projectDisplayNames = {
                    'chapada_fontana': 'MRV - Chapada Fontana',
                    'citta_splendore': 'MRV - Cittá Splendore'
                };
                projectState.name = projectDisplayNames[activeProjectName] || ("MRV - " + activeProjectName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                // Save to project-specific local key
                const localKey = 'mrv_project_state_' + activeProjectName;
                localStorage.setItem(localKey, JSON.stringify(projectState));
            }
        } else {
            alert("Erro crítico: Dados semente não carregados.");
        }
    } catch (e) {
        console.error("Error loading seed data", e);
    }
}

// Check session in sessionStorage
function checkAuthSession() {
    if (!projectState) return;
    const sessionUser = sessionStorage.getItem('mrv_current_user');
    if (sessionUser) {
        try {
            currentUser = JSON.parse(sessionUser);
            // Verify user still exists in DB
            const userInDb = projectState.users.find(u => u.username === currentUser.username);
            if (userInDb) {
                loginSuccess(userInDb);
                return;
            }
        } catch (e) {}
    }
    // Show login page
    loginContainer.classList.remove('hidden');
    appContainer.classList.add('hidden');
}

// Save current project state
async function saveState() {
    if (!activeProjectName) return;

    if (syncMode === 'api') {
        try {
            const response = await fetch('/api/project?name=' + encodeURIComponent(activeProjectName), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectState)
            });
            if (response.ok) {
                updateSyncIndicator(true);
                return;
            }
        } catch (e) {
            console.error("Failed to sync state to server, saving to browser fallback", e);
        }
    }
    
    // Save locally
    const localKey = 'mrv_project_state_' + activeProjectName;
    localStorage.setItem(localKey, JSON.stringify(projectState));
    updateSyncIndicator(false);
}

// Update Sync icons
function updateConnectionBadge(isOnline) {
    if (isOnline) {
        connectionBadge.className = "connection-badge online";
        connectionBadge.querySelector('.text').textContent = "Rede Obra";
        connectionBadge.title = "Sincronizado na rede de obras";
    } else {
        connectionBadge.className = "connection-badge offline";
        connectionBadge.querySelector('.text').textContent = "Local";
        connectionBadge.title = "Salvo apenas neste computador";
    }
}

function updateSyncIndicator(isServerSynced) {
    if (isServerSynced) {
        syncStatusSidebar.innerHTML = `<i class="fa fa-circle-check text-success"></i> <span>Nuvem Sincronizada</span>`;
    } else {
        syncStatusSidebar.innerHTML = `<i class="fa fa-hdd text-info"></i> <span>Salvo Localmente</span>`;
    }
}

// Event Listeners Setup
function setupEventListeners() {
    // Theme Toggle
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        document.body.classList.toggle('dark-theme');
        const icon = themeToggleBtn.querySelector('i');
        if (document.body.classList.contains('light-theme')) {
            icon.className = 'fa fa-moon';
        } else {
            icon.className = 'fa fa-sun';
        }
    });

    // Password view toggle
    togglePasswordBtn.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.querySelector('i').className = 'fa fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.querySelector('i').className = 'fa fa-eye';
        }
    });

    // Login Form Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const usernameVal = document.getElementById('username').value.trim();
        const passwordVal = passwordInput.value;

        const matchedUser = projectState.users.find(
            u => u.username.toLowerCase() === usernameVal.toLowerCase() && u.password === passwordVal
        );

        if (matchedUser) {
            loginSuccess(matchedUser);
        } else {
            loginError.classList.remove('hidden');
        }
    });

    // Logout
    btnLogout.addEventListener('click', () => {
        currentUser = null;
        activeProjectName = null;
        sessionStorage.removeItem('mrv_current_user');
        sessionStorage.removeItem('mrv_active_project_name');
        
        // Hide app and login, show project selector
        appContainer.classList.add('hidden');
        loginContainer.classList.add('hidden');
        document.getElementById('project-selector-container').classList.remove('hidden');
        
        loginForm.reset();
        loginError.classList.add('hidden');
    });

    // Sidebar Navigation Click
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-target');
            navigateToPage(targetPage);
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Modal close hooks
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay').classList.add('hidden');
        });
    });

    // Unit Modal Tab Buttons
    document.querySelectorAll('.modal-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            const parent = btn.closest('.modal-card');
            
            parent.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
            parent.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            parent.querySelector(`#${tabId}`).classList.add('active');
        });
    });

    // Clear Map Filters
    document.getElementById('btn-clear-map-filter').addEventListener('click', () => {
        activeFilterFront = null;
        document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('filtered-active'));
        document.getElementById('btn-clear-map-filter').classList.add('hidden');
        renderTowers();
    });

    // Form Update Front
    document.getElementById('form-update-front').addEventListener('submit', handleUpdateFrontSubmit);

    // Form Add Reprova
    document.getElementById('form-add-reprova').addEventListener('submit', handleAddReprovaSubmit);

    // Filter Reprovas table changes
    document.getElementById('filter-rep-tower').addEventListener('change', renderReprovasPage);
    document.getElementById('filter-rep-status').addEventListener('change', renderReprovasPage);
    document.getElementById('filter-rep-search').addEventListener('input', renderReprovasPage);

    // Export Reprovas
    document.getElementById('btn-export-reprovas').addEventListener('click', exportReprovasCSV);

    // Filter Insumos table changes
    document.getElementById('filter-ins-tower').addEventListener('change', renderInsumosPage);
    document.getElementById('filter-ins-frente').addEventListener('change', renderInsumosPage);
    document.getElementById('filter-ins-search').addEventListener('input', renderInsumosPage);

    // Export Insumos
    document.getElementById('btn-export-insumos').addEventListener('click', exportInsumosCSV);

    // Add User Trigger
    document.getElementById('btn-add-user').addEventListener('click', () => {
        document.getElementById('modal-user-title-action').textContent = "Novo Usuário";
        document.getElementById('user-edit-mode').value = "false";
        document.getElementById('user-username').disabled = false;
        document.getElementById('form-add-user').reset();
        modalAddUser.classList.remove('hidden');
    });

    // Submit user form
    document.getElementById('form-add-user').addEventListener('submit', handleAddUserSubmit);

    // Config Towers Form
    document.getElementById('config-towers-form').addEventListener('submit', handleConfigTowersSubmit);
    document.getElementById('btn-add-tower-config').addEventListener('click', addTowerConfigRow);

    // Reset Buttons
    document.getElementById('btn-danger-reset-all').addEventListener('click', resetAllProjectData);
    document.getElementById('btn-danger-seed-splendore').addEventListener('click', restoreSplendoreSeed);

    // Unit Modal Add Reprova button trigger
    document.getElementById('modal-btn-add-reprova').addEventListener('click', () => {
        const unitId = document.getElementById('modal-unit-title').dataset.unitId;
        modalUnitDetails.classList.add('hidden');
        openAddReprovaModal(unitId);
    });

    // Dropdown de alteração manual de frentes no Modal de Detalhes
    document.getElementById('modal-unit-active-front-selector').addEventListener('change', handleManualActiveFrontChange);

    // Filtros dinâmicos da tabela de frentes de serviço
    document.getElementById('filter-frente-tower').addEventListener('change', renderFrenteDetails);
    document.getElementById('filter-frente-status').addEventListener('change', renderFrenteDetails);
    document.getElementById('filter-frente-search').addEventListener('input', renderFrenteDetails);

    // Configurações de data e capacidade da frente de serviço
    document.getElementById('frente-data-inicio').addEventListener('change', async (e) => {
        if (projectState && projectState.frentesConfig[activeFrente]) {
            projectState.frentesConfig[activeFrente].dataInicio = e.target.value;
            await saveState();
            renderFrenteDetails();
        }
    });

    document.getElementById('frente-capacidade').addEventListener('change', async (e) => {
        if (projectState && projectState.frentesConfig[activeFrente]) {
            const val = parseFloat(e.target.value) || 1;
            projectState.frentesConfig[activeFrente].capacidadeDia = val < 0.001 ? 0.001 : val;
            await saveState();
            renderFrenteDetails();
        }
    });

    // Botão Salvar Alterações (sem concluir) no modal de alimentação
    const btnSaveProgress = document.getElementById('btn-save-progress');
    if (btnSaveProgress) {
        btnSaveProgress.addEventListener('click', async () => {
            const form = document.getElementById('form-update-front');
            if (!form.reportValidity()) {
                return; // Formulário inválido
            }
            
            const unitId = document.getElementById('update-unit-id').value;
            const frenteName = document.getElementById('update-front-name').value;
            
            saveUpdateFrontFields(unitId, frenteName, false);
            
            modalUpdateFront.classList.add('hidden');
            
            // Recarregar os detalhes da SPA ativa
            if (activePage === 'page-frentes') {
                renderFrentesSubtabs();
                renderFrenteDetails();
            } else if (activePage === 'page-mapa') {
                renderSummaryStats();
                renderTowers();
            }
        });
    }

    // Open manage collaborators modal
    document.getElementById('btn-manage-colaboradores').addEventListener('click', () => {
        document.getElementById('modal-manage-colaboradores').classList.remove('hidden');
        document.getElementById('colab-modal-frente-name').textContent = activeFrente;
        renderColaboradoresList();
    });

    // Form add collaborator submit
    document.getElementById('form-add-colab').addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('colab-nome').value.trim();
        const empresa = document.getElementById('colab-empresa').value.trim();
        const produtividade = parseFloat(document.getElementById('colab-produtividade').value) || 0;
        const periodo = document.getElementById('colab-periodo').value;

        const fConfig = projectState.frentesConfig[activeFrente];
        if (!fConfig.colaboradores) {
            fConfig.colaboradores = [];
        }

        fConfig.colaboradores.push({
            nome,
            empresa,
            produtividade,
            periodo
        });

        // Add to global collaborators if not already present
        const alreadyGlobal = globalCollaborators.some(c => c.nome.toLowerCase() === nome.toLowerCase());
        if (!alreadyGlobal) {
            globalCollaborators.push({ nome, empresa });
            await saveGlobalCollaborators();
            updateDatalistGlobalColabs();
        }

        recalculateFrenteCapacity();
        await saveState();
        
        // Reset form
        document.getElementById('form-add-colab').reset();
        
        // Refresh UI
        renderColaboradoresList();
        renderFrenteDetails();
    });

    // Autofill company name when typing collaborator name
    const colabNomeInput = document.getElementById('colab-nome');
    if (colabNomeInput) {
        colabNomeInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const matched = globalCollaborators.find(c => c.nome.toLowerCase() === val.toLowerCase());
            if (matched) {
                document.getElementById('colab-empresa').value = matched.empresa;
            }
        });
    }

    // Project selection click listeners
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', async () => {
            activeProjectName = card.getAttribute('data-project');
            sessionStorage.setItem('mrv_active_project_name', activeProjectName);
            
            // Load project-specific database
            await checkDatabaseConnection();
            
            // Transition view
            document.getElementById('project-selector-container').classList.add('hidden');
            loginContainer.classList.remove('hidden');
            
            // Check active session for this project
            checkAuthSession();
        });
    });
}

// Login Success Routing
function loginSuccess(user) {
    currentUser = user;
    sessionStorage.setItem('mrv_current_user', JSON.stringify(currentUser));
    
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    userDisplayName.textContent = user.name;
    userDisplayRole.textContent = user.role === 'admin' ? 'Administrador' : 'Fiscal';
    
    if (user.role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        userRoleIcon.className = 'fa fa-user-shield';
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        userRoleIcon.className = 'fa fa-user';
    }

    // Default to first page
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-target="page-mapa"]').classList.add('active');
    navigateToPage('page-mapa');
}

// Page Router
function navigateToPage(pageId) {
    activePage = pageId;
    pageSections.forEach(sec => sec.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');

    // Load page specifics
    if (pageId === 'page-mapa') {
        pageTitle.textContent = "Mapa Geral da Obra";
        renderSummaryStats();
        renderLegendFilters();
        renderTowers();
    } else if (pageId === 'page-frentes') {
        pageTitle.textContent = "Acompanhamento de Frentes";
        renderFrentesSubtabs();
        renderFrenteDetails();
    } else if (pageId === 'page-reprovas') {
        pageTitle.textContent = "Histórico de Reprovas e Consumo";
        renderReprovasPage();
    } else if (pageId === 'page-insumos') {
        pageTitle.textContent = "Consumo de Insumos";
        renderInsumosPage();
    } else if (pageId === 'page-usuarios') {
        pageTitle.textContent = "Controle de Acessos";
        renderUsersList();
    } else if (pageId === 'page-config') {
        pageTitle.textContent = "Estrutura da Obra";
        renderConfigTowers();
    }
}

// -------------------------------------------------------------
// PAGE 1: MAPA GERAL METHODS
// -------------------------------------------------------------

function renderSummaryStats() {
    const totalUnits = projectState.units.length;
    let concluidas = 0;
    let reprovadas = 0;
    let ativas = 0;
    let totalProgressSum = 0;

    projectState.units.forEach(u => {
        totalProgressSum += u.activeFrontIndex;
        
        if (u.activeFrontIndex === 12) {
            concluidas++;
        } else if (u.activeFrontIndex > 0) {
            ativas++;
        }
        
        // Count units with active (Pendente) reprovas
        const hasPendingReprova = u.reprovas.some(r => r.status === 'Pendente');
        if (hasPendingReprova) {
            reprovadas++;
        }
    });

    const percentGeral = totalUnits > 0 ? Math.round((totalProgressSum / (totalUnits * 12)) * 100) : 0;

    statConcluidos.textContent = concluidas;
    statReprovados.textContent = reprovadas;
    statAtivos.textContent = ativas;
    statProgresso.textContent = `${percentGeral}%`;
}

function renderLegendFilters() {
    const container = document.getElementById('map-frentes-legend');
    container.innerHTML = '';

    // Standard legends for 12 frentes
    FRENTES_SEQUENCIA.forEach((f, idx) => {
        const activeUnitsOnThisFront = projectState.units.filter(u => u.activeFrontIndex === idx).length;
        
        const item = document.createElement('div');
        item.className = 'legend-item';
        if (activeFilterFront === f) {
            item.classList.add('filtered-active');
        }
        
        item.innerHTML = `
            <span class="legend-color-dot" style="background-color: ${FRENTES_CORES[f] || '#ccc'}"></span>
            <span class="legend-text">${f} (${activeUnitsOnThisFront})</span>
        `;
        
        item.addEventListener('click', () => {
            if (activeFilterFront === f) {
                activeFilterFront = null;
                item.classList.remove('filtered-active');
                document.getElementById('btn-clear-map-filter').classList.add('hidden');
            } else {
                activeFilterFront = f;
                document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('filtered-active'));
                item.classList.add('filtered-active');
                document.getElementById('btn-clear-map-filter').classList.remove('hidden');
            }
            renderTowers();
        });
        
        container.appendChild(item);
    });

    // Add Concluído Legend
    const doneUnits = projectState.units.filter(u => u.activeFrontIndex === 12).length;
    const doneItem = document.createElement('div');
    doneItem.className = 'legend-item';
    if (activeFilterFront === 'Concluido') { doneItem.classList.add('filtered-active'); }
    doneItem.innerHTML = `
        <span class="legend-color-dot" style="background-color: ${FRENTES_CORES.Concluido}"></span>
        <span class="legend-text">Concluído (${doneUnits})</span>
    `;
    doneItem.addEventListener('click', () => {
        if (activeFilterFront === 'Concluido') {
            activeFilterFront = null;
            doneItem.classList.remove('filtered-active');
            document.getElementById('btn-clear-map-filter').classList.add('hidden');
        } else {
            activeFilterFront = 'Concluido';
            document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('filtered-active'));
            doneItem.classList.add('filtered-active');
            document.getElementById('btn-clear-map-filter').classList.remove('hidden');
        }
        renderTowers();
    });
    container.appendChild(doneItem);
}

function renderTowers() {
    const root = document.getElementById('towers-grid-root');
    root.innerHTML = '';

    projectState.towers.forEach(tConfig => {
        const towerUnits = projectState.units.filter(u => u.tower === tConfig.name);
        
        const block = document.createElement('div');
        block.className = 'tower-block';
        
        block.innerHTML = `
            <div class="tower-title-bar">
                <h2>${tConfig.name}</h2>
                <span class="badge">${tConfig.floors} Pav. / ${tConfig.unitsPerFloor} Aptos</span>
            </div>
            <div class="tower-grid" id="grid-${tConfig.name.replace(/\s+/g, '-')}">
            </div>
        `;
        
        root.appendChild(block);
        const gridContainer = block.querySelector('.tower-grid');
        
        // Loop from top floor to bottom floor
        for (let f = tConfig.floors; f >= 1; f--) {
            const row = document.createElement('div');
            row.className = 'floor-row';
            
            row.innerHTML = `
                <div class="floor-label">${f}º Pav</div>
                <div class="units-row"></div>
            `;
            
            const unitsRowContainer = row.querySelector('.units-row');
            
            // Loop through apartments on this floor
            for (let u = 1; u <= tConfig.unitsPerFloor; u++) {
                const unitNum = `${f}` + String(u).padStart(2, '0');
                const matchedUnit = towerUnits.find(unit => unit.unit == unitNum && unit.floor == f);
                
                const cell = document.createElement('div');
                cell.className = 'unit-cell';
                
                if (matchedUnit) {
                    const frontIndex = matchedUnit.activeFrontIndex;
                    let frontName = "";
                    let cellClass = "";
                    
                    if (frontIndex === 12) {
                        frontName = "Concluido";
                        cellClass = "c-concluido";
                    } else {
                        frontName = FRENTES_SEQUENCIA[frontIndex];
                        cellClass = `c-${frontName.toLowerCase().replace(/\s+/g, '')}`;
                    }
                    
                    cell.classList.add(cellClass);
                    cell.innerHTML = `<span class="unit-num">${unitNum}</span>`;
                    
                    // Add delay/out-of-order pulsing classes
                    const outOfOrder = isUnitOutOfOrder(matchedUnit);
                    const delayed = frontIndex < 12 ? isUnitDelayed(matchedUnit, frontName) : false;
                    
                    if (outOfOrder && delayed) {
                        cell.classList.add('pulsing-both');
                    } else if (delayed) {
                        cell.classList.add('pulsing-red');
                    } else if (outOfOrder) {
                        cell.classList.add('pulsing-purple');
                    }
                    
                    cell.title = `${matchedUnit.tower} - Apto ${unitNum}\nFrente: ${frontIndex === 12 ? 'Concluído (VA)' : frontName}\nStatus: ${matchedUnit.status_geral}`;
                    if (outOfOrder) cell.title += `\n⚠️ Fora de sequência!`;
                    if (delayed) cell.title += `\n⚠️ Prazo atrasado!`;
                    
                    // Dim cell if filtering is active and it doesn't match
                    if (activeFilterFront && activeFilterFront !== frontName) {
                        cell.classList.add('dimmed');
                    }
                    
                    // Add dot if unit has pending reprovas
                    const hasPendingReprova = matchedUnit.reprovas.some(r => r.status === 'Pendente');
                    if (hasPendingReprova) {
                        const dot = document.createElement('span');
                        dot.className = 'has-reprova-tag';
                        cell.appendChild(dot);
                    }
                    
                    cell.addEventListener('click', () => openUnitDetailsModal(matchedUnit.id));
                } else {
                    // Placeholder cell if config is mismatching data
                    cell.innerHTML = `<span class="unit-num">${unitNum}</span>`;
                    cell.style.opacity = '0.3';
                    cell.title = "Não cadastrado";
                }
                
                unitsRowContainer.appendChild(cell);
            }
            gridContainer.appendChild(row);
        }
    });
}

// -------------------------------------------------------------
// PAGE 2: FRENTES DE SERVIÇO METHODS
// -------------------------------------------------------------

function renderFrentesSubtabs() {
    const list = document.getElementById('frentes-subtabs-list');
    list.innerHTML = '';

    FRENTES_SEQUENCIA.forEach((f) => {
        const count = projectState.units.filter(u => {
            const activeName = FRENTES_SEQUENCIA[u.activeFrontIndex];
            return activeName === f && u.activeFrontIndex < 12;
        }).length;

        const btn = document.createElement('button');
        btn.className = `subtab-btn ${activeFrente === f ? 'active' : ''}`;
        btn.innerHTML = `<i class="fa fa-angle-right"></i> ${f} <span class="badge" style="background: rgba(255,255,255,0.15)">${count}</span>`;
        
        btn.addEventListener('click', () => {
            activeFrente = f;
            document.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderFrenteDetails();
        });
        
        list.appendChild(btn);
    });
}

function renderFrenteDetails() {
    document.getElementById('active-frente-title').textContent = activeFrente;
    document.getElementById('active-frente-desc').textContent = FRENTES_DESCRICOES[activeFrente] || "";
    
    const fIdx = FRENTES_SEQUENCIA.indexOf(activeFrente);
    
    // Configurações de Cronograma
    if (!projectState.frentesConfig[activeFrente]) {
        projectState.frentesConfig[activeFrente] = { dataInicio: "2026-06-08", capacidadeDia: 2, colaboradores: [] };
    }
    const fConfig = projectState.frentesConfig[activeFrente];
    if (!fConfig.colaboradores) {
        fConfig.colaboradores = [];
    }

    // Recalcular capacidade se houver colaboradores
    const hasColabs = fConfig.colaboradores.length > 0;
    if (hasColabs) {
        let sum = 0;
        fConfig.colaboradores.forEach(c => {
            let rate = parseFloat(c.produtividade) || 0;
            if (c.periodo === 'semana') {
                sum += rate / 5; // 5 working days
            } else if (c.periodo === 'mes') {
                sum += rate / 30; // 30 calendar days
            } else {
                sum += rate; // daily
            }
        });
        fConfig.capacidadeDia = Math.round(sum * 1000) / 1000;
    }

    const inputDataInicio = document.getElementById('frente-data-inicio');
    const inputCapacidade = document.getElementById('frente-capacidade');
    const spanColabsCount = document.getElementById('frente-colaboradores-count');

    if (document.activeElement !== inputDataInicio) {
        inputDataInicio.value = fConfig.dataInicio;
    }
    if (document.activeElement !== inputCapacidade) {
        inputCapacidade.value = fConfig.capacidadeDia;
    }
    if (spanColabsCount) {
        spanColabsCount.textContent = fConfig.colaboradores.length;
    }

    // Habilitar/Desabilitar input dependendo de colaboradores
    if (hasColabs) {
        inputCapacidade.disabled = true;
        inputCapacidade.style.cursor = 'not-allowed';
        inputCapacidade.style.opacity = '0.6';
        inputCapacidade.title = "Calculado automaticamente a partir dos colaboradores cadastrados.";
    } else {
        inputCapacidade.disabled = false;
        inputCapacidade.style.cursor = 'auto';
        inputCapacidade.style.opacity = '1';
        inputCapacidade.title = "";
    }

    // 1. Obter lista de unidades pendentes neste serviço e ordenar pela sequência de execução
    const pendingUnits = projectState.units.filter(u => !u.frontsData[activeFrente] || !u.frontsData[activeFrente].concluido);
    pendingUnits.sort((a, b) => {
        if (a.tower !== b.tower) return a.tower.localeCompare(b.tower);
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.unit.localeCompare(b.unit);
    });

    // 2. Mapear projeções usando a simulação de trabalhadores paralelos com duração customizada
    const cap = parseFloat(fConfig.capacidadeDia) || 1;
    const numWorkers = Math.max(1, Math.floor(cap));
    const workersAvailability = Array(numWorkers).fill(0); // em dias
    
    const projectionsMap = {};
    pendingUnits.forEach((u) => {
        // Encontrar o trabalhador que estará disponível mais cedo
        let minWorkerIdx = 0;
        let minAvailTime = workersAvailability[0];
        for (let w = 1; w < numWorkers; w++) {
            if (workersAvailability[w] < minAvailTime) {
                minAvailTime = workersAvailability[w];
                minWorkerIdx = w;
            }
        }
        
        // Determinar a duração para esta unidade (se salvou progresso e tem duração prevista, usa ela)
        const uData = u.frontsData[activeFrente] || {};
        let duration = 1 / cap;
        if (uData.duracaoProj && parseFloat(uData.duracaoProj) > 0) {
            duration = parseFloat(uData.duracaoProj);
        }
        
        const startTime = workersAvailability[minWorkerIdx];
        const endTime = startTime + duration;
        
        // Atualizar disponibilidade do trabalhador
        workersAvailability[minWorkerIdx] = endTime;
        
        // Mapear data projetada
        const daysNeeded = Math.floor(endTime);
        projectionsMap[u.id] = addDays(fConfig.dataInicio, daysNeeded);
    });

    // Atualizar contagem no cabeçalho (mostra quantas estão pendentes de conclusão no total)
    document.getElementById('active-frente-units-count').textContent = `${pendingUnits.length} Unidades Pendentes`;

    // 3. Renderizar Painel de Projeções (Torres e Obra)
    const projectionsGrid = document.getElementById('frente-projections-grid');
    projectionsGrid.innerHTML = '';

    const tConfig = projectState.towers;
    tConfig.forEach(tow => {
        const towPending = pendingUnits.filter(u => u.tower === tow.name);
        const badge = document.createElement('div');
        badge.className = 'projection-badge';
        
        if (towPending.length === 0) {
            badge.classList.add('completed');
            badge.innerHTML = `
                <span class="proj-title">${tow.name}</span>
                <span class="proj-val"><i class="fa fa-circle-check"></i> Concluído</span>
            `;
        } else {
            // Última unidade pendente desta torre na fila ordenada
            const lastUnit = towPending[towPending.length - 1];
            const projDate = projectionsMap[lastUnit.id] || "-";
            badge.innerHTML = `
                <span class="proj-title">${tow.name}</span>
                <span class="proj-val">${projDate}</span>
            `;
        }
        projectionsGrid.appendChild(badge);
    });

    // Projeção Obra Total
    const totalObraBadge = document.createElement('div');
    totalObraBadge.className = 'projection-badge';
    if (pendingUnits.length === 0) {
        totalObraBadge.classList.add('completed');
        totalObraBadge.innerHTML = `
            <span class="proj-title">Conclusão Obra</span>
            <span class="proj-val"><i class="fa fa-circle-check"></i> Concluído!</span>
        `;
    } else {
        const lastUnitAll = pendingUnits[pendingUnits.length - 1];
        const totalObraProj = projectionsMap[lastUnitAll.id] || "-";
        totalObraBadge.innerHTML = `
            <span class="proj-title">Conclusão Obra</span>
            <span class="proj-val" style="color: var(--status-agendado)">${totalObraProj}</span>
        `;
    }
    projectionsGrid.appendChild(totalObraBadge);

    // 4. Filtrar e renderizar a Tabela de Unidades
    const tableBody = document.getElementById('table-frente-unidades-body');
    const tableEl = document.getElementById('table-frente-unidades');
    const emptyMsg = document.getElementById('no-units-frente-msg');
    
    tableBody.innerHTML = '';

    // Montar a lista completa de unidades com status computados para exibição
    let listUnits = [...projectState.units];
    
    // Ordenar a lista completa
    listUnits.sort((a, b) => {
        if (a.tower !== b.tower) return a.tower.localeCompare(b.tower);
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.unit.localeCompare(b.unit);
    });

    // Ler os filtros selecionados no DOM
    const filterTower = document.getElementById('filter-frente-tower').value;
    const filterStatus = document.getElementById('filter-frente-status').value;
    const filterSearch = document.getElementById('filter-frente-search').value.toLowerCase().trim();

    // Aplicar filtros
    if (filterTower !== 'all') {
        listUnits = listUnits.filter(u => u.tower === filterTower);
    }

    if (filterStatus !== 'all') {
        listUnits = listUnits.filter(u => {
            const isDone = u.frontsData[activeFrente] && u.frontsData[activeFrente].concluido;
            const isActive = !isDone && u.activeFrontIndex === fIdx;
            
            if (filterStatus === 'concluido') return isDone;
            if (filterStatus === 'ativo') return isActive;
            if (filterStatus === 'pendente') return !isDone && !isActive;
            return true;
        });
    }

    if (filterSearch) {
        listUnits = listUnits.filter(u => u.unit.includes(filterSearch));
    }

    if (listUnits.length === 0) {
        tableEl.classList.add('hidden');
        emptyMsg.classList.remove('hidden');
        return;
    }
    
    tableEl.classList.remove('hidden');
    emptyMsg.classList.add('hidden');

    listUnits.forEach((u) => {
        const tr = document.createElement('tr');
        const fData = u.frontsData[activeFrente] || {};
        const isDone = fData.concluido;
        const isActive = !isDone && u.activeFrontIndex === fIdx;
        
        let statusLabel = "";
        let rowClass = "";
        let dateText = "";
        let realDoneDate = `<span class="text-muted">-</span>`;
        
        // Determinar status, classe de pulso e data de conclusão projetada/real
        if (isDone) {
            statusLabel = '<span class="badge bg-green">Concluído</span>';
            dateText = `<span class="text-muted">-</span>`;
            realDoneDate = `<strong class="text-success">${fData.dataFinal}</strong>`;
        } else {
            const projDate = projectionsMap[u.id] || "-";
            const outOfOrder = isUnitOutOfOrder(u);
            const delayed = isUnitDelayed(u, activeFrente);
            
            if (outOfOrder && delayed) {
                rowClass = "tr-pulsing-both";
            } else if (delayed) {
                rowClass = "tr-pulsing-red";
            } else if (outOfOrder) {
                rowClass = "tr-pulsing-purple";
            }
            
            if (isActive) {
                statusLabel = '<span class="badge bg-amber">Em Andamento</span>';
                dateText = `<strong class="text-warning">${projDate}</strong>`;
            } else {
                statusLabel = '<span class="badge" style="background-color: var(--border-color); color: var(--text-secondary)">Pendente</span>';
                dateText = `<span class="text-muted">${projDate}</span>`;
            }
            
            // Adicionar flags de alerta visuais na data
            let warnings = [];
            if (outOfOrder) warnings.push(`<span class="text-purple" style="font-size: 0.75rem; display: block;" title="Uma ou mais etapas anteriores não foram concluídas."><i class="fa fa-triangle-exclamation"></i> Fora de ordem</span>`);
            if (delayed) warnings.push(`<span class="text-danger" style="font-size: 0.75rem; display: block;" title="Projeção estourou a data limite (atrasado)."><i class="fa fa-clock"></i> Atrasado</span>`);
            if (warnings.length > 0) {
                dateText += `<div style="margin-top: 4px;">${warnings.join('')}</div>`;
            }
        }

        if (rowClass) {
            tr.className = rowClass;
        }

        // Material info
        let materialsText = '<span class="text-muted">Sem insumos</span>';
        if (fData.materials && fData.materials.material) {
            materialsText = `
                <div><strong>${fData.materials.material}</strong> (${fData.materials.quantidade})</div>
                <div class="text-muted" style="font-size: 0.75rem;">${fData.materials.tipo || ''} - ${fData.materials.subtipo || ''}</div>
            `;
        }

        // Ações condicionais
        let actionBtn = "";
        if (isDone) {
            actionBtn = `<button class="btn btn-xs btn-outline btn-unit-reopen" data-id="${u.id}" style="color: var(--status-reprovado); border-color: var(--status-reprovado);"><i class="fa fa-arrow-rotate-left"></i> Desfazer</button>`;
        } else if (isActive) {
            actionBtn = `<button class="btn btn-xs btn-primary btn-unit-update" data-id="${u.id}"><i class="fa fa-pen"></i> Alimentar</button>`;
        } else {
            actionBtn = `<button class="btn btn-xs btn-outline btn-unit-update" data-id="${u.id}" disabled style="opacity: 0.4; cursor: not-allowed;"><i class="fa fa-pen"></i> Alimentar</button>`;
        }

        tr.innerHTML = `
            <td><strong>${u.tower}</strong></td>
            <td><strong>${u.unit}</strong></td>
            <td>
                <div style="font-weight: 500;">${statusLabel}</div>
                <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">${fData.responsavel || '-'}</div>
            </td>
            <td>${materialsText}</td>
            <td>${dateText}</td>
            <td>${realDoneDate}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    <button class="btn btn-xs btn-outline btn-unit-view" data-id="${u.id}"><i class="fa fa-eye"></i> Histórico</button>
                    ${actionBtn}
                </div>
            </td>
        `;

        tr.querySelector('.btn-unit-view').addEventListener('click', () => openUnitDetailsModal(u.id));
        if (isDone) {
            tr.querySelector('.btn-unit-reopen').addEventListener('click', () => handleReopenFront(u.id, activeFrente));
        } else if (isActive) {
            tr.querySelector('.btn-unit-update').addEventListener('click', () => openUpdateFrontModal(u.id, activeFrente));
        }

        tableBody.appendChild(tr);
    });
}

// -------------------------------------------------------------
// PAGE 3: HISTÓRICO DE REPROVAS (VQ/VA) METHODS
// -------------------------------------------------------------

function renderReprovasPage() {
    const towerFilter = document.getElementById('filter-rep-tower').value;
    const statusFilter = document.getElementById('filter-rep-status').value;
    const searchQuery = document.getElementById('filter-rep-search').value.toLowerCase().trim();

    const tbody = document.getElementById('table-reprovas-body');
    const emptyMsg = document.getElementById('no-reprovas-msg');
    
    tbody.innerHTML = '';

    let matchedReprovas = [];

    // Gather all reprovas from all units
    projectState.units.forEach(u => {
        u.reprovas.forEach(r => {
            matchedReprovas.push({
                unitId: u.id,
                tower: u.tower,
                unit: u.unit,
                reprova: r
            });
        });
    });

    // Apply Filters
    if (towerFilter !== 'all') {
        matchedReprovas = matchedReprovas.filter(m => m.tower === towerFilter);
    }
    if (statusFilter !== 'all') {
        matchedReprovas = matchedReprovas.filter(m => m.reprova.status === statusFilter);
    }
    if (searchQuery) {
        matchedReprovas = matchedReprovas.filter(m => 
            m.reprova.descricao.toLowerCase().includes(searchQuery) ||
            (m.reprova.material && m.reprova.material.toLowerCase().includes(searchQuery)) ||
            (m.reprova.responsavel && m.reprova.responsavel.toLowerCase().includes(searchQuery))
        );
    }

    if (matchedReprovas.length === 0) {
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');

    // Sort by status (Pendente first)
    matchedReprovas.sort((a, b) => {
        if (a.reprova.status === 'Pendente' && b.reprova.status === 'Resolvido') return -1;
        if (a.reprova.status === 'Resolvido' && b.reprova.status === 'Pendente') return 1;
        return 0;
    });

    matchedReprovas.forEach(m => {
        const r = m.reprova;
        const tr = document.createElement('tr');

        const materialDetails = r.material ? 
            `<div><strong>${r.material}</strong></div><div class="text-muted" style="font-size: 0.75rem;">${r.tipo_material || ''} - ${r.subtipo_material || ''}</div>` : 
            '<span class="text-muted">Sem materiais</span>';

        tr.innerHTML = `
            <td>${m.tower}</td>
            <td><strong>${m.unit}</strong></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-primary)">${r.servico}</span></td>
            <td>${r.local}</td>
            <td>${r.descricao}</td>
            <td>${materialDetails}</td>
            <td>${r.quantidade_material || '-'}</td>
            <td>${r.responsavel || '-'}</td>
            <td>
                <span class="badge" style="background-color: ${r.status === 'Pendente' ? 'var(--status-reprovado)' : 'var(--status-aprovado)'}">
                    ${r.status}
                </span>
            </td>
            <td>
                ${r.status === 'Pendente' ? `
                    <button class="btn btn-xs btn-primary btn-resolve-reprova" data-unit-id="${m.unitId}" data-rep-id="${r.id}">
                        <i class="fa fa-check"></i> Resolver
                    </button>
                ` : '<i class="fa fa-circle-check text-success"></i> Resolvido'}
            </td>
        `;

        const btnResolve = tr.querySelector('.btn-resolve-reprova');
        if (btnResolve) {
            btnResolve.addEventListener('click', () => {
                const uId = btnResolve.dataset.unitId;
                const rId = btnResolve.dataset.repId;
                resolveReprova(uId, rId);
            });
        }

        tbody.appendChild(tr);
    });
}

function resolveReprova(unitId, reprovaId) {
    const unit = projectState.units.find(u => u.id === unitId);
    if (unit) {
        const rep = unit.reprovas.find(r => r.id === reprovaId);
        if (rep) {
            rep.status = 'Resolvido';
            rep.data_fim = new Date().toLocaleDateString('pt-BR');
            
            // Re-evaluate general unit status if no pending reprovas
            const hasPending = unit.reprovas.some(r => r.status === 'Pendente');
            if (!hasPending) {
                if (unit.activeFrontIndex === 12) {
                    unit.status_geral = 'Aprovado';
                } else {
                    unit.status_geral = 'Ativo';
                }
            }
            
            saveState();
            renderReprovasPage();
            renderSummaryStats();
            renderTowers();
        }
    }
}

function exportReprovasCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Torre,Unidade,Servico,Local,Descricao,Material,Tipo,Subtipo,Quantidade,Responsavel,Status,DataInicio,DataFim\n";

    projectState.units.forEach(u => {
        u.reprovas.forEach(r => {
            const row = [
                u.tower,
                u.unit,
                r.servico,
                r.local,
                `"${r.descricao.replace(/"/g, '""')}"`,
                `"${(r.material || '').replace(/"/g, '""')}"`,
                `"${(r.tipo_material || '').replace(/"/g, '""')}"`,
                `"${(r.subtipo_material || '').replace(/"/g, '""')}"`,
                r.quantidade_material || '',
                `"${(r.responsavel || '').replace(/"/g, '""')}"`,
                r.status,
                r.data_inicio || '',
                r.data_fim || ''
            ].join(",");
            csvContent += row + "\n";
        });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mrv_reprovas_mats_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// -------------------------------------------------------------
// PAGE 4: GERENCIAR USUÁRIOS METHODS
// -------------------------------------------------------------

function renderUsersList() {
    const tbody = document.getElementById('table-users-body');
    tbody.innerHTML = '';

    projectState.users.forEach(u => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${u.name}</strong></td>
            <td><code>${u.username}</code></td>
            <td><span class="badge ${u.role === 'admin' ? 'bg-green' : 'bg-blue'}">${u.role === 'admin' ? 'Administrador' : 'Fiscal'}</span></td>
            <td>
                ${u.username === 'rafael.samorim' ? '<span class="text-muted">Sistema</span>' : `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-xs btn-outline btn-edit-user" data-username="${u.username}"><i class="fa fa-pen"></i></button>
                        <button class="btn btn-xs btn-danger btn-delete-user" data-username="${u.username}"><i class="fa fa-trash"></i></button>
                    </div>
                `}
            </td>
        `;

        const btnEdit = tr.querySelector('.btn-edit-user');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => {
                const targetUser = projectState.users.find(usr => usr.username === btnEdit.dataset.username);
                if (targetUser) {
                    document.getElementById('modal-user-title-action').textContent = "Editar Usuário";
                    document.getElementById('user-edit-mode').value = "true";
                    document.getElementById('user-username').value = targetUser.username;
                    document.getElementById('user-username').disabled = true;
                    document.getElementById('user-fullname').value = targetUser.name;
                    document.getElementById('user-password').value = targetUser.password;
                    document.getElementById('user-role').value = targetUser.role;
                    modalAddUser.classList.remove('hidden');
                }
            });
        }

        const btnDelete = tr.querySelector('.btn-delete-user');
        if (btnDelete) {
            btnDelete.addEventListener('click', () => {
                if (confirm(`Deseja realmente deletar o usuário ${u.name}?`)) {
                    projectState.users = projectState.users.filter(usr => usr.username !== u.username);
                    saveState();
                    renderUsersList();
                }
            });
        }

        tbody.appendChild(tr);
    });
}

function handleAddUserSubmit(e) {
    e.preventDefault();
    const isEdit = document.getElementById('user-edit-mode').value === 'true';
    const fullname = document.getElementById('user-fullname').value.trim();
    const username = document.getElementById('user-username').value.trim().toLowerCase();
    const pass = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;

    if (isEdit) {
        const user = projectState.users.find(u => u.username === username);
        if (user) {
            user.name = fullname;
            user.password = pass;
            user.role = role;
        }
    } else {
        // Check duplicate
        if (projectState.users.some(u => u.username === username)) {
            alert("Este nome de usuário já está cadastrado.");
            return;
        }
        projectState.users.push({
            username: username,
            password: pass,
            role: role,
            name: fullname
        });
    }

    saveState();
    modalAddUser.classList.add('hidden');
    renderUsersList();
}

// -------------------------------------------------------------
// PAGE 5: CONFIGURAÇÕES DA OBRA METHODS
// -------------------------------------------------------------

function renderConfigTowers() {
    const root = document.getElementById('config-towers-list-root');
    root.innerHTML = '';

    projectState.towers.forEach((t, idx) => {
        const card = document.createElement('div');
        card.className = 'config-tower-card';
        card.dataset.index = idx;
        
        card.innerHTML = `
            <button type="button" class="btn-remove-tower" title="Excluir Torre"><i class="fa fa-trash"></i></button>
            <div class="form-group">
                <label>Nome da Torre / Bloco</label>
                <input type="text" class="config-t-name" value="${t.name}" required>
            </div>
            <div class="form-row">
                <div class="form-group col">
                    <label>Pavimentos</label>
                    <input type="number" class="config-t-floors" value="${t.floors}" min="1" max="30" required>
                </div>
                <div class="form-group col">
                    <label>Aptos por Pav.</label>
                    <input type="number" class="config-t-units" value="${t.unitsPerFloor}" min="1" max="12" required>
                </div>
            </div>
        `;

        card.querySelector('.btn-remove-tower').addEventListener('click', () => {
            if (confirm(`Atenção: Excluir a torre ${t.name} apagará todas as unidades e histórico associados. Confirmar?`)) {
                card.remove();
            }
        });

        root.appendChild(card);
    });
}

function addTowerConfigRow() {
    const root = document.getElementById('config-towers-list-root');
    const idx = root.children.length;
    
    const card = document.createElement('div');
    card.className = 'config-tower-card';
    card.dataset.index = idx;
    
    card.innerHTML = `
        <button type="button" class="btn-remove-tower" title="Excluir Torre"><i class="fa fa-trash"></i></button>
        <div class="form-group">
            <label>Nome da Torre / Bloco</label>
            <input type="text" class="config-t-name" value="Torre 0${idx + 1}" required>
        </div>
        <div class="form-row">
            <div class="form-group col">
                <label>Pavimentos</label>
                <input type="number" class="config-t-floors" value="10" min="1" max="30" required>
            </div>
            <div class="form-group col">
                <label>Aptos por Pav.</label>
                <input type="number" class="config-t-units" value="8" min="1" max="12" required>
            </div>
        </div>
    `;

    card.querySelector('.btn-remove-tower').addEventListener('click', () => {
        card.remove();
    });

    root.appendChild(card);
}

function handleConfigTowersSubmit(e) {
    e.preventDefault();
    const rows = document.querySelectorAll('.config-tower-card');
    const newTowers = [];
    const newUnits = [];

    rows.forEach(row => {
        const name = row.querySelector('.config-t-name').value.trim();
        const floors = parseInt(row.querySelector('.config-t-floors').value);
        const unitsPerFloor = parseInt(row.querySelector('.config-t-units').value);
        
        newTowers.push({ name, floors, unitsPerFloor });

        // Generate units for this configured tower, reusing state if existing
        for (let f = floors; f >= 1; f--) {
            for (let u = 1; u <= unitsPerFloor; u++) {
                const unitNum = `${f}` + String(u).padStart(2, '0');
                const tCode = name.replace(/\s+/g, '').substring(0, 2).toUpperCase(); // e.g. T1, T2
                const id = `${tCode}-${unitNum}`;

                // Try to find if this unit already existed in previous state
                const existing = projectState.units.find(x => x.tower === name && x.floor == f && x.unit == unitNum);

                if (existing) {
                    newUnits.push(existing);
                } else {
                    // Create new unit
                    const fronts = {};
                    FRENTES_SEQUENCIA.forEach(frente => {
                        fronts[frente] = {
                            responsavel: "",
                            dataInicio: "",
                            dataFinal: "",
                            duracaoProj: 0,
                            duracaoReal: 0,
                            concluido: false,
                            materials: {}
                        };
                    });

                    newUnits.push({
                        id: id,
                        tower: name,
                        floor: f,
                        unit: unitNum,
                        status_geral: "Ativo",
                        activeFrontIndex: 0,
                        frontsData: fronts,
                        reprovas: []
                    });
                }
            }
        }
    });

    projectState.towers = newTowers;
    projectState.units = newUnits;
    
    saveState();
    alert("Estrutura da obra salva com sucesso!");
    navigateToPage('page-mapa');
}

function resetAllProjectData() {
    if (confirm("ATENÇÃO: Isso apagará TODOS os avanços, materiais e reprovas cadastrados. Você quer zerar toda a obra?")) {
        // Reset every unit to index 0, clean histories
        projectState.units.forEach(u => {
            u.status_geral = "Ativo";
            u.activeFrontIndex = 0;
            u.reprovas = [];
            FRENTES_SEQUENCIA.forEach(frente => {
                u.frontsData[frente] = {
                    responsavel: "",
                    dataInicio: "",
                    dataFinal: "",
                    duracaoProj: 0,
                    duracaoReal: 0,
                    concluido: false,
                    materials: {}
                };
            });
        });
        // Reset config
        projectState.frentesConfig = {};
        FRENTES_SEQUENCIA.forEach(f => {
            projectState.frentesConfig[f] = {
                dataInicio: "2026-06-08",
                capacidadeDia: 2
            };
        });
        saveState();
        alert("A obra foi completamente reiniciada!");
        navigateToPage('page-mapa');
    }
}

async function restoreSplendoreSeed() {
    if (confirm("Deseja realmente restaurar os dados originais importados da Planilha Splendore? Todos os novos lançamentos serão perdidos.")) {
        localStorage.removeItem('mrv_project_state');
        await loadSeedData();
        alert("Dados semente da Planilha Splendore restaurados!");
        navigateToPage('page-mapa');
    }
}

// -------------------------------------------------------------
// MODALS METHODS & HANDLERS
// -------------------------------------------------------------

function openUnitDetailsModal(unitId) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    const modal = document.getElementById('modal-unit-details');
    modal.dataset.unitId = unitId;
    
    // Set headers
    document.getElementById('modal-unit-title').textContent = `${u.tower} - Apto ${u.unit}`;
    document.getElementById('modal-unit-title').dataset.unitId = unitId;
    
    // Popular e selecionar a frente de serviço no dropdown manual do modal
    const selector = document.getElementById('modal-unit-active-front-selector');
    selector.innerHTML = '';
    FRENTES_SEQUENCIA.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f;
        opt.textContent = f;
        selector.appendChild(opt);
    });
    const optDone = document.createElement('option');
    optDone.value = "Concluido";
    optDone.textContent = "Concluído (VA)";
    selector.appendChild(optDone);

    if (u.activeFrontIndex === 12) {
        selector.value = "Concluido";
    } else {
        selector.value = FRENTES_SEQUENCIA[u.activeFrontIndex];
    }
    
    // Status Badge
    const badge = document.getElementById('modal-unit-status-badge');
    badge.textContent = u.status_geral;
    badge.className = "badge";
    if (u.status_geral === 'Aprovado') badge.classList.add('bg-green');
    else if (u.status_geral === 'Reprovado') badge.classList.add('bg-red');
    else if (u.status_geral === 'Permutante' || u.status_geral === 'Bloqueado') badge.classList.add('bg-blue');
    else badge.classList.add('bg-amber');

    // Progress Bar
    const progressPercent = Math.round((u.activeFrontIndex / 12) * 100);
    document.getElementById('modal-unit-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('modal-unit-progress-text').textContent = `${u.activeFrontIndex}/12 Frentes Concluídas`;

    // Labels
    document.getElementById('modal-unit-val-tower').textContent = u.tower;
    document.getElementById('modal-unit-val-floor').textContent = `${u.floor}º Andar`;

    // Render Timeline/Workflow
    const timeline = document.getElementById('modal-unit-timeline');
    timeline.innerHTML = '';

    FRENTES_SEQUENCIA.forEach((f, idx) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const fData = u.frontsData[f] || {};
        
        let statusClass = "pending";
        let statusText = "Aguardando frentes anteriores";
        
        if (fData.concluido) {
            statusClass = "done";
            statusText = `Executado por ${fData.responsavel || 'N/D'} em ${fData.dataFinal || ''} (Duração: ${fData.duracaoReal || 1} dias)`;
        } else if (u.activeFrontIndex === idx) {
            statusClass = "active";
            statusText = "Liberado para execução - Em andamento";
        }
        
        item.classList.add(statusClass);
        
        // Materials details
        let matText = "";
        if (fData.concluido && fData.materials && fData.materials.quantidade > 0) {
            matText = `
                <div class="timeline-mats">
                    <strong>Insumo:</strong> ${fData.materials.material} (${fData.materials.quantidade}) - ${fData.materials.tipo || ''} ${fData.materials.subtipo || ''}
                    ${fData.materials.observacao ? `<div style="font-style: italic; font-size: 0.75rem; margin-top: 2px;">Obs: ${fData.materials.observacao}</div>` : ''}
                </div>
            `;
        }

        item.innerHTML = `
            <div class="timeline-dot">
                ${fData.concluido ? '<i class="fa fa-check"></i>' : idx + 1}
            </div>
            <div class="timeline-content">
                <div class="timeline-header">
                    <h4>${f}</h4>
                    <span class="timeline-date">${fData.dataFinal || ''}</span>
                </div>
                <div class="timeline-details">${statusText}</div>
                ${matText}
            </div>
        `;
        timeline.appendChild(item);
    });

    // Render Reprovas
    const repRoot = document.getElementById('modal-unit-reprovas-root');
    repRoot.innerHTML = '';
    
    document.getElementById('modal-unit-rep-count').textContent = u.reprovas.length;

    if (u.reprovas.length === 0) {
        repRoot.innerHTML = '<div class="empty-state" style="padding: 1rem;"><p>Nenhuma reprova histórica registrada.</p></div>';
    } else {
        u.reprovas.forEach(r => {
            const card = document.createElement('div');
            card.className = 'reprova-card';
            
            const matLine = r.material ? `<div style="margin-top: 5px; font-size: 0.8rem;"><strong>Insumo para Correção:</strong> ${r.material} (${r.quantidade_material} x ${r.tipo_material || ''})</div>` : '';
            
            card.innerHTML = `
                <div class="reprova-card-header">
                    <span class="room"><i class="fa fa-location-dot text-danger"></i> ${r.local} (${r.servico})</span>
                    <span class="badge" style="background-color: ${r.status === 'Pendente' ? 'var(--status-reprovado)' : 'var(--status-aprovado)'}">${r.status}</span>
                </div>
                <div class="reprova-card-body">${r.descricao}</div>
                ${matLine}
                <div class="reprova-card-footer">
                    <span>Resp: ${r.responsavel || 'N/D'}</span>
                    <span>Criado: ${r.data_inicio || ''}</span>
                </div>
            `;
            repRoot.appendChild(card);
        });
    }

    // Show Add Reprova button if unit is in VQ or VA step
    const btnAddRep = document.getElementById('modal-btn-add-reprova');
    if ((u.activeFrontIndex === 10 || u.activeFrontIndex === 11) && u.activeFrontIndex < 12) {
        btnAddRep.classList.remove('hidden');
    } else {
        btnAddRep.classList.add('hidden');
    }

    // Set active tab to Workflow by default
    modal.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
    modal.querySelector('[data-tab="modal-tab-workflow"]').classList.add('active');
    modal.querySelector('#modal-tab-workflow').classList.add('active');

    modal.classList.remove('hidden');
}

function convertDMYToYMD(dmy) {
    if (!dmy) return "";
    const parts = dmy.split('/');
    if (parts.length === 3) {
        const d = parts[0].padStart(2, '0');
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${y}-${m}-${d}`;
    }
    return "";
}

function convertYMDToDMY(ymd) {
    if (!ymd) return "";
    const parts = ymd.split('-');
    if (parts.length === 3) {
        const y = parts[0];
        const m = parts[1];
        const d = parts[2];
        return `${d}/${m}/${y}`;
    }
    return "";
}

function openUpdateFrontModal(unitId, frenteName) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    document.getElementById('update-unit-id').value = unitId;
    document.getElementById('update-front-name').value = frenteName;
    document.getElementById('update-unit-display').textContent = `${u.tower} - Apto ${u.unit}`;
    document.getElementById('modal-update-front-name').textContent = frenteName;

    // Load defaults
    const fData = u.frontsData[frenteName] || {};
    document.getElementById('update-resp').value = fData.responsavel || "";
    document.getElementById('update-dur-proj').value = fData.duracaoProj || 1;
    document.getElementById('update-dur-real').value = fData.duracaoReal || 1;

    // Load date default
    let dataFinalVal = "";
    if (fData.dataFinal) {
        dataFinalVal = convertDMYToYMD(fData.dataFinal);
    }
    if (!dataFinalVal) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dataFinalVal = `${yyyy}-${mm}-${dd}`;
    }
    document.getElementById('update-data-final').value = dataFinalVal;

    // Load material defaults if exists
    const m = fData.materials || {};
    document.getElementById('update-mat-nome').value = m.material || "";
    document.getElementById('update-mat-qtd').value = m.quantidade || "";
    document.getElementById('update-mat-tipo').value = m.tipo || "";
    document.getElementById('update-mat-subtipo').value = m.subtipo || "";
    document.getElementById('update-mat-obs').value = m.observacao || "";

    modalUpdateFront.classList.remove('hidden');
}

function saveUpdateFrontFields(unitId, frenteName, isConcluido) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    const fData = u.frontsData[frenteName];
    fData.responsavel = document.getElementById('update-resp').value.trim();
    fData.duracaoProj = parseInt(document.getElementById('update-dur-proj').value) || 1;
    fData.duracaoReal = parseInt(document.getElementById('update-dur-real').value) || 1;

    // Grab unified material inputs as text
    const matNome = document.getElementById('update-mat-nome').value.trim();
    const matQtd = document.getElementById('update-mat-qtd').value.trim();

    if (matNome && matQtd) {
        fData.materials = {
            material: matNome,
            tipo: document.getElementById('update-mat-tipo').value.trim(),
            subtipo: document.getElementById('update-mat-subtipo').value.trim(),
            quantidade: matQtd,
            observacao: document.getElementById('update-mat-obs').value.trim(),
            data_lancamento: fData.materials?.data_lancamento || new Date().toLocaleDateString('pt-BR')
        };
    } else {
        fData.materials = {};
    }

    if (isConcluido) {
        const dataFinalInput = document.getElementById('update-data-final').value;
        if (dataFinalInput) {
            fData.dataFinal = convertYMDToDMY(dataFinalInput);
        } else {
            fData.dataFinal = new Date().toLocaleDateString('pt-BR');
        }
        fData.concluido = true;

        // Advance to next service front
        u.activeFrontIndex++;
        
        // Update general status
        if (u.activeFrontIndex === 12) {
            u.status_geral = 'Aprovado';
        } else {
            u.status_geral = 'Ativo';
        }
    }

    saveState();
}

function handleUpdateFrontSubmit(e) {
    e.preventDefault();
    const unitId = document.getElementById('update-unit-id').value;
    const frenteName = document.getElementById('update-front-name').value;
    
    saveUpdateFrontFields(unitId, frenteName, true);
    
    modalUpdateFront.classList.add('hidden');
    
    // Refresh page data
    if (activePage === 'page-frentes') {
        renderFrentesSubtabs();
        renderFrenteDetails();
    } else if (activePage === 'page-mapa') {
        renderSummaryStats();
        renderTowers();
    }
}

async function handleReopenFront(unitId, frenteName) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;
    
    if (confirm(`Deseja realmente desfazer a conclusão de "${frenteName}" para a unidade ${u.tower} - Apto ${u.unit}?`)) {
        const fData = u.frontsData[frenteName] || {};
        fData.concluido = false;
        fData.dataFinal = "";
        
        // Define activeFrontIndex da unidade para a frente selecionada
        const fIdx = FRENTES_SEQUENCIA.indexOf(frenteName);
        if (fIdx !== -1) {
            u.activeFrontIndex = fIdx;
        }
        
        // Re-avaliar status geral da unidade
        const hasPendingReprova = u.reprovas.some(r => r.status === 'Pendente');
        if (hasPendingReprova) {
            u.status_geral = 'Reprovado';
        } else {
            u.status_geral = 'Ativo';
        }
        
        await saveState();
        
        // Recarregar os detalhes da SPA ativa
        if (activePage === 'page-frentes') {
            renderFrentesSubtabs();
            renderFrenteDetails();
        } else if (activePage === 'page-mapa') {
            renderSummaryStats();
            renderTowers();
        }
    }
}

function openAddReprovaModal(unitId) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    document.getElementById('rep-unit-id').value = unitId;
    document.getElementById('modal-rep-unit-title').textContent = `${u.tower} - Apto ${u.unit}`;
    
    // Reset form
    document.getElementById('form-add-reprova').reset();

    modalAddReprova.classList.remove('hidden');
}

function handleAddReprovaSubmit(e) {
    e.preventDefault();
    const unitId = document.getElementById('rep-unit-id').value;
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    const local = document.getElementById('rep-local').value;
    const desc = document.getElementById('rep-desc').value.trim();
    const resp = document.getElementById('rep-resp').value.trim();
    
    const matNome = document.getElementById('rep-mat-nome').value.trim();
    const matQtdVal = document.getElementById('rep-mat-qtd').value.trim();
    const matTipo = document.getElementById('rep-mat-tipo').value.trim();
    const matSub = document.getElementById('rep-mat-subtipo').value.trim();

    // Create the reproval item
    const newRep = {
        id: uuidv4(),
        descricao: desc,
        responsavel: resp,
        data_inicio: new Date().toLocaleDateString('pt-BR'),
        data_fim: "",
        servico: FRENTES_SEQUENCIA[u.activeFrontIndex], // current front VQ or VA
        local: local,
        status: "Pendente",
        material: matNome || "",
        tipo_material: matNome ? matTipo : "",
        subtipo_material: matNome ? matSub : "",
        quantidade_material: matNome ? matQtdVal : ""
    };

    u.reprovas.push(newRep);
    u.status_geral = "Reprovado"; // Set unit general status to Reprovado

    saveState();
    modalAddReprova.classList.add('hidden');
    
    // Open Unit detail modal back to let user review
    openUnitDetailsModal(unitId);
}

// Simple uuidv4 generator in JS
function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Render unified materials consumption page
function renderInsumosPage() {
    const towerFilter = document.getElementById('filter-ins-tower').value;
    const frenteFilter = document.getElementById('filter-ins-frente').value;
    const searchQuery = document.getElementById('filter-ins-search').value.toLowerCase().trim();
    const tbody = document.getElementById('table-insumos-body');
    const emptyMsg = document.getElementById('no-insumos-msg');
    
    tbody.innerHTML = '';
    let matchedInsumos = [];
    
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            if (fData.materials && fData.materials.material) {
                matchedInsumos.push({
                    tower: u.tower,
                    unit: u.unit,
                    frente: frente,
                    data: fData.materials.data_lancamento || fData.dataFinal || "",
                    responsavel: fData.responsavel || "",
                    material: fData.materials.material,
                    tipo: fData.materials.tipo || "",
                    subtipo: fData.materials.subtipo || "",
                    quantidade: fData.materials.quantidade,
                    observacao: fData.materials.observacao || ""
                });
            }
        });
    });
    
    // Apply filters
    if (towerFilter !== 'all') {
        matchedInsumos = matchedInsumos.filter(m => m.tower === towerFilter);
    }
    if (frenteFilter !== 'all') {
        matchedInsumos = matchedInsumos.filter(m => m.frente === frenteFilter);
    }
    if (searchQuery) {
        matchedInsumos = matchedInsumos.filter(m => 
            m.material.toLowerCase().includes(searchQuery) ||
            m.tipo.toLowerCase().includes(searchQuery) ||
            m.subtipo.toLowerCase().includes(searchQuery) ||
            m.observacao.toLowerCase().includes(searchQuery) ||
            m.unit.toLowerCase().includes(searchQuery) // Permitir busca por unidade
        );
    }
    
    if (matchedInsumos.length === 0) {
        emptyMsg.classList.remove('hidden');
        return;
    }
    emptyMsg.classList.add('hidden');
    
    matchedInsumos.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.tower}</td>
            <td><strong>${m.unit}</strong></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-primary)">${m.frente}</span></td>
            <td>${m.data}</td>
            <td>${m.responsavel}</td>
            <td><strong>${m.material}</strong></td>
            <td>${m.tipo}</td>
            <td>${m.subtipo}</td>
            <td>${m.quantidade}</td>
            <td style="max-width: 250px; font-size: 0.8rem; white-space: normal; word-break: break-word;" title="${m.observacao}">${m.observacao || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Export materials consumption ledger to CSV
function exportInsumosCSV() {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Include BOM for proper Excel encoding
    csvContent += "Torre,Unidade,Frente,DataLancamento,Responsavel,Material,Tipo,Subtipo,Quantidade,Observacao\n";
    
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            if (fData.materials && fData.materials.material) {
                const m = fData.materials;
                const row = [
                    u.tower,
                    u.unit,
                    frente,
                    m.data_lancamento || fData.dataFinal || "",
                    `"${(fData.responsavel || '').replace(/"/g, '""')}"`,
                    `"${m.material.replace(/"/g, '""')}"`,
                    `"${(m.tipo || '').replace(/"/g, '""')}"`,
                    `"${(m.subtipo || '').replace(/"/g, '""')}"`,
                    `"${(m.quantidade || '').replace(/"/g, '""')}"`,
                    `"${(m.observacao || '').replace(/"/g, '""')}"`
                ].join(",");
                csvContent += row + "\n";
            }
        });
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mrv_consumo_insumos_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add days helper function for date projection calculations
function addDays(dateStr, days) {
    if (!dateStr) return "-";
    const date = new Date(dateStr + 'T12:00:00'); // Use noon to avoid timezone shift
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('pt-BR');
}

// Helper para detectar se a unidade pulou alguma etapa (Executada fora de ordem)
function isUnitOutOfOrder(unit) {
    const activeIdx = unit.activeFrontIndex;
    // Unidade na frente inicial (Janela = 0) ou concluída (12) não são consideradas fora de ordem
    if (activeIdx === 0 || activeIdx >= 12) return false;

    // Verifica se alguma frente anterior não foi concluída
    for (let i = 0; i < activeIdx; i++) {
        const priorFront = FRENTES_SEQUENCIA[i];
        const fData = unit.frontsData[priorFront] || {};
        if (!fData.concluido) {
            return true;
        }
    }
    return false;
}

// Helper para detectar se a unidade está atrasada em relação à projeção
function isUnitDelayed(unit, frenteName) {
    // Se a unidade já concluiu o serviço, não está atrasada
    const fData = unit.frontsData[frenteName] || {};
    if (fData.concluido) return false;

    // Obter fila ordenada de pendentes
    const pending = projectState.units.filter(u => !u.frontsData[frenteName] || !u.frontsData[frenteName].concluido);
    pending.sort((a, b) => {
        if (a.tower !== b.tower) return a.tower.localeCompare(b.tower);
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.unit.localeCompare(b.unit);
    });

    const idx = pending.findIndex(u => u.id === unit.id);
    if (idx === -1) return false;

    const fConfig = projectState.frentesConfig[frenteName] || { dataInicio: "2026-06-08", capacidadeDia: 2 };
    const cap = parseFloat(fConfig.capacidadeDia) || 1;
    const days = Math.floor(idx / cap);
    const projDateStr = addDays(fConfig.dataInicio, days);

    return isDatePast(projDateStr);
}

// Auxiliar para checar se a data informada está no passado em relação a hoje
function isDatePast(dateStr) {
    if (!dateStr || dateStr === "-") return false;
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    const projDate = new Date(year, month, day, 23, 59, 59); // Fim daquele dia projetado
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Início do dia de hoje
    
    return projDate < today;
}

// Handler para mudança manual de frentes de serviço no dropdown do modal
async function handleManualActiveFrontChange(e) {
    const selector = e.target;
    const unitId = document.getElementById('modal-unit-title').dataset.unitId;
    const unit = projectState.units.find(u => u.id === unitId);
    if (!unit) return;

    const selectedVal = selector.value;
    let targetIndex = 12;
    if (selectedVal !== "Concluido") {
        targetIndex = FRENTES_SEQUENCIA.indexOf(selectedVal);
    }

    if (targetIndex === -1) return;

    unit.activeFrontIndex = targetIndex;

    // Atualizar status geral do apartamento
    if (targetIndex === 12) {
        unit.status_geral = 'Aprovado';
    } else {
        const hasPendingReprova = unit.reprovas.some(r => r.status === 'Pendente');
        if (hasPendingReprova) {
            unit.status_geral = 'Reprovado';
        } else {
            unit.status_geral = 'Ativo';
        }
    }

    await saveState();

    // Recarregar os detalhes do modal aberto
    openUnitDetailsModal(unit.id);

    // Recarregar as visualizações da SPA ativa
    if (activePage === 'page-mapa') {
        renderSummaryStats();
        renderTowers();
    } else if (activePage === 'page-frentes') {
        renderFrentesSubtabs();
        renderFrenteDetails();
    }
}

// Renderizar lista de colaboradores no modal de gerenciamento
function renderColaboradoresList() {
    const fConfig = projectState.frentesConfig[activeFrente];
    if (!fConfig.colaboradores) {
        fConfig.colaboradores = [];
    }

    const tbody = document.getElementById('table-colab-body');
    const emptyMsg = document.getElementById('colab-empty-msg');
    tbody.innerHTML = '';

    if (fConfig.colaboradores.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
        fConfig.colaboradores.forEach((c, idx) => {
            const tr = document.createElement('tr');
            tr.style.borderBottom = '1px solid var(--border-color)';
            
            tr.innerHTML = `
                <td style="padding: 0.75rem;"><strong>${c.nome}</strong></td>
                <td style="padding: 0.75rem;">${c.empresa}</td>
                <td style="padding: 0.75rem;">${c.produtividade} aptos / ${c.periodo === 'dia' ? 'dia' : c.periodo === 'semana' ? 'semana' : 'mês'}</td>
                <td style="padding: 0.75rem; text-align: center;">
                    <button type="button" class="btn btn-xs btn-danger btn-delete-colab" data-idx="${idx}"><i class="fa fa-trash"></i></button>
                </td>
            `;

            const btnDelete = tr.querySelector('.btn-delete-colab');
            btnDelete.addEventListener('click', () => {
                fConfig.colaboradores.splice(idx, 1);
                recalculateFrenteCapacity();
                saveState();
                renderColaboradoresList();
                renderFrenteDetails();
            });

            tbody.appendChild(tr);
        });
    }
}

// Recalcular capacidade produtiva da frente com base na soma dos colaboradores
function recalculateFrenteCapacity() {
    const fConfig = projectState.frentesConfig[activeFrente];
    if (!fConfig.colaboradores || fConfig.colaboradores.length === 0) {
        return;
    }
    
    let sum = 0;
    fConfig.colaboradores.forEach(c => {
        let rate = parseFloat(c.produtividade) || 0;
        if (c.periodo === 'semana') {
            sum += rate / 5; // 5 working days
        } else if (c.periodo === 'mes') {
            sum += rate / 30; // 30 calendar days
        } else {
            sum += rate; // daily
        }
    });
    fConfig.capacidadeDia = Math.round(sum * 1000) / 1000;
}

// Carregar lista global de colaboradores
async function loadGlobalCollaborators() {
    if (syncMode === 'api') {
        try {
            const response = await fetch('/api/collaborators');
            if (response.ok) {
                globalCollaborators = await response.json();
                updateDatalistGlobalColabs();
                return;
            }
        } catch (e) {
            console.error("Error loading global collaborators", e);
        }
    }
    
    // Fallback local
    const localData = localStorage.getItem('mrv_global_collaborators');
    if (localData) {
        try {
            globalCollaborators = JSON.parse(localData);
        } catch (e) {
            globalCollaborators = [];
        }
    } else {
        globalCollaborators = [];
    }
    updateDatalistGlobalColabs();
}

// Salvar lista global de colaboradores
async function saveGlobalCollaborators() {
    if (syncMode === 'api') {
        try {
            await fetch('/api/collaborators', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(globalCollaborators)
            });
        } catch (e) {
            console.error("Error saving global collaborators", e);
        }
    } else {
        localStorage.setItem('mrv_global_collaborators', JSON.stringify(globalCollaborators));
    }
}

// Atualizar datalist HTML com os colaboradores globais para autocompletar
function updateDatalistGlobalColabs() {
    const dl = document.getElementById('datalist-global-colabs');
    if (!dl) return;
    dl.innerHTML = '';
    globalCollaborators.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.nome;
        opt.textContent = c.empresa; // Mostrar empresa
        dl.appendChild(opt);
    });
}
