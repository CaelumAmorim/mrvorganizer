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
let activeModalMaterials = [];

const FRENTES_SEQUENCIA = [
    "REGULARIZAÇÃO DE PAREDE (gesso/argamassa)",
    "PRUMADA E DISTR. ESGOTO",
    "PRUMADA E DISTR. ÁGUA FRIA",
    "CHURRASQUEIRA",
    "EXAUSTÃO CHURRASQUEIRA",
    "DRYWALL / FORRO GESSO",
    "Cavaletes",
    "DISJUNTORES E QDC",
    "PRUMADA DE INCÊNDIO / HIDRANTE",
    "JANELAS",
    "IMPERMEABILIZAÇÃO",
    "Instalação QM",
    "Passagem dos cabos",
    "Rejunte",
    "PISO CERAMICO / AZULEJO",
    "PISO HALL",
    "PORTA CORTA FOGO (portal)",
    "PORTA DE SACADA",
    "PINTURA 1ª FASE",
    "PINTURA 1ª FASE HALL",
    "LIMPEZA GROSSA",
    "MÓDULOS ELÉTRICOS",
    "LOUÇAS E BANCADAS",
    "PRUMADA DE GÁS",
    "GÁS INTERNO APTO",
    "REGULARIZAÇÃO PISO LAMINADO",
    "PISO LAMINADO",
    "PORTA PRONTA MADEIRA",
    "TORNEIRAS E METAIS",
    "Checklist",
    "Limpeza Fina",
    "VQ",
    "Passada de Pano",
    "VA"
];

const FRENTES_DESCRICOES = {
    "REGULARIZAÇÃO DE PAREDE (gesso/argamassa)": "Regularização de superfícies de alvenaria com gesso ou argamassa.",
    "PRUMADA E DISTR. ESGOTO": "Instalação da prumada vertical e tubulação de distribuição de esgoto.",
    "PRUMADA E DISTR. ÁGUA FRIA": "Instalação da prumada vertical e tubulação de distribuição de água fria.",
    "CHURRASQUEIRA": "Montagem ou execução da churrasqueira na varanda/área gourmet.",
    "EXAUSTÃO CHURRASQUEIRA": "Instalação dos dutos e sistema de exaustão da churrasqueira.",
    "DRYWALL / FORRO GESSO": "Montagem de paredes em drywall e forros de gesso.",
    "Cavaletes": "Instalação e conexões dos cavaletes de medição de água individualizada.",
    "DISJUNTORES E QDC": "Montagem dos disjuntores no Quadro de Distribuição de Carga geral.",
    "PRUMADA DE INCÊNDIO / HIDRANTE": "Montagem da rede de incêndio, prumada e conexões para hidrantes.",
    "JANELAS": "Fixação de contra-marcos e instalação de esquadrias e vidros das janelas.",
    "IMPERMEABILIZAÇÃO": "Aplicação de impermeabilizante nas áreas úmidas (banheiro, sacada).",
    "Instalação QM": "Montagem do Quadro de Medição (QM) de energia do apartamento.",
    "Passagem dos cabos": "Enfiamento dos cabos elétricos pelos conduítes de distribuição.",
    "Rejunte": "Aplicação de rejunte técnico nas juntas de pisos e revestimentos cerâmicos.",
    "PISO CERAMICO / AZULEJO": "Assentamento de cerâmicas e azulejos nas paredes e pisos das áreas frias.",
    "PISO HALL": "Instalação e acabamento do piso cerâmico no hall comum dos andares.",
    "PORTA CORTA FOGO (portal)": "Instalação do portal e dobradiças da porta corta-fogo de acesso.",
    "PORTA DE SACADA": "Instalação de esquadrias e folhas de vidro da porta da sacada.",
    "PINTURA 1ª FASE": "Preparação com selador, lixamento e primeira demão de massa corrida/tinta.",
    "PINTURA 1ª FASE HALL": "Preparação e primeira demão de pintura nas paredes do hall comum.",
    "LIMPEZA GROSSA": "Limpeza pós-obra pesada para remoção de resíduos e excessos de materiais.",
    "MÓDULOS ELÉTRICOS": "Instalação final de interruptores, tomadas e espelhos de acabamento.",
    "LOUÇAS E BANCADAS": "Instalação de bancadas de pedra, cubas, vasos sanitários e tanques.",
    "PRUMADA DE GÁS": "Instalação da prumada de alimentação geral de gás do bloco.",
    "GÁS INTERNO APTO": "Passagem e conexão da rede interna de gás para fogão/aquecedor.",
    "REGULARIZAÇÃO PISO LAMINADO": "Execução e nivelamento do contrapiso para receber o piso laminado.",
    "PISO LAMINADO": "Instalação do piso laminado de madeira e fixação de rodapés nas salas/quartos.",
    "PORTA PRONTA MADEIRA": "Instalação dos kits de porta pronta de madeira com fechaduras e dobradiças.",
    "TORNEIRAS E METAIS": "Instalação de misturadores, torneiras, chuveiros e acessórios metálicos.",
    "Checklist": "Vistoria prévia da equipe para saneamento de pequenas pendências.",
    "Limpeza Fina": "Limpeza fina, polimento e higienização detalhada de todo o apartamento.",
    "VQ": "Vistoria da Qualidade interna. Qualquer item reprovado gera pendência no histórico.",
    "Passada de Pano": "Limpeza leve final de piso e superfícies para recebimento do cliente.",
    "VA": "Vistoria de Entrega do Apartamento ao cliente final com registro de pendências."
};

// Colors associated with each front
const FRENTES_CORES = {
    "REGULARIZAÇÃO DE PAREDE (gesso/argamassa)": "#475569",
    "PRUMADA E DISTR. ESGOTO": "#0284c7",
    "PRUMADA E DISTR. ÁGUA FRIA": "#0369a1",
    "CHURRASQUEIRA": "#b45309",
    "EXAUSTÃO CHURRASQUEIRA": "#78350f",
    "DRYWALL / FORRO GESSO": "#6366f1",
    "Cavaletes": "#0d9488",
    "DISJUNTORES E QDC": "#4f46e5",
    "PRUMADA DE INCÊNDIO / HIDRANTE": "#dc2626",
    "JANELAS": "#2563eb",
    "IMPERMEABILIZAÇÃO": "#0891b2",
    "Instalação QM": "#3b82f6",
    "Passagem dos cabos": "#818cf8",
    "Rejunte": "#db2777",
    "PISO CERAMICO / AZULEJO": "#c084fc",
    "PISO HALL": "#a855f7",
    "PORTA CORTA FOGO (portal)": "#991b1b",
    "PORTA DE SACADA": "#1d4ed8",
    "PINTURA 1ª FASE": "#f43f5e",
    "PINTURA 1ª FASE HALL": "#e11d48",
    "LIMPEZA GROSSA": "#10b981",
    "MÓDULOS ELÉTRICOS": "#f59e0b",
    "LOUÇAS E BANCADAS": "#14b8a6",
    "PRUMADA DE GÁS": "#059669",
    "GÁS INTERNO APTO": "#047857",
    "REGULARIZAÇÃO PISO LAMINADO": "#ea580c",
    "PISO LAMINADO": "#ca8a04",
    "PORTA PRONTA MADEIRA": "#854d0e",
    "TORNEIRAS E METAIS": "#0891b2",
    "Checklist": "#0d9488",
    "Limpeza Fina": "#06b6d4",
    "VQ": "#eab308",
    "Passada de Pano": "#10b981",
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
const statVqAprovados = document.getElementById('stat-vq-aprovados');
const statVqReprovados = document.getElementById('stat-vq-reprovados');
const statVaAprovados = document.getElementById('stat-va-aprovados');
const statVaReprovados = document.getElementById('stat-va-reprovados');
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

    let loaded = false;
    try {
        dbModeIndicator.textContent = "Verificando servidor...";
        const response = await fetch('/api/project?name=' + encodeURIComponent(activeProjectName));
        if (response.ok) {
            const data = await response.json();
            projectState = data;
            syncMode = 'api';
            updateConnectionBadge(true);
            dbModeIndicator.textContent = `Conectado: ${projectState.name || activeProjectName}`;
            loaded = true;
        }
    } catch (e) {
        console.log("No backend detected, using local browser database.");
    }
    
    if (!loaded) {
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
    }

    // Ensure state indices and frentes config are fully migrated and loaded
    if (projectState) {
        await migrateUnitIndices();

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

// Migrate old unit indices and frontsData keys to match the new 34 fronts sequence
async function migrateUnitIndices() {
    if (!projectState || !projectState.units) return;
    
    // Check if migration has already run for this state
    if (projectState.frentesMigrationRun) return;
    
    console.log("Running service fronts index migration...");
    
    const OLD_FRENTES = [
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
    
    const OLD_TO_NEW_MAP = {
        "Janela": "JANELAS",
        "Impermeabilização": "IMPERMEABILIZAÇÃO",
        "Drywall": "DRYWALL / FORRO GESSO",
        "Piso": "PISO CERAMICO / AZULEJO",
        "Rejunte": "Rejunte",
        "Pintura": "PINTURA 1ª FASE",
        "Limpeza": "LIMPEZA GROSSA",
        "Regularização": "REGULARIZAÇÃO PISO LAMINADO",
        "Piso Laminado": "PISO LAMINADO",
        "Checklist": "Checklist",
        "VQ": "VQ",
        "VA": "VA"
    };

    projectState.units.forEach(u => {
        // 1. Migrate frontsData keys
        if (u.frontsData) {
            const newFrontsData = {};
            
            // Initialize all new fronts as incomplete
            FRENTES_SEQUENCIA.forEach(f => {
                newFrontsData[f] = { concluido: false };
            });
            
            // Copy old data into the new keys
            Object.keys(u.frontsData).forEach(oldKey => {
                const newKey = OLD_TO_NEW_MAP[oldKey] || oldKey;
                if (FRENTES_SEQUENCIA.includes(newKey)) {
                    newFrontsData[newKey] = u.frontsData[oldKey];
                }
            });
            
            u.frontsData = newFrontsData;
        }

        // 2. Migrate activeFrontIndex
        const oldIndex = u.activeFrontIndex;
        
        let completedCount = 0;
        if (u.frontsData) {
            Object.values(u.frontsData).forEach(fd => {
                if (fd && fd.concluido) completedCount++;
            });
        }
        
        if (completedCount === 0 && oldIndex === 0) {
            // No progress at all, start at the new sequence index 0
            u.activeFrontIndex = 0;
        } else if (oldIndex === 12) {
            u.activeFrontIndex = FRENTES_SEQUENCIA.length;
        } else if (oldIndex >= 0 && oldIndex < 12) {
            const oldName = OLD_FRENTES[oldIndex];
            const newName = OLD_TO_NEW_MAP[oldName];
            const newIndex = FRENTES_SEQUENCIA.indexOf(newName);
            if (newIndex !== -1) {
                u.activeFrontIndex = newIndex;
            } else {
                u.activeFrontIndex = 0;
            }
        }
    });

    projectState.frentesMigrationRun = true;
    await saveState();
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

    // User Modal Password view toggle
    const toggleUserPasswordBtn = document.getElementById('toggle-user-password');
    const userPasswordInput = document.getElementById('user-password');
    if (toggleUserPasswordBtn && userPasswordInput) {
        toggleUserPasswordBtn.addEventListener('click', () => {
            if (userPasswordInput.type === 'password') {
                userPasswordInput.type = 'text';
                toggleUserPasswordBtn.querySelector('i').className = 'fa fa-eye-slash';
            } else {
                userPasswordInput.type = 'password';
                toggleUserPasswordBtn.querySelector('i').className = 'fa fa-eye';
            }
        });
    }

    // Change Password trigger
    const btnChangePasswordTrigger = document.getElementById('btn-change-password-trigger');
    const modalChangePassword = document.getElementById('modal-change-password');
    const formChangePassword = document.getElementById('form-change-password');
    
    if (btnChangePasswordTrigger && modalChangePassword) {
        btnChangePasswordTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            // Reset input values
            document.getElementById('ch-current-password').value = '';
            document.getElementById('ch-new-password').value = '';
            document.getElementById('ch-confirm-password').value = '';
            // Reset types
            document.getElementById('ch-current-password').type = 'password';
            document.getElementById('ch-new-password').type = 'password';
            document.getElementById('ch-confirm-password').type = 'password';
            
            const i1 = document.getElementById('toggle-ch-curr-password')?.querySelector('i');
            const i2 = document.getElementById('toggle-ch-new-password')?.querySelector('i');
            const i3 = document.getElementById('toggle-ch-conf-password')?.querySelector('i');
            if (i1) i1.className = 'fa fa-eye';
            if (i2) i2.className = 'fa fa-eye';
            if (i3) i3.className = 'fa fa-eye';

            modalChangePassword.classList.remove('hidden');
        });
    }

    // Toggle password view icons for Change Password fields
    setupPwdToggle('toggle-ch-curr-password', 'ch-current-password');
    setupPwdToggle('toggle-ch-new-password', 'ch-new-password');
    setupPwdToggle('toggle-ch-conf-password', 'ch-confirm-password');

    function setupPwdToggle(btnId, inputId) {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        if (btn && input) {
            btn.addEventListener('click', () => {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.querySelector('i').className = 'fa fa-eye-slash';
                } else {
                    input.type = 'password';
                    btn.querySelector('i').className = 'fa fa-eye';
                }
            });
        }
    }

    // Handle Change Password Form submit
    if (formChangePassword) {
        formChangePassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currPass = document.getElementById('ch-current-password').value;
            const newPass = document.getElementById('ch-new-password').value;
            const confPass = document.getElementById('ch-confirm-password').value;

            if (!currentUser) {
                alert("Nenhum usuário logado.");
                return;
            }

            if (currentUser.password !== currPass) {
                alert("A senha atual digitada está incorreta.");
                return;
            }

            if (newPass !== confPass) {
                alert("A nova senha e a confirmação não coincidem.");
                return;
            }

            if (newPass.length < 4) {
                alert("A nova senha deve possuir pelo menos 4 caracteres.");
                return;
            }

            // Find current user object in state and update it
            const userInState = projectState.users.find(u => u.username === currentUser.username);
            if (userInState) {
                userInState.password = newPass;
                currentUser.password = newPass;
                sessionStorage.setItem('mrv_current_user', JSON.stringify(currentUser));
                await saveState();
                alert("Senha alterada com sucesso!");
                modalChangePassword.classList.add('hidden');
            } else {
                alert("Erro ao encontrar usuário no banco de dados local.");
            }
        });
    }

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
        
        // Reset role theme
        document.body.classList.remove('theme-green-light', 'theme-black-elegant', 'theme-gold-premium');
        
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

    // Dynamic Material Add
    const btnAddMatItem = document.getElementById('btn-add-material-item');
    if (btnAddMatItem) {
        btnAddMatItem.addEventListener('click', () => {
            const nomeInput = document.getElementById('add-mat-nome');
            const qtdInput = document.getElementById('add-mat-qtd');
            const tipoInput = document.getElementById('add-mat-tipo');
            const subtipoInput = document.getElementById('add-mat-subtipo');
            const obsInput = document.getElementById('add-mat-obs');
            
            const nome = nomeInput.value.trim();
            const qtd = qtdInput.value.trim();
            
            if (!nome || !qtd) {
                alert("Por favor, preencha o nome do material e a quantidade.");
                return;
            }
            
            activeModalMaterials.push({
                material: nome,
                quantidade: qtd,
                tipo: tipoInput.value.trim(),
                subtipo: subtipoInput.value.trim(),
                observacao: obsInput.value.trim(),
                data_lancamento: new Date().toLocaleDateString('pt-BR')
            });
            
            nomeInput.value = "";
            qtdInput.value = "";
            tipoInput.value = "";
            subtipoInput.value = "";
            obsInput.value = "";
            
            renderActiveModalMaterials();
        });
    }

    // Form Add Reprova
    document.getElementById('form-add-reprova').addEventListener('submit', handleAddReprovaSubmit);

    // VQ/VA batch reprova spreadsheet listeners
    const btnAddExcelRow = document.getElementById('btn-modal-rep-excel-add-row');
    if (btnAddExcelRow) {
        btnAddExcelRow.addEventListener('click', () => addExcelReprovaRow());
    }
    const btnSaveExcelRep = document.getElementById('btn-modal-rep-excel-save');
    if (btnSaveExcelRep) {
        btnSaveExcelRep.addEventListener('click', saveExcelReprovas);
    }

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

    // Column filter input changes
    document.querySelectorAll('.col-filter-input').forEach(input => {
        input.addEventListener('input', renderInsumosPage);
    });
    document.querySelectorAll('.rep-col-filter-input').forEach(input => {
        input.addEventListener('input', renderReprovasPage);
    });

    // Export Insumos
    document.getElementById('btn-export-insumos').addEventListener('click', exportInsumosCSV);

    // Add User Trigger
    document.getElementById('btn-add-user').addEventListener('click', () => {
        document.getElementById('modal-user-title-action').textContent = "Novo Usuário";
        document.getElementById('user-edit-mode').value = "false";
        document.getElementById('user-username').disabled = false;
        document.getElementById('form-add-user').reset();
        
        // Reset modal eye icon to normal password mode
        document.getElementById('user-password').type = 'password';
        const toggleBtn = document.getElementById('toggle-user-password');
        if (toggleBtn) toggleBtn.querySelector('i').className = 'fa fa-eye';

        populateUserModalRoles();
        modalAddUser.classList.remove('hidden');
    });

    function populateUserModalRoles() {
        const select = document.getElementById('user-role');
        if (!select) return;
        select.innerHTML = '';
        
        const editableRoles = getEditableRoles(currentUser ? currentUser.role : '');
        const rolesMap = {
            'fiscal': 'Auxiliar de Engenharia',
            'analista': 'Analista de Engenharia',
            'controle': 'Controle de Obra',
            'gestor': 'Gestor (a)',
            'diretor': 'Diretor (Visualização)',
            'engenheiro': 'Engenheiro',
            'admin': 'Administrador'
        };
        
        editableRoles.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r;
            opt.textContent = rolesMap[r] || r;
            select.appendChild(opt);
        });
    }

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
function getRoleLabel(role) {
    const labels = {
        'admin': 'Administrador',
        'engenheiro': 'Engenheiro',
        'gestor': 'Gestor (a)',
        'controle': 'Controle de Obra',
        'diretor': 'Diretor',
        'analista': 'Analista de Engenharia',
        'fiscal': 'Auxiliar de Engenharia'
    };
    return labels[role] || role;
}

function getEditableRoles(currentUserRole) {
    if (currentUserRole === 'admin') {
        return ['diretor', 'gestor', 'engenheiro', 'analista', 'fiscal', 'controle'];
    }
    if (currentUserRole === 'diretor') {
        return ['gestor', 'engenheiro', 'analista', 'fiscal', 'controle'];
    }
    if (currentUserRole === 'gestor') {
        return ['engenheiro', 'analista', 'fiscal', 'controle'];
    }
    if (currentUserRole === 'engenheiro') {
        return ['analista', 'fiscal', 'controle'];
    }
    return [];
}

function applyRoleTheme(role) {
    document.body.classList.remove('theme-green-light', 'theme-black-elegant', 'theme-gold-premium');
    const icon = themeToggleBtn.querySelector('i');
    
    if (role === 'fiscal' || role === 'analista') {
        document.body.classList.add('theme-green-light');
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
        if (icon) icon.className = 'fa fa-moon';
    } else if (role === 'engenheiro' || role === 'gestor') {
        document.body.classList.add('theme-black-elegant');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (icon) icon.className = 'fa fa-sun';
    } else if (role === 'admin' || role === 'diretor') {
        document.body.classList.add('theme-gold-premium');
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
        if (icon) icon.className = 'fa fa-sun';
    }
}

function loginSuccess(user) {
    currentUser = user;
    sessionStorage.setItem('mrv_current_user', JSON.stringify(currentUser));
    
    applyRoleTheme(user.role);
    
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    userDisplayName.textContent = user.name;
    userDisplayRole.textContent = getRoleLabel(user.role);

    // Update sidebar logo with the active project name next to logo
    const logoTitle = document.querySelector('.logo-title-green');
    if (logoTitle && projectState) {
        let displayProjectName = projectState.name || 'MRV Organizer';
        displayProjectName = displayProjectName.replace('MRV - ', '');
        logoTitle.innerHTML = `<span style="text-transform: uppercase; font-weight: 700;">MRV</span><span style="color: #f58521; font-weight: 700; text-transform: capitalize;"> - ${displayProjectName}</span>`;
    }
    
    if (user.role === 'admin' || user.role === 'engenheiro') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
        userRoleIcon.className = 'fa fa-user-shield';
    } else {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
        userRoleIcon.className = 'fa fa-user';
    }

    const canConfig = user.role === 'admin' || user.role === 'engenheiro' || user.role === 'gestor';
    if (canConfig) {
        document.querySelectorAll('.config-allowed').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.config-allowed').forEach(el => el.classList.add('hidden'));
    }

    const canManagePermissions = user.role === 'admin' || user.role === 'engenheiro' || user.role === 'gestor' || user.role === 'diretor';
    if (canManagePermissions) {
        document.querySelectorAll('.permissions-allowed').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.permissions-allowed').forEach(el => el.classList.add('hidden'));
    }

    // Default to first page
    navLinks.forEach(l => l.classList.remove('active'));
    document.querySelector('[data-target="page-mapa"]').classList.add('active');
    navigateToPage('page-mapa');
}

// Page Router
function navigateToPage(pageId) {
    const isPowerUser = currentUser && (currentUser.role === 'admin' || currentUser.role === 'engenheiro');
    const canConfig = currentUser && (currentUser.role === 'admin' || currentUser.role === 'engenheiro' || currentUser.role === 'gestor');
    const canManagePermissions = currentUser && (currentUser.role === 'admin' || currentUser.role === 'engenheiro' || currentUser.role === 'gestor' || currentUser.role === 'diretor');

    if (pageId === 'page-usuarios' && !isPowerUser) {
        pageId = 'page-mapa';
    }
    if (pageId === 'page-config' && !canConfig) {
        pageId = 'page-mapa';
    }
    if (pageId === 'page-permissoes' && !canManagePermissions) {
        pageId = 'page-mapa';
    }

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
    } else if (pageId === 'page-permissoes') {
        pageTitle.textContent = "Permissões de Acesso";
        initPermissoesPage();
    }
}

// -------------------------------------------------------------
// PAGE 1: MAPA GERAL METHODS
// -------------------------------------------------------------

function renderSummaryStats() {
    const totalUnits = projectState.units.length;
    let vqAprovados = 0;
    let vqReprovados = 0;
    let vaAprovados = 0;
    let vaReprovados = 0;
    let ativas = 0;
    let totalProgressSum = 0;

    projectState.units.forEach(u => {
        totalProgressSum += u.activeFrontIndex;
        
        if (u.activeFrontIndex > 0 && u.activeFrontIndex < FRENTES_SEQUENCIA.length) {
            ativas++;
        }
        
        // VQ Checks: Reproved if there is any pending VQ reprova; Approved if VQ is completed and no pending VQ reprova
        const hasVqPending = u.reprovas && u.reprovas.some(r => r.servico === 'VQ' && r.status === 'Pendente');
        const isVqDone = u.frontsData && u.frontsData['VQ'] && u.frontsData['VQ'].concluido;
        if (hasVqPending) {
            vqReprovados++;
        } else if (isVqDone) {
            vqAprovados++;
        }

        // VA Checks: Reproved if there is any pending VA reprova; Approved if VA is completed and no pending VA reprova
        const hasVaPending = u.reprovas && u.reprovas.some(r => r.servico === 'VA' && r.status === 'Pendente');
        const isVaDone = u.frontsData && u.frontsData['VA'] && u.frontsData['VA'].concluido;
        if (hasVaPending) {
            vaReprovados++;
        } else if (isVaDone) {
            vaAprovados++;
        }
    });

    const percentGeral = totalUnits > 0 ? Math.round((totalProgressSum / (totalUnits * FRENTES_SEQUENCIA.length)) * 100) : 0;
    const pctVqA = totalUnits > 0 ? (vqAprovados / totalUnits * 100).toFixed(1) : "0.0";
    const pctVqR = totalUnits > 0 ? (vqReprovados / totalUnits * 100).toFixed(1) : "0.0";
    const pctVaA = totalUnits > 0 ? (vaAprovados / totalUnits * 100).toFixed(1) : "0.0";
    const pctVaR = totalUnits > 0 ? (vaReprovados / totalUnits * 100).toFixed(1) : "0.0";
    const pctA = totalUnits > 0 ? (ativas / totalUnits * 100).toFixed(1) : "0.0";

    statVqAprovados.textContent = `${vqAprovados} (${pctVqA}%)`;
    statVqReprovados.textContent = `${vqReprovados} (${pctVqR}%)`;
    statVaAprovados.textContent = `${vaAprovados} (${pctVaA}%)`;
    statVaReprovados.textContent = `${vaReprovados} (${pctVaR}%)`;
    statAtivos.textContent = `${ativas} (${pctA}%)`;
    statProgresso.textContent = `${percentGeral}%`;
}

function renderLegendFilters() {
    const container = document.getElementById('map-frentes-legend');
    container.innerHTML = '';

    // Standard legends for all frentes
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
    const doneUnits = projectState.units.filter(u => u.activeFrontIndex === FRENTES_SEQUENCIA.length).length;
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
        
        let completionText = "";
        if (activeFilterFront) {
            if (activeFilterFront === 'Concluido') {
                const dateStr = getTowerOverallCompletionDate(tConfig.name);
                completionText = `Conclusão Geral: ${dateStr}`;
            } else {
                const proj = getProjectionsForService(activeFilterFront);
                const dateStr = proj.towerProjections[tConfig.name] || "-";
                completionText = `Conclusão ${activeFilterFront}: ${dateStr}`;
            }
        } else {
            const dateStr = getTowerOverallCompletionDate(tConfig.name);
            completionText = `Conclusão final da torre: ${dateStr}`;
        }
        
        block.innerHTML = `
            <div class="tower-title-bar" style="display: flex; justify-content: space-between; align-items: center; width: 100%; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <h2 style="margin: 0;">${tConfig.name}</h2>
                    <span class="badge" style="font-size: 0.75rem;">${tConfig.floors} Pav. / ${tConfig.unitsPerFloor} Aptos</span>
                </div>
                <div class="tower-completion-badge" style="font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); background: rgba(0,0,0,0.2); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--border-color);">
                    ${completionText}
                </div>
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
                    
                    if (frontIndex === FRENTES_SEQUENCIA.length) {
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
                    const delayed = frontIndex < FRENTES_SEQUENCIA.length ? isUnitDelayed(matchedUnit, frontName) : false;
                    
                    if (outOfOrder && delayed) {
                        cell.classList.add('pulsing-both');
                    } else if (delayed) {
                        cell.classList.add('pulsing-red');
                    } else if (outOfOrder) {
                        cell.classList.add('pulsing-purple');
                    }
                    
                    cell.title = `${matchedUnit.tower} - Apto ${unitNum}\nFrente: ${frontIndex === FRENTES_SEQUENCIA.length ? 'Concluído (VA)' : frontName}\nStatus: ${matchedUnit.status_geral}`;
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
            return activeName === f && u.activeFrontIndex < FRENTES_SEQUENCIA.length;
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
        const mats = getMaterialsList(fData);
        if (mats.length > 0) {
            materialsText = mats.map(m => `
                <div style="margin-bottom: 4px;">
                    <strong>${m.material}</strong> (${m.quantidade})
                    ${(m.tipo || m.subtipo) ? `<span class="text-muted" style="font-size: 0.75rem; margin-left: 4px;">(${m.tipo || ''}${m.tipo && m.subtipo ? '/' : ''}${m.subtipo || ''})</span>` : ''}
                </div>
            `).join('');
        }

        // Ações condicionais
        let actionBtn = "";
        const userRole = currentUser ? currentUser.role : 'fiscal';
        const isReadOnly = userRole === 'diretor';
        const allowed = currentUser ? currentUser.allowedFronts : null;
        const isFrontAllowed = !allowed || allowed.length === 0 || allowed.includes(activeFrente);
        const canReopen = (userRole === 'admin' || userRole === 'engenheiro' || userRole === 'gestor' || userRole === 'controle') && isFrontAllowed;

        if (isDone) {
            if (canReopen) {
                actionBtn = `<button class="btn btn-xs btn-outline btn-unit-reopen" data-id="${u.id}" style="color: var(--status-reprovado); border-color: var(--status-reprovado);"><i class="fa fa-arrow-rotate-left"></i> Desfazer</button>`;
            } else {
                actionBtn = `<button class="btn btn-xs btn-outline btn-unit-reopen" data-id="${u.id}" disabled style="opacity: 0.4; cursor: not-allowed; color: var(--text-secondary); border-color: var(--border-color);" title="Sem permissão para esta frente de serviço"><i class="fa fa-arrow-rotate-left"></i> Desfazer</button>`;
            }
        } else if (isActive) {
            if (!isReadOnly && isFrontAllowed) {
                actionBtn = `<button class="btn btn-xs btn-primary btn-unit-update" data-id="${u.id}"><i class="fa fa-pen"></i> Alimentar</button>`;
            } else if (isReadOnly) {
                actionBtn = `<button class="btn btn-xs btn-outline btn-unit-update" data-id="${u.id}" disabled style="opacity: 0.4; cursor: not-allowed;" title="Visualizar apenas (Diretor)"><i class="fa fa-eye"></i> Visualizar</button>`;
            } else {
                actionBtn = `<button class="btn btn-xs btn-outline btn-unit-update" data-id="${u.id}" disabled style="opacity: 0.4; cursor: not-allowed;" title="Sem permissão para esta frente de serviço"><i class="fa fa-ban"></i> Bloqueado</button>`;
            }
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
        if (isDone && canReopen) {
            tr.querySelector('.btn-unit-reopen').addEventListener('click', () => handleReopenFront(u.id, activeFrente));
        } else if (isActive && !isReadOnly && isFrontAllowed) {
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

    // Apply column-level filters
    const colFilters = {
        tower: (document.getElementById('rep-col-filter-tower')?.value || '').toLowerCase().trim(),
        unit: (document.getElementById('rep-col-filter-unit')?.value || '').toLowerCase().trim(),
        servico: (document.getElementById('rep-col-filter-servico')?.value || '').toLowerCase().trim(),
        local: (document.getElementById('rep-col-filter-local')?.value || '').toLowerCase().trim(),
        desc: (document.getElementById('rep-col-filter-desc')?.value || '').toLowerCase().trim(),
        material: (document.getElementById('rep-col-filter-material')?.value || '').toLowerCase().trim(),
        qtd: (document.getElementById('rep-col-filter-qtd')?.value || '').toLowerCase().trim(),
        resp: (document.getElementById('rep-col-filter-resp')?.value || '').toLowerCase().trim(),
        status: (document.getElementById('rep-col-filter-status')?.value || '').toLowerCase().trim()
    };

    if (colFilters.tower) {
        matchedReprovas = matchedReprovas.filter(m => m.tower.toLowerCase().includes(colFilters.tower));
    }
    if (colFilters.unit) {
        matchedReprovas = matchedReprovas.filter(m => m.unit.toLowerCase().includes(colFilters.unit));
    }
    if (colFilters.servico) {
        matchedReprovas = matchedReprovas.filter(m => m.reprova.servico.toLowerCase().includes(colFilters.servico));
    }
    if (colFilters.local) {
        matchedReprovas = matchedReprovas.filter(m => m.reprova.local.toLowerCase().includes(colFilters.local));
    }
    if (colFilters.desc) {
        matchedReprovas = matchedReprovas.filter(m => m.reprova.descricao.toLowerCase().includes(colFilters.desc));
    }
    if (colFilters.material) {
        matchedReprovas = matchedReprovas.filter(m => (m.reprova.material || '').toLowerCase().includes(colFilters.material));
    }
    if (colFilters.qtd) {
        matchedReprovas = matchedReprovas.filter(m => (m.reprova.quantidade_material || '').toLowerCase().includes(colFilters.qtd));
    }
    if (colFilters.resp) {
        matchedReprovas = matchedReprovas.filter(m => (m.reprova.responsavel || '').toLowerCase().includes(colFilters.resp));
    }
    if (colFilters.status) {
        matchedReprovas = matchedReprovas.filter(m => m.reprova.status.toLowerCase().includes(colFilters.status));
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
                if (unit.activeFrontIndex === FRENTES_SEQUENCIA.length) {
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
        
        let badgeClass = "bg-blue";
        if (u.role === 'admin' || u.role === 'engenheiro') {
            badgeClass = "bg-green";
        } else if (u.role === 'diretor') {
            badgeClass = "bg-purple";
        } else if (u.role === 'gestor' || u.role === 'controle') {
            badgeClass = "bg-amber";
        }
        
        tr.innerHTML = `
            <td><strong>${u.name}</strong></td>
            <td><code>${u.username}</code></td>
            <td><span class="badge ${badgeClass}">${getRoleLabel(u.role)}</span></td>
            <td>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="user-pwd-text" style="-webkit-text-security: disc;">${u.password}</span>
                    <button class="btn btn-xs btn-outline btn-toggle-show-pwd" style="border: none; padding: 2px 6px; background: none; cursor: pointer;"><i class="fa fa-eye"></i></button>
                </div>
            </td>
            <td>
                ${u.username === 'rafael.samorim' ? '<span class="text-muted">Sistema</span>' : 
                  (currentUser && getEditableRoles(currentUser.role).includes(u.role)) ? `
                    <div style="display: flex; gap: 8px;">
                        <button class="btn btn-xs btn-outline btn-edit-user" data-username="${u.username}"><i class="fa fa-pen"></i></button>
                        <button class="btn btn-xs btn-danger btn-delete-user" data-username="${u.username}"><i class="fa fa-trash"></i></button>
                    </div>
                  ` : '<span class="text-muted">-</span>'
                }
            </td>
        `;

        const btnToggleShowPwd = tr.querySelector('.btn-toggle-show-pwd');
        if (btnToggleShowPwd) {
            btnToggleShowPwd.addEventListener('click', () => {
                const pwdSpan = tr.querySelector('.user-pwd-text');
                const icon = btnToggleShowPwd.querySelector('i');
                if (pwdSpan.style.webkitTextSecurity === 'none') {
                    pwdSpan.style.webkitTextSecurity = 'disc';
                    icon.className = 'fa fa-eye';
                } else {
                    pwdSpan.style.webkitTextSecurity = 'none';
                    icon.className = 'fa fa-eye-slash';
                }
            });
        }

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
                    
                    populateUserModalRoles();

                    document.getElementById('user-role').value = targetUser.role;
                    // Reset modal eye icon to normal password mode
                    document.getElementById('user-password').type = 'password';
                    const toggleBtn = document.getElementById('toggle-user-password');
                    if (toggleBtn) toggleBtn.querySelector('i').className = 'fa fa-eye';
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

    // Safety check: verify if currentUser is allowed to assign this role
    const editableRoles = getEditableRoles(currentUser ? currentUser.role : '');
    if (!editableRoles.includes(role)) {
        alert("Você não tem permissão para assinalar este nível de acesso.");
        return;
    }

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
    const canConfig = currentUser && (currentUser.role === 'admin' || currentUser.role === 'engenheiro' || currentUser.role === 'gestor');
    if (!canConfig) {
        alert("Apenas o Engenheiro e o Gestor podem alterar a estrutura da obra.");
        return;
    }
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
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Apenas o Administrador pode reiniciar a obra.");
        return;
    }
    const senhaDigitada = prompt("ATENÇÃO: Esta ação é irreversível e apagará TODOS os avanços, materiais e reprovas. Para confirmar, digite sua senha de administrador:");
    if (senhaDigitada === null) return;
    if (senhaDigitada !== currentUser.password) {
        alert("Senha incorreta. Operação cancelada.");
        return;
    }

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

async function restoreSplendoreSeed() {
    if (!currentUser || currentUser.role !== 'admin') {
        alert("Apenas o Administrador pode restaurar os dados semente.");
        return;
    }
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

    if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
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
    const progressPercent = Math.round((u.activeFrontIndex / FRENTES_SEQUENCIA.length) * 100);
    document.getElementById('modal-unit-progress-bar').style.width = `${progressPercent}%`;
    document.getElementById('modal-unit-progress-text').textContent = `${u.activeFrontIndex}/${FRENTES_SEQUENCIA.length} Frentes Concluídas`;

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
        if (fData.concluido) {
            const mats = getMaterialsList(fData);
            if (mats.length > 0) {
                matText = `<div class="timeline-mats" style="margin-top: 8px; border-top: 1px dashed var(--border-color); padding-top: 4px;">`;
                mats.forEach(m => {
                    matText += `
                        <div style="margin-bottom: 4px; font-size: 0.8rem;">
                            <strong>Insumo:</strong> ${m.material} (${m.quantidade})${m.tipo ? ` - ${m.tipo}` : ''} ${m.subtipo ? ` (${m.subtipo})` : ''}
                            ${m.observacao ? `<div style="font-style: italic; font-size: 0.72rem; color: var(--text-secondary); margin-top: 1px;">Obs: ${m.observacao}</div>` : ''}
                        </div>
                    `;
                });
                matText += `</div>`;
            }
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

    // Initialize VQ/VA batch reprova excel spreadsheet
    const excelBody = document.getElementById('modal-rep-excel-body');
    if (excelBody) {
        excelBody.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            addExcelReprovaRow();
        }
    }

    // Show Add Reprova button if unit is in VQ or VA step
    const btnAddRep = document.getElementById('modal-btn-add-reprova');
    const vqIdx = FRENTES_SEQUENCIA.indexOf("VQ");
    const vaIdx = FRENTES_SEQUENCIA.indexOf("VA");
    if ((u.activeFrontIndex === vqIdx || u.activeFrontIndex === vaIdx) && u.activeFrontIndex < FRENTES_SEQUENCIA.length) {
        btnAddRep.classList.remove('hidden');
    } else {
        btnAddRep.classList.add('hidden');
    }

    // Set active tab to Workflow by default
    modal.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
    modal.querySelector('[data-tab="modal-tab-workflow"]').classList.add('active');
    modal.querySelector('#modal-tab-workflow').classList.add('active');

    // Also reset VQ/VA sub-tabs internally
    const subListBtn = modal.querySelector('#modal-tab-reprovas [data-tab="modal-rep-sub-list"]');
    if (subListBtn) subListBtn.classList.add('active');
    const subListPanel = modal.querySelector('#modal-rep-sub-list');
    if (subListPanel) subListPanel.classList.add('active');

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

function getMaterialsList(fData) {
    if (!fData || !fData.materials) return [];
    if (Array.isArray(fData.materials)) {
        return fData.materials;
    }
    if (fData.materials.material) {
        return [fData.materials];
    }
    return [];
}

function renderActiveModalMaterials() {
    const container = document.getElementById('added-materials-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (activeModalMaterials.length === 0) {
        container.innerHTML = `<span style="font-style: italic; color: var(--text-muted); font-size: 0.8rem;">Nenhum insumo adicionado ainda.</span>`;
        return;
    }
    
    activeModalMaterials.forEach((m, idx) => {
        const tag = document.createElement('div');
        tag.className = 'material-tag';
        tag.style.display = 'flex';
        tag.style.alignItems = 'center';
        tag.style.gap = '6px';
        tag.style.background = 'var(--bg-secondary)';
        tag.style.border = '1px solid var(--border-color)';
        tag.style.borderRadius = '6px';
        tag.style.padding = '4px 8px';
        tag.style.fontSize = '0.8rem';
        
        tag.innerHTML = `
            <span><strong>${m.material}</strong> (${m.quantidade})${m.tipo ? ` - ${m.tipo}` : ''}</span>
            <button type="button" class="btn-remove-mat" style="background: none; border: none; color: var(--status-reprovado); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 2px;"><i class="fa fa-xmark" style="font-size: 0.75rem;"></i></button>
        `;
        
        tag.querySelector('.btn-remove-mat').addEventListener('click', () => {
            activeModalMaterials.splice(idx, 1);
            renderActiveModalMaterials();
        });
        
        container.appendChild(tag);
    });
}

function openUpdateFrontModal(unitId, frenteName) {
    const userRole = currentUser ? currentUser.role : 'fiscal';
    const isReadOnly = userRole === 'diretor';
    const allowed = currentUser ? currentUser.allowedFronts : null;
    const isAllowed = !allowed || allowed.length === 0 || allowed.includes(frenteName);

    if (isReadOnly || !isAllowed) {
        alert("Você não tem permissão para alterar esta frente de serviço.");
        return;
    }

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

    // Load materials into array state and render
    activeModalMaterials = getMaterialsList(fData);
    renderActiveModalMaterials();

    // Clear add material input fields
    document.getElementById('add-mat-nome').value = "";
    document.getElementById('add-mat-qtd').value = "";
    document.getElementById('add-mat-tipo').value = "";
    document.getElementById('add-mat-subtipo').value = "";
    document.getElementById('add-mat-obs').value = "";

    modalUpdateFront.classList.remove('hidden');
}

function saveUpdateFrontFields(unitId, frenteName, isConcluido) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    const fData = u.frontsData[frenteName];
    fData.responsavel = document.getElementById('update-resp').value.trim();
    fData.duracaoProj = parseFloat(document.getElementById('update-dur-proj').value) || 1;
    fData.duracaoReal = parseFloat(document.getElementById('update-dur-real').value) || 1;

    // Save activeModalMaterials to the frontsData
    fData.materials = activeModalMaterials;

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
        if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
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
    const userRole = currentUser ? currentUser.role : 'fiscal';
    const canReopen = userRole === 'admin' || userRole === 'engenheiro' || userRole === 'gestor' || userRole === 'controle';
    const allowed = currentUser ? currentUser.allowedFronts : null;
    const isAllowed = !allowed || allowed.length === 0 || allowed.includes(frenteName);

    if (!canReopen || !isAllowed) {
        alert("Você não tem permissão para desfazer a conclusão desta frente de serviço.");
        return;
    }

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

function addExcelReprovaRow() {
    const tbody = document.getElementById('modal-rep-excel-body');
    if (!tbody) return;
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td>
            <select class="excel-rep-local" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;">
                <option value="">Selecione...</option>
                <option value="Cozinha">Cozinha</option>
                <option value="Área de Serviço">Área de Serviço</option>
                <option value="Sala de Estar">Sala de Estar</option>
                <option value="Banheiro 1">Banheiro 1</option>
                <option value="Banheiro 2">Banheiro 2</option>
                <option value="Quarto 1">Quarto 1</option>
                <option value="Quarto 2">Quarto 2</option>
                <option value="Sacada/Varanda">Sacada/Varanda</option>
                <option value="Corredor/Hall">Corredor/Hall</option>
            </select>
        </td>
        <td><input type="text" class="excel-rep-desc" placeholder="Ex: Piso oco" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td><input type="text" class="excel-rep-mat" placeholder="Ex: Piso" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td><input type="text" class="excel-rep-tipo" placeholder="Ex: AC3" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td><input type="text" class="excel-rep-sub" placeholder="Ex: Cinza" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td><input type="text" class="excel-rep-qtd" placeholder="Ex: 2 sacos" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td><input type="text" class="excel-rep-resp" placeholder="Ex: Ivan" style="width: 100%; padding: 4px; font-size: 0.8rem; background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-primary); border-radius: 4px;"></td>
        <td style="text-align: center; vertical-align: middle;">
            <button type="button" class="btn-remove-excel-row" style="background: none; border: none; color: var(--status-reprovado); cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 4px;"><i class="fa fa-trash"></i></button>
        </td>
    `;
    
    tr.querySelector('.btn-remove-excel-row').addEventListener('click', () => {
        tr.remove();
    });
    
    tbody.appendChild(tr);
}

function saveExcelReprovas() {
    const modalUnitTitleEl = document.getElementById('modal-unit-title');
    const unitId = modalUnitTitleEl.dataset.unitId;
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;
    
    const tbody = document.getElementById('modal-rep-excel-body');
    const rows = tbody.querySelectorAll('tr');
    
    let addedCount = 0;
    const errors = [];
    const newReprovas = [];
    
    rows.forEach((row, idx) => {
        const local = row.querySelector('.excel-rep-local').value;
        const desc = row.querySelector('.excel-rep-desc').value.trim();
        const mat = row.querySelector('.excel-rep-mat').value.trim();
        const tipo = row.querySelector('.excel-rep-tipo').value.trim();
        const subtipo = row.querySelector('.excel-rep-sub').value.trim();
        const qtd = row.querySelector('.excel-rep-qtd').value.trim();
        const resp = row.querySelector('.excel-rep-resp').value.trim();
        
        // Skip completely empty rows
        if (!local && !desc && !mat && !tipo && !subtipo && !qtd && !resp) {
            return;
        }
        
        // Validation
        if (!local) {
            errors.push(`Linha ${idx + 1}: Selecione o Local.`);
            return;
        }
        if (!desc) {
            errors.push(`Linha ${idx + 1}: Preencha a descrição da falha.`);
            return;
        }
        if (!resp) {
            errors.push(`Linha ${idx + 1}: Preencha o responsável pela correção.`);
            return;
        }
        
        const repItem = {
            id: uuidv4(),
            descricao: desc,
            responsavel: resp,
            data_inicio: new Date().toLocaleDateString('pt-BR'),
            data_fim: "",
            servico: FRENTES_SEQUENCIA[u.activeFrontIndex] || "VQ",
            local: local,
            status: "Pendente",
            material: mat,
            tipo_material: mat ? tipo : "",
            subtipo_material: mat ? subtipo : "",
            quantidade_material: mat ? qtd : ""
        };
        newReprovas.push(repItem);
    });
    
    if (errors.length > 0) {
        alert("Erros encontrados:\n" + errors.join("\n"));
        return;
    }
    
    if (newReprovas.length === 0) {
        alert("Nenhum item válido para salvar. Preencha pelo menos uma linha.");
        return;
    }
    
    newReprovas.forEach(rep => {
        u.reprovas.push(rep);
    });
    u.status_geral = "Reprovado";
    
    saveState();
    alert(`${newReprovas.length} reprova(s) cadastrada(s) com sucesso!`);
    
    // Refresh modal
    openUnitDetailsModal(u.id);
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

// Helper to parse quantity strings (e.g. "12 caixas" -> { val: 12, unit: "caixas" })
function parseQtd(qtdStr) {
    if (qtdStr === null || qtdStr === undefined) return { val: 0, unit: "" };
    const str = String(qtdStr).trim();
    if (!str) return { val: 0, unit: "" };
    const match = str.match(/^([\d.,]+)\s*(.*)$/);
    if (match) {
        const val = parseFloat(match[1].replace(',', '.')) || 0;
        const unit = match[2].trim();
        return { val, unit };
    }
    return { val: 0, unit: "" };
}

// Helper to format quantity values with unit (e.g. 12, "caixas" -> "12 caixas")
function formatQtd(val, unit) {
    if (val === 0) return "-";
    const rounded = Math.round(val * 100) / 100;
    return unit ? `${rounded} ${unit}` : `${rounded}`;
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
    
    // 1. Standard fronts
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            const materials = getMaterialsList(fData);
            materials.forEach(m => {
                if (m.material) {
                    matchedInsumos.push({
                        tower: u.tower,
                        unit: u.unit,
                        frente: frente,
                        data: m.data_lancamento || fData.dataFinal || "",
                        responsavel: fData.responsavel || "",
                        material: m.material,
                        tipo: m.tipo || "",
                        subtipo: m.subtipo || "",
                        quantidade: m.quantidade || "",
                        observacao: m.observacao || "",
                        isRework: false,
                        status: fData.concluido ? "Concluído" : "Ativo"
                    });
                }
            });
        });
    });

    // 2. Reprovas (Rework insumos)
    projectState.units.forEach(u => {
        u.reprovas.forEach(r => {
            if (r.material) {
                matchedInsumos.push({
                    tower: u.tower,
                    unit: u.unit,
                    frente: r.servico,
                    data: r.data_fim || r.data_inicio || "",
                    responsavel: r.responsavel || "",
                    material: r.material,
                    tipo: r.tipo_material || "",
                    subtipo: r.subtipo_material || "",
                    quantidade: r.quantidade_material || "",
                    observacao: r.descricao || "",
                    isRework: true,
                    status: r.status // "Pendente" or "Resolvido"
                });
            }
        });
    });
    
    // Apply global filters
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
            m.unit.toLowerCase().includes(searchQuery)
        );
    }

    // Apply column-level filters (Tab 1)
    const colFilters = {
        tower: (document.getElementById('col-filter-tower')?.value || '').toLowerCase().trim(),
        unit: (document.getElementById('col-filter-unit')?.value || '').toLowerCase().trim(),
        frente: (document.getElementById('col-filter-frente')?.value || '').toLowerCase().trim(),
        data: (document.getElementById('col-filter-data')?.value || '').toLowerCase().trim(),
        resp: (document.getElementById('col-filter-resp')?.value || '').toLowerCase().trim(),
        material: (document.getElementById('col-filter-material')?.value || '').toLowerCase().trim(),
        tipo: (document.getElementById('col-filter-tipo')?.value || '').toLowerCase().trim(),
        subtipo: (document.getElementById('col-filter-subtipo')?.value || '').toLowerCase().trim(),
        qtd: (document.getElementById('col-filter-qtd')?.value || '').toLowerCase().trim(),
        obs: (document.getElementById('col-filter-obs')?.value || '').toLowerCase().trim()
    };

    if (colFilters.tower) {
        matchedInsumos = matchedInsumos.filter(m => m.tower.toLowerCase().includes(colFilters.tower));
    }
    if (colFilters.unit) {
        matchedInsumos = matchedInsumos.filter(m => m.unit.toLowerCase().includes(colFilters.unit));
    }
    if (colFilters.frente) {
        matchedInsumos = matchedInsumos.filter(m => m.frente.toLowerCase().includes(colFilters.frente));
    }
    if (colFilters.data) {
        matchedInsumos = matchedInsumos.filter(m => m.data.toLowerCase().includes(colFilters.data));
    }
    if (colFilters.resp) {
        matchedInsumos = matchedInsumos.filter(m => m.responsavel.toLowerCase().includes(colFilters.resp));
    }
    if (colFilters.material) {
        matchedInsumos = matchedInsumos.filter(m => m.material.toLowerCase().includes(colFilters.material));
    }
    if (colFilters.tipo) {
        matchedInsumos = matchedInsumos.filter(m => m.tipo.toLowerCase().includes(colFilters.tipo));
    }
    if (colFilters.subtipo) {
        matchedInsumos = matchedInsumos.filter(m => m.subtipo.toLowerCase().includes(colFilters.subtipo));
    }
    if (colFilters.qtd) {
        matchedInsumos = matchedInsumos.filter(m => m.quantidade.toLowerCase().includes(colFilters.qtd));
    }
    if (colFilters.obs) {
        matchedInsumos = matchedInsumos.filter(m => m.observacao.toLowerCase().includes(colFilters.obs));
    }
    
    if (matchedInsumos.length === 0) {
        emptyMsg.classList.remove('hidden');
    } else {
        emptyMsg.classList.add('hidden');
    }
    
    // Render Tab 1 (Lançamento Individual)
    matchedInsumos.forEach(m => {
        const tr = document.createElement('tr');
        let reworkBadge = '';
        if (m.isRework) {
            const badgeBg = m.status === 'Pendente' ? 'var(--status-reprovado)' : 'var(--status-aprovado)';
            reworkBadge = `<span class="badge" style="background-color: ${badgeBg}; color: #fff; margin-left: 6px; font-size: 0.72rem; padding: 2px 4px; border-radius: 4px;">Retrabalho (${m.status})</span>`;
        }
        tr.innerHTML = `
            <td>${m.tower}</td>
            <td><strong>${m.unit}</strong></td>
            <td><span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-primary)">${m.frente}</span></td>
            <td>${m.data}</td>
            <td>${m.responsavel}</td>
            <td><strong>${m.material}</strong>${reworkBadge}</td>
            <td>${m.tipo}</td>
            <td>${m.subtipo}</td>
            <td>${m.quantidade}</td>
            <td style="max-width: 250px; font-size: 0.8rem; white-space: normal; word-break: break-word;" title="${m.observacao}">${m.observacao || '-'}</td>
        `;
        tbody.appendChild(tr);
    });

    // --- TAB 2: RELATÓRIO DE COMPRAS & PROJEÇÃO ---
    const frontConcludedCounts = {};
    const frontTotalCounts = {};
    
    FRENTES_SEQUENCIA.forEach(f => {
        frontConcludedCounts[f] = 0;
        frontTotalCounts[f] = 0;
    });
    
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(f => {
            frontTotalCounts[f]++;
            if (u.frontsData[f] && u.frontsData[f].concluido) {
                frontConcludedCounts[f]++;
            }
        });
    });
    
    const firstRunConsumption = {}; // frente -> key -> { sum, unit }
    
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(f => {
            const fData = u.frontsData[f] || {};
            if (fData.concluido) {
                const materials = getMaterialsList(fData);
                materials.forEach(m => {
                    if (m.material) {
                        const key = `${m.material.trim()}|${(m.tipo || '').trim()}|${(m.subtipo || '').trim()}`;
                        if (!firstRunConsumption[f]) firstRunConsumption[f] = {};
                        if (!firstRunConsumption[f][key]) firstRunConsumption[f][key] = { sum: 0, unit: "" };
                        
                        const parsed = parseQtd(m.quantidade);
                        firstRunConsumption[f][key].sum += parsed.val;
                        if (parsed.unit) {
                            firstRunConsumption[f][key].unit = parsed.unit;
                        }
                    }
                });
            }
        });
    });
    
    const matKeys = new Set();
    const keyUnits = {};
    const usedSum = {};
    const reworkPendenteSum = {};
    
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(f => {
            const fData = u.frontsData[f] || {};
            if (fData.concluido) {
                const materials = getMaterialsList(fData);
                materials.forEach(m => {
                    if (m.material) {
                        const key = `${m.material.trim()}|${(m.tipo || '').trim()}|${(m.subtipo || '').trim()}`;
                        matKeys.add(key);
                        const parsed = parseQtd(m.quantidade);
                        usedSum[key] = (usedSum[key] || 0) + parsed.val;
                        if (parsed.unit) keyUnits[key] = parsed.unit;
                    }
                });
            }
        });
        
        u.reprovas.forEach(r => {
            if (r.material) {
                const key = `${r.material.trim()}|${(r.tipo_material || '').trim()}|${(r.subtipo_material || '').trim()}`;
                matKeys.add(key);
                const parsed = parseQtd(r.quantidade_material);
                if (parsed.unit) keyUnits[key] = parsed.unit;
                
                if (r.status === 'Resolvido') {
                    usedSum[key] = (usedSum[key] || 0) + parsed.val;
                } else if (r.status === 'Pendente') {
                    reworkPendenteSum[key] = (reworkPendenteSum[key] || 0) + parsed.val;
                }
            }
        });
    });
    
    const projectedFaltaSum = {};
    
    matKeys.forEach(key => {
        projectedFaltaSum[key] = 0;
        FRENTES_SEQUENCIA.forEach(f => {
            const totalUnits = frontTotalCounts[f] || 0;
            const concludedUnits = frontConcludedCounts[f] || 0;
            const remainingUnits = totalUnits - concludedUnits;
            
            if (remainingUnits > 0) {
                const consumption = firstRunConsumption[f] && firstRunConsumption[f][key];
                if (consumption && concludedUnits > 0) {
                    const avg = consumption.sum / concludedUnits;
                    const projected = remainingUnits * avg;
                    projectedFaltaSum[key] += projected;
                }
            }
        });
    });
    
    const projectionTbody = document.getElementById('table-ins-projection-body');
    if (projectionTbody) {
        projectionTbody.innerHTML = '';
        if (matKeys.size === 0) {
            projectionTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Nenhum insumo disponível para projeção.</td></tr>`;
        } else {
            const sortedKeys = Array.from(matKeys).sort();
            sortedKeys.forEach(key => {
                const [material, tipo, subtipo] = key.split('|');
                const unit = keyUnits[key] || '';
                const used = usedSum[key] || 0;
                const falta = projectedFaltaSum[key] || 0;
                const rework = reworkPendenteSum[key] || 0;
                const total = falta + rework;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${material}</strong></td>
                    <td>${tipo || '-'}${subtipo ? ` / ${subtipo}` : ''}</td>
                    <td>${formatQtd(used, unit)}</td>
                    <td>${formatQtd(falta, unit)}</td>
                    <td>${formatQtd(rework, unit)}</td>
                    <td style="font-weight: bold; color: var(--status-agendado)">${formatQtd(total, unit)}</td>
                `;
                projectionTbody.appendChild(tr);
            });
        }
    }

    // --- TAB 3: ESTIMATIVA DE RETRABALHO (MÉDIAS) ---
    const reworkGroup = {};
    projectState.units.forEach(u => {
        u.reprovas.forEach(r => {
            if (r.material) {
                const mKey = `${r.material.trim()}|${(r.tipo_material || '').trim()}|${(r.subtipo_material || '').trim()}`;
                const groupKey = `${r.servico}|${mKey}`;
                
                if (!reworkGroup[groupKey]) {
                    reworkGroup[groupKey] = {
                        frente: r.servico,
                        material: r.material,
                        tipo: r.tipo_material || "",
                        subtipo: r.subtipo_material || "",
                        unit: "",
                        reprovedUnitsSet: new Set(),
                        totalReprovaVal: 0
                    };
                }
                
                const parsed = parseQtd(r.quantidade_material);
                reworkGroup[groupKey].totalReprovaVal += parsed.val;
                if (parsed.unit) {
                    reworkGroup[groupKey].unit = parsed.unit;
                }
                reworkGroup[groupKey].reprovedUnitsSet.add(u.id);
            }
        });
    });
    
    const reworkTbody = document.getElementById('table-ins-rework-avg-body');
    if (reworkTbody) {
        reworkTbody.innerHTML = '';
        const groupKeys = Object.keys(reworkGroup).sort();
        if (groupKeys.length === 0) {
            reworkTbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted);">Nenhum retrabalho registrado para cálculo de médias.</td></tr>`;
        } else {
            groupKeys.forEach(gKey => {
                const g = reworkGroup[gKey];
                const totalUnits = frontTotalCounts[g.frente] || 0;
                const concludedUnits = frontConcludedCounts[g.frente] || 0;
                const remainingUnits = totalUnits - concludedUnits;
                const aptosReprovados = g.reprovedUnitsSet.size;
                
                const taxaReprova = concludedUnits > 0 ? (aptosReprovados / concludedUnits) * 100 : 0;
                const avgExtra = aptosReprovados > 0 ? g.totalReprovaVal / aptosReprovados : 0;
                const projAptosReprovar = remainingUnits * (taxaReprova / 100);
                const projConsumoExtra = projAptosReprovar * avgExtra;
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><span class="badge" style="background: rgba(255,255,255,0.05); color: var(--text-primary)">${g.frente}</span></td>
                    <td>
                        <strong>${g.material}</strong>
                        ${g.tipo ? `<div class="text-muted" style="font-size: 0.75rem;">${g.tipo}${g.subtipo ? ` / ${g.subtipo}` : ''}</div>` : ''}
                    </td>
                    <td>${concludedUnits}</td>
                    <td>${aptosReprovados}</td>
                    <td>${taxaReprova.toFixed(1)}%</td>
                    <td>${formatQtd(avgExtra, g.unit)}</td>
                    <td>${remainingUnits}</td>
                    <td>${projAptosReprovar.toFixed(1)}</td>
                    <td style="font-weight: bold; color: var(--status-reprovado)">${formatQtd(projConsumoExtra, g.unit)}</td>
                `;
                reworkTbody.appendChild(tr);
            });
        }
    }
}

// Export materials consumption ledger to CSV
function exportInsumosCSV() {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Torre,Unidade,Frente,Data Lancamento,Responsavel,Material,Tipo,Subtipo,Quantidade,Observacao,Tipo de Execucao,Status\n";
    
    let listToExport = [];
    
    // 1. Standard fronts
    projectState.units.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            const materials = getMaterialsList(fData);
            materials.forEach(m => {
                if (m.material) {
                    listToExport.push({
                        tower: u.tower,
                        unit: u.unit,
                        frente: frente,
                        data: m.data_lancamento || fData.dataFinal || "",
                        responsavel: fData.responsavel || "",
                        material: m.material,
                        tipo: m.tipo || "",
                        subtipo: m.subtipo || "",
                        quantidade: m.quantidade || "",
                        observacao: m.observacao || "",
                        tipoExec: "Primeira Execução",
                        status: fData.concluido ? "Concluído" : "Ativo"
                    });
                }
            });
        });
    });

    // 2. Reprovas
    projectState.units.forEach(u => {
        u.reprovas.forEach(r => {
            if (r.material) {
                listToExport.push({
                    tower: u.tower,
                    unit: u.unit,
                    frente: r.servico,
                    data: r.data_fim || r.data_inicio || "",
                    responsavel: r.responsavel || "",
                    material: r.material,
                    tipo: r.tipo_material || "",
                    subtipo: r.subtipo_material || "",
                    quantidade: r.quantidade_material || "",
                    observacao: r.descricao || "",
                    tipoExec: "Retrabalho",
                    status: r.status
                });
            }
        });
    });
    
    listToExport.forEach(m => {
        const row = [
            uClean(m.tower),
            uClean(m.unit),
            uClean(m.frente),
            uClean(m.data),
            uClean(m.responsavel),
            uClean(m.material),
            uClean(m.tipo),
            uClean(m.subtipo),
            uClean(m.quantidade),
            uClean(m.observacao),
            uClean(m.tipoExec),
            uClean(m.status)
        ].join(",");
        csvContent += row + "\n";
    });
    
    function uClean(val) {
        return `"${String(val || '').replace(/"/g, '""')}"`;
    }

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

// Helper to parse DD/MM/YYYY into a Date object
function parseDateBR(dateStr) {
    if (!dateStr || dateStr === "-" || dateStr === "Concluído") return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return null;
}

// Helper to format YYYY-MM-DD into DD/MM/YYYY
function formatDateBR(dateStr) {
    if (!dateStr) return "-";
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Calculates completion dates (real or projected) for a given service across all towers
function getProjectionsForService(serviceName) {
    if (!serviceName) return { towerProjections: {}, overall: "-" };
    
    const fConfig = projectState.frentesConfig[serviceName] || { dataInicio: "2026-06-08", capacidadeDia: 2 };
    const dataInicio = fConfig.dataInicio || "2026-06-08";
    
    // Units pending this service
    const pendingUnits = projectState.units.filter(u => !u.frontsData[serviceName] || !u.frontsData[serviceName].concluido);
    pendingUnits.sort((a, b) => {
        if (a.tower !== b.tower) return a.tower.localeCompare(b.tower);
        if (a.floor !== b.floor) return a.floor - b.floor;
        return a.unit.localeCompare(b.unit);
    });
    
    const cap = parseFloat(fConfig.capacidadeDia) || 1;
    const numWorkers = Math.max(1, Math.floor(cap));
    const workersAvailability = Array(numWorkers).fill(0);
    
    const projectionsMap = {};
    pendingUnits.forEach((u) => {
        let minWorkerIdx = 0;
        let minAvailTime = workersAvailability[0];
        for (let w = 1; w < numWorkers; w++) {
            if (workersAvailability[w] < minAvailTime) {
                minAvailTime = workersAvailability[w];
                minWorkerIdx = w;
            }
        }
        
        const uData = u.frontsData[serviceName] || {};
        let duration = 1 / cap;
        if (uData.duracaoProj && parseFloat(uData.duracaoProj) > 0) {
            duration = parseFloat(uData.duracaoProj);
        }
        
        const startTime = workersAvailability[minWorkerIdx];
        const endTime = startTime + duration;
        workersAvailability[minWorkerIdx] = endTime;
        
        const daysNeeded = Math.floor(endTime);
        projectionsMap[u.id] = addDays(dataInicio, daysNeeded);
    });
    
    const towerProjections = {};
    projectState.towers.forEach(tow => {
        const towPending = pendingUnits.filter(u => u.tower === tow.name);
        if (towPending.length === 0) {
            // Service is completed. Find the max completion date of this service in this tower
            let maxDate = null;
            projectState.units.filter(u => u.tower === tow.name).forEach(u => {
                const fData = u.frontsData[serviceName];
                if (fData && fData.dataFinal) {
                    if (!maxDate || fData.dataFinal > maxDate) {
                        maxDate = fData.dataFinal;
                    }
                }
            });
            towerProjections[tow.name] = maxDate ? formatDateBR(maxDate) : "Concluído";
        } else {
            const lastUnit = towPending[towPending.length - 1];
            towerProjections[tow.name] = projectionsMap[lastUnit.id] || "-";
        }
    });
    
    const overall = pendingUnits.length === 0 ? "Concluído" : (projectionsMap[pendingUnits[pendingUnits.length - 1].id] || "-");
    
    return { towerProjections, overall };
}

// Calculates overall completion date of all services for a tower
function getTowerOverallCompletionDate(towerName) {
    let maxDate = null;
    let maxDateStr = "";
    
    for (const f of FRENTES_SEQUENCIA) {
        const proj = getProjectionsForService(f);
        const dateStr = proj.towerProjections[towerName];
        if (dateStr && dateStr !== "-" && dateStr !== "Concluído") {
            const parsed = parseDateBR(dateStr);
            if (parsed) {
                if (!maxDate || parsed > maxDate) {
                    maxDate = parsed;
                    maxDateStr = dateStr;
                }
            }
        }
    }
    
    if (!maxDateStr) {
        const towerUnits = projectState.units.filter(u => u.tower === towerName);
        const allDone = towerUnits.every(u => u.activeFrontIndex === FRENTES_SEQUENCIA.length);
        if (allDone) {
            let maxFinal = null;
            towerUnits.forEach(u => {
                FRENTES_SEQUENCIA.forEach(f => {
                    const fData = u.frontsData[f];
                    if (fData && fData.dataFinal) {
                        if (!maxFinal || fData.dataFinal > maxFinal) {
                            maxFinal = fData.dataFinal;
                        }
                    }
                });
            });
            if (maxFinal) return formatDateBR(maxFinal);
            return "Concluído";
        }
        return "-";
    }
    
    return maxDateStr;
}

// Helper para detectar se a unidade pulou alguma etapa (Executada fora de ordem)
function isUnitOutOfOrder(unit) {
    const activeIdx = unit.activeFrontIndex;
    // Unidade na frente inicial (Janela = 0) ou concluída não são consideradas fora de ordem
    if (activeIdx === 0 || activeIdx >= FRENTES_SEQUENCIA.length) return false;

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
    let targetIndex = FRENTES_SEQUENCIA.length;
    if (selectedVal !== "Concluido") {
        targetIndex = FRENTES_SEQUENCIA.indexOf(selectedVal);
    }

    if (targetIndex === -1) return;

    unit.activeFrontIndex = targetIndex;

    // Atualizar status geral do apartamento
    if (targetIndex === FRENTES_SEQUENCIA.length) {
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

// Inicializar aba de permissões de acesso por frente de serviço
function initPermissoesPage() {
    const userSelect = document.getElementById('permissions-user-select');
    const gridWrapper = document.getElementById('permissions-grid-wrapper');
    const checkboxesContainer = document.getElementById('permissions-checkboxes-container');
    const btnSave = document.getElementById('btn-save-permissions');

    if (!userSelect || !gridWrapper || !checkboxesContainer || !btnSave) return;

    // Populate user selector (exclude system admin rafael.samorim to prevent self-locking and filter by editable roles)
    userSelect.innerHTML = '<option value="">Escolha um usuário...</option>';
    const editableRoles = getEditableRoles(currentUser ? currentUser.role : '');
    projectState.users.forEach(u => {
        if (u.username !== 'rafael.samorim' && editableRoles.includes(u.role)) {
            const opt = document.createElement('option');
            opt.value = u.username;
            opt.textContent = `${u.name} - ${getRoleLabel(u.role)} (${u.username})`;
            userSelect.appendChild(opt);
        }
    });

    // Reset grid
    gridWrapper.classList.add('hidden');
    checkboxesContainer.innerHTML = '';

    // Handle user change
    userSelect.onchange = () => {
        const username = userSelect.value;
        if (!username) {
            gridWrapper.classList.add('hidden');
            return;
        }

        const targetUser = projectState.users.find(usr => usr.username === username);
        if (!targetUser) return;

        gridWrapper.classList.remove('hidden');
        checkboxesContainer.innerHTML = '';

        const allowed = targetUser.allowedFronts || [];
        const isSystemAdmin = targetUser.username === 'rafael.samorim';

        FRENTES_SEQUENCIA.forEach(f => {
            const isChecked = allowed.includes(f) || isSystemAdmin;
            
            const card = document.createElement('div');
            card.className = "permissions-checkbox-card";
            card.style.cssText = "background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 12px 16px; display: flex; align-items: center; gap: 12px; cursor: pointer; transition: background 0.2s;";
            
            card.innerHTML = `
                <input type="checkbox" id="perm-front-${f}" value="${f}" ${isChecked ? 'checked' : ''} ${isSystemAdmin ? 'disabled' : ''} style="width: 18px; height: 18px; cursor: pointer;">
                <label for="perm-front-${f}" style="margin: 0; cursor: pointer; font-weight: 500; color: var(--text-primary);">${f}</label>
            `;

            checkboxesContainer.appendChild(card);
        });
    };

    // Handle Save
    btnSave.onclick = async () => {
        const username = userSelect.value;
        if (!username) {
            alert("Selecione um usuário para salvar as permissões.");
            return;
        }

        const targetUser = projectState.users.find(usr => usr.username === username);
        if (!targetUser) return;

        if (targetUser.username === 'rafael.samorim') {
            alert("As permissões do desenvolvedor do sistema não podem ser alteradas.");
            return;
        }

        const checkedFrentes = [];
        checkboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.checked) {
                checkedFrentes.push(cb.value);
            }
        });

        // Save to user object
        targetUser.allowedFronts = checkedFrentes;
        await saveState();
        alert(`Permissões salvas com sucesso para o usuário ${targetUser.name}!`);
    };
}
