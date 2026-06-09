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
let currentReprovasPage = 1;
const reprovasPageSize = 50;
let bulkWizardCurrentStep = 1;

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
    "VH",
    "VE",
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
    "VH": "Vistoria Hidráulica. Qualquer item reprovado gera pendência no histórico.",
    "VE": "Vistoria Elétrica. Qualquer item reprovado gera pendência no histórico.",
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
    "VH": "#0284c7",
    "VE": "#8b5cf6",
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
        await renderProjectSelector();
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
        await migrateUnitIndicesV2();

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

async function migrateUnitIndicesV2() {
    if (!projectState || !projectState.units) return;
    if (projectState.frentesMigrationV2Run) return;
    
    console.log("Running quality gates index migration (V2) for VH/VE...");
    
    projectState.units.forEach(u => {
        if (u.activeFrontIndex === 31) {
            u.activeFrontIndex = 33; // VQ
        } else if (u.activeFrontIndex === 32) {
            u.activeFrontIndex = 34; // Passada de Pano
        } else if (u.activeFrontIndex === 33) {
            u.activeFrontIndex = 35; // VA
        } else if (u.activeFrontIndex === 34) {
            u.activeFrontIndex = 36; // Concluido
        }
    });
    
    projectState.frentesMigrationV2Run = true;
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

            if (tabId === 'modal-rep-sub-excel') {
                updateBulkWizardStep(1);
            }
        });
    });

    // Clear Map Filters
    document.getElementById('btn-clear-map-filter').addEventListener('click', () => {
        activeFilterFront = null;
        document.querySelectorAll('.legend-item').forEach(li => li.classList.remove('filtered-active'));
        document.getElementById('btn-clear-map-filter').classList.add('hidden');
        renderTowers();
        renderSummaryStats();
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

    const btnUpdateNa = document.getElementById('btn-update-na');
    if (btnUpdateNa) {
        btnUpdateNa.addEventListener('click', handleUpdateNaClick);
    }

    // Form Add Reprova
    document.getElementById('form-add-reprova').addEventListener('submit', handleAddReprovaSubmit);

    // VQ/VA batch reprova bulk copy-paste listener
    const btnSaveBulkRep = document.getElementById('btn-modal-rep-bulk-save');
    if (btnSaveBulkRep) {
        btnSaveBulkRep.addEventListener('click', handleBulkReprovasSave);
    }

    // Modal add reprova to bulk switch listener
    const btnReprovaGoBulk = document.getElementById('btn-reprova-go-bulk');
    if (btnReprovaGoBulk) {
        btnReprovaGoBulk.addEventListener('click', () => {
            const unitId = document.getElementById('rep-unit-id').value;
            if (unitId) {
                modalAddReprova.classList.add('hidden');
                openUnitDetailsModal(unitId, 'modal-tab-reprovas', 'modal-rep-sub-excel');
            }
        });
    }

    // Wizard navigation listeners
    const btnBulkPrev = document.getElementById('btn-bulk-prev');
    if (btnBulkPrev) {
        btnBulkPrev.addEventListener('click', () => {
            if (bulkWizardCurrentStep > 1) {
                updateBulkWizardStep(bulkWizardCurrentStep - 1);
            }
        });
    }

    const btnBulkNext = document.getElementById('btn-bulk-next');
    if (btnBulkNext) {
        btnBulkNext.addEventListener('click', () => {
            if (bulkWizardCurrentStep < 13) {
                updateBulkWizardStep(bulkWizardCurrentStep + 1);
            }
        });
    }

    // Step indicators clicks
    document.querySelectorAll('#modal-rep-sub-excel .wizard-step-indicator').forEach(indicator => {
        indicator.addEventListener('click', () => {
            const step = parseInt(indicator.dataset.step);
            if (step >= 1 && step <= 13) {
                updateBulkWizardStep(step);
            }
        });
    });

    // Filter Reprovas table changes (Reset to page 1 on filter change)
    document.getElementById('filter-rep-tower').addEventListener('change', () => { currentReprovasPage = 1; renderReprovasPage(); });
    document.getElementById('filter-rep-status').addEventListener('change', () => { currentReprovasPage = 1; renderReprovasPage(); });
    document.getElementById('filter-rep-search').addEventListener('input', () => { currentReprovasPage = 1; renderReprovasPage(); });

    // Pagination Listeners
    const btnRepPagPrev = document.getElementById('btn-rep-pag-prev');
    if (btnRepPagPrev) {
        btnRepPagPrev.addEventListener('click', () => {
            if (currentReprovasPage > 1) {
                currentReprovasPage--;
                renderReprovasPage();
            }
        });
    }
    const btnRepPagNext = document.getElementById('btn-rep-pag-next');
    if (btnRepPagNext) {
        btnRepPagNext.addEventListener('click', () => {
            currentReprovasPage++;
            renderReprovasPage();
        });
    }

    // Form Approval in Batch (Lote)
    const formLoteApproval = document.getElementById('form-lote-approval');
    if (formLoteApproval) {
        formLoteApproval.addEventListener('submit', handleBatchApprovalSubmit);
    }

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
        input.addEventListener('input', () => {
            currentReprovasPage = 1;
            renderReprovasPage();
        });
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

    // Seletor de Status VH
    document.getElementById('modal-unit-vh-status-selector').addEventListener('change', async (e) => {
        const unitId = document.getElementById('modal-unit-title').dataset.unitId;
        const u = projectState.units.find(x => x.id === unitId);
        if (!u) return;
        u.status_vh = e.target.value;
        await saveState();
        openUnitDetailsModal(u.id);
        if (activePage === 'page-mapa') {
            renderSummaryStats();
            renderTowers();
        }
    });

    // Seletor de Status VE
    document.getElementById('modal-unit-ve-status-selector').addEventListener('change', async (e) => {
        const unitId = document.getElementById('modal-unit-title').dataset.unitId;
        const u = projectState.units.find(x => x.id === unitId);
        if (!u) return;
        u.status_ve = e.target.value;
        await saveState();
        openUnitDetailsModal(u.id);
        if (activePage === 'page-mapa') {
            renderSummaryStats();
            renderTowers();
        }
    });

    // Seletor de Status VQ
    document.getElementById('modal-unit-vq-status-selector').addEventListener('change', async (e) => {
        const unitId = document.getElementById('modal-unit-title').dataset.unitId;
        const u = projectState.units.find(x => x.id === unitId);
        if (!u) return;
        u.status_vq = e.target.value;
        await saveState();
        openUnitDetailsModal(u.id);
        if (activePage === 'page-mapa') {
            renderSummaryStats();
            renderTowers();
        }
    });

    // Seletor de Status VA
    document.getElementById('modal-unit-va-status-selector').addEventListener('change', async (e) => {
        const unitId = document.getElementById('modal-unit-title').dataset.unitId;
        const u = projectState.units.find(x => x.id === unitId);
        if (!u) return;
        u.status_va = e.target.value;
        await saveState();
        openUnitDetailsModal(u.id);
        if (activePage === 'page-mapa') {
            renderSummaryStats();
            renderTowers();
        }
    });

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

    // Modal Generate Project bindings
    const btnAddNewTowerRow = document.getElementById('btn-add-new-tower-row');
    if (btnAddNewTowerRow) {
        btnAddNewTowerRow.addEventListener('click', addNewTowerConfigRow);
    }
    const newProjectNameInput = document.getElementById('new-project-name');
    if (newProjectNameInput) {
        newProjectNameInput.addEventListener('input', (e) => {
            const clean = e.target.value
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9\s-_]/g, "")
                .trim()
                .replace(/\s+/g, "_");
            document.getElementById('new-project-key').value = clean;
        });
    }
    const formGenerateProject = document.getElementById('form-generate-project');
    if (formGenerateProject) {
        formGenerateProject.addEventListener('submit', handleGenerateProjectSubmit);
    }

    // Batch approval listeners
    const btnBatchTrigger = document.getElementById('btn-batch-approve-trigger');
    if (btnBatchTrigger) {
        btnBatchTrigger.addEventListener('click', openBatchApprovalModal);
    }
    const towerSelect = document.getElementById('batch-approve-tower-select');
    if (towerSelect) {
        towerSelect.addEventListener('change', populateBatchApproveUnitsList);
    }
    const btnSelectAllUnits = document.getElementById('btn-batch-approve-select-all-units');
    if (btnSelectAllUnits) {
        btnSelectAllUnits.addEventListener('click', toggleSelectAllUnits);
    }
    const btnSelectAllFronts = document.getElementById('btn-batch-approve-select-all-fronts');
    if (btnSelectAllFronts) {
        btnSelectAllFronts.addEventListener('click', toggleSelectAllFronts);
    }
    const formBatchApprove = document.getElementById('form-batch-approve');
    if (formBatchApprove) {
        formBatchApprove.addEventListener('submit', handleBatchApproveSubmit);
    }
    
    // Weekly Planning listeners initialization
    initWeeklyPlanningListeners();

    // Restore Sequence Alerts listener
    const btnRestoreAlerts = document.getElementById('btn-restore-alerts');
    if (btnRestoreAlerts) {
        btnRestoreAlerts.addEventListener('click', async () => {
            if (projectState) {
                projectState.dismissedAlerts = [];
                await saveState();
                renderSequenceAlerts();
            }
        });
    }
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

    const isEngineerOrHigher = ['admin', 'engenheiro', 'gestor', 'diretor'].includes(user.role);
    const btnBatchTrigger = document.getElementById('btn-batch-approve-trigger');
    if (btnBatchTrigger) {
        if (isEngineerOrHigher) {
            btnBatchTrigger.classList.remove('hidden');
        } else {
            btnBatchTrigger.classList.add('hidden');
        }
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

    const canCreateProject = user.role === 'admin' || user.role === 'gestor';
    if (canCreateProject) {
        document.querySelectorAll('.create-project-allowed').forEach(el => el.classList.remove('hidden'));
    } else {
        document.querySelectorAll('.create-project-allowed').forEach(el => el.classList.add('hidden'));
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
    const canCreateProject = currentUser && (currentUser.role === 'admin' || currentUser.role === 'gestor');

    if (pageId === 'page-usuarios' && !isPowerUser) {
        pageId = 'page-mapa';
    }
    if (pageId === 'page-config' && !canConfig) {
        pageId = 'page-mapa';
    }
    if (pageId === 'page-permissoes' && !canManagePermissions) {
        pageId = 'page-mapa';
    }
    if (pageId === 'page-criar-obra' && !canCreateProject) {
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
    } else if (pageId === 'page-planejamento') {
        pageTitle.textContent = "Planejamento Semanal (Metas e Abastecimento)";
        renderWeeklyPlanningReport();
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
    } else if (pageId === 'page-criar-obra') {
        pageTitle.textContent = "Criar Nova Obra";
        initCriarObraPage();
    }
}

// -------------------------------------------------------------
// PAGE 1: MAPA GERAL METHODS
// -------------------------------------------------------------

function getUnitQualityStatus(unit, frontName) {
    if (unit.isHall) {
        return 'APROVADO';
    }

    if (frontName === 'VH') {
        const vhIdx = FRENTES_SEQUENCIA.indexOf('VH');
        if (unit.activeFrontIndex < vhIdx) {
            return 'BLOQUEADO';
        }
        if (unit.status_vh) return unit.status_vh;
        const hasPending = unit.reprovas && unit.reprovas.some(r => r.servico === 'VH' && r.status === 'Pendente');
        if (hasPending) return 'REPROVADO';
        if (unit.frontsData && (unit.frontsData['VH']?.concluido || unit.frontsData['VH']?.concluido === true)) return 'APROVADO';
        return 'LIBERADO';
    }
    
    if (frontName === 'VE') {
        const isVhDone = unit.frontsData && (unit.frontsData['VH']?.concluido || unit.frontsData['VH']?.concluido === true);
        if (!isVhDone) {
            return 'BLOQUEADO';
        }
        if (unit.status_ve) return unit.status_ve;
        const hasPending = unit.reprovas && unit.reprovas.some(r => r.servico === 'VE' && r.status === 'Pendente');
        if (hasPending) return 'REPROVADO';
        if (unit.frontsData && (unit.frontsData['VE']?.concluido || unit.frontsData['VE']?.concluido === true)) return 'APROVADO';
        return 'LIBERADO';
    }
    
    if (frontName === 'VQ') {
        const isVeDone = unit.frontsData && (unit.frontsData['VE']?.concluido || unit.frontsData['VE']?.concluido === true);
        if (!isVeDone) {
            return 'BLOQUEADO';
        }
        if (unit.status_vq) return unit.status_vq;
        const hasPending = unit.reprovas && unit.reprovas.some(r => r.servico === 'VQ' && r.status === 'Pendente');
        if (hasPending) return 'REPROVADO';
        if (unit.frontsData && (unit.frontsData['VQ']?.concluido || unit.frontsData['VQ']?.concluido === true)) return 'APROVADO';
        return 'LIBERADO';
    }
    
    if (frontName === 'VA') {
        const isVqDone = unit.frontsData && (unit.frontsData['VQ']?.concluido || unit.frontsData['VQ']?.concluido === true);
        if (!isVqDone) {
            return 'BLOQUEADO';
        }
        if (unit.status_va) return unit.status_va;
        const hasPending = unit.reprovas && unit.reprovas.some(r => r.servico === 'VA' && r.status === 'Pendente');
        if (hasPending) return 'REPROVADO';
        if (unit.frontsData && (unit.frontsData['VA']?.concluido || unit.frontsData['VA']?.concluido === true)) return 'APROVADO';
        return 'LIBERADO';
    }
    
    return 'LIBERADO';
}

function getUnitVAStatus(unit) {
    return getUnitQualityStatus(unit, 'VA');
}

function compileQualityStatsForScope(units, scopeName, totalObraUnits, frontName) {
    let aprovados = 0;
    let reprovados = 0;
    let liberado = 0;
    let revistoria = 0;
    let bloqueado = 0;
    let agendado = 0;
    let indisponivel = 0;
    
    units.forEach(u => {
        const status = getUnitQualityStatus(u, frontName);
        if (status === 'APROVADO') aprovados++;
        else if (status === 'REPROVADO') reprovados++;
        else if (status === 'LIBERADO') liberado++;
        else if (status === 'REVISTORIA') revistoria++;
        else if (status === 'BLOQUEADO') bloqueado++;
        else if (status === 'AGENDADO') agendado++;
        else if (status === 'INDISPONÍVEL') indisponivel++;
    });
    
    const realizadas = aprovados + reprovados;
    
    const getPct = (val) => {
        if (totalObraUnits === 0) return "0,00%";
        return ((val / totalObraUnits) * 100).toFixed(2).replace('.', ',') + '%';
    };
    
    return `
        <div class="va-summary-card">
            <h4 class="va-summary-title">${scopeName}</h4>
            <table class="va-summary-table">
                <thead>
                    <tr>
                        <th style="text-align: left;">INDICADORES</th>
                        <th style="text-align: center; width: 80px;">RESULTADOS</th>
                        <th style="text-align: right; width: 60px;">(%)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="va-row-aprovado">
                        <td class="indicator">APROVADOS</td>
                        <td class="value">${aprovados}</td>
                        <td class="percentage" style="color: #4ade80;">${getPct(aprovados)}</td>
                    </tr>
                    <tr class="va-row-reprovado">
                        <td class="indicator">REPROVADOS</td>
                        <td class="value">${reprovados}</td>
                        <td class="percentage" style="color: #f87171;">${getPct(reprovados)}</td>
                    </tr>
                    <tr class="va-row-realizadas">
                        <td class="indicator">REALIZADAS</td>
                        <td class="value">${realizadas}</td>
                        <td class="percentage" style="color: #9ca3af;">${getPct(realizadas)}</td>
                    </tr>
                    <tr>
                        <td class="indicator">LIBERADO</td>
                        <td class="value">${liberado}</td>
                        <td class="percentage" style="color: #f97316;">${getPct(liberado)}</td>
                    </tr>
                    <tr>
                        <td class="indicator">REVISTORIA</td>
                        <td class="value">${revistoria}</td>
                        <td class="percentage" style="color: #ec4899;">${getPct(revistoria)}</td>
                    </tr>
                    <tr>
                        <td class="indicator">BLOQUEADO</td>
                        <td class="value">${bloqueado}</td>
                        <td class="percentage" style="color: #a855f7;">${getPct(bloqueado)}</td>
                    </tr>
                    <tr>
                        <td class="indicator">AGENDADO</td>
                        <td class="value">${agendado}</td>
                        <td class="percentage" style="color: #3b82f6;">${getPct(agendado)}</td>
                    </tr>
                    <tr>
                        <td class="indicator">INDISPONÍVEL</td>
                        <td class="value">${indisponivel}</td>
                        <td class="percentage" style="color: #9ca3af;">${getPct(indisponivel)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

function renderSummaryStats() {
    const vaSummaryEl = document.getElementById('dashboard-va-summary');
    const normalSummaryEl = document.querySelector('.dashboard-summary');
    
    const isQualityFrontFiltered = ['VA', 'VQ', 'VH', 'VE'].includes(activeFilterFront);
    
    if (isQualityFrontFiltered) {
        if (normalSummaryEl) normalSummaryEl.classList.add('hidden');
        if (vaSummaryEl) {
            vaSummaryEl.classList.remove('hidden');
            
            let html = `<div class="va-summary-container">`;
            html += compileQualityStatsForScope(projectState.units, "VISÃO GERAL OBRA", projectState.units.length, activeFilterFront);
            projectState.towers.forEach(t => {
                const towerUnits = projectState.units.filter(u => u.tower === t.name);
                html += compileQualityStatsForScope(towerUnits, `VISÃO GERAL ${t.name.toUpperCase()}`, projectState.units.length, activeFilterFront);
            });
            html += `</div>`;
            
            vaSummaryEl.innerHTML = html;
        }
    } else {
        if (vaSummaryEl) vaSummaryEl.classList.add('hidden');
        if (normalSummaryEl) normalSummaryEl.classList.remove('hidden');
        
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
            renderSummaryStats();
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
        <span class="legend-text">Entrega dos Sonhos (${doneUnits})</span>
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
        renderSummaryStats();
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
            
            // Check if this tower has any halls on this floor
            const hasHallOnThisFloor = towerUnits.some(unit => unit.floor === f && unit.isHall);
            
            let unitsOrder = [];
            if (hasHallOnThisFloor) {
                // Cittá Splendore layout: 1 to 4, Hall, 5 to 8
                for (let u = 1; u <= 4; u++) {
                    unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
                }
                const hallUnit = towerUnits.find(unit => unit.floor === f && unit.isHall);
                if (hallUnit) {
                    unitsOrder.push(hallUnit.unit);
                } else {
                    unitsOrder.push(`${f} Hall`);
                }
                for (let u = 5; u <= 8; u++) {
                    unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
                }
            } else {
                for (let u = 1; u <= tConfig.unitsPerFloor; u++) {
                    unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
                }
            }

            unitsRowContainer.style.gridTemplateColumns = `repeat(${unitsOrder.length}, 1fr)`;

            unitsOrder.forEach(unitNum => {
                const matchedUnit = towerUnits.find(unit => unit.unit == unitNum && unit.floor == f);
                const cell = document.createElement('div');
                cell.className = 'unit-cell';
                
                if (matchedUnit) {
                    if (matchedUnit.isHall) {
                        cell.classList.add('hall-cell');
                    }
                    
                    const frontIndex = matchedUnit.activeFrontIndex;
                    let frontName = "";
                    let cellClass = "";
                    
                    if (frontIndex === FRENTES_SEQUENCIA.length) {
                        frontName = "Entrega dos Sonhos";
                    } else {
                        frontName = FRENTES_SEQUENCIA[frontIndex];
                    }

                    // 1. Determine match status if filter is active
                    let isMatch = false;
                    if (activeFilterFront) {
                        if (activeFilterFront === 'Concluido') {
                            isMatch = (frontIndex === FRENTES_SEQUENCIA.length);
                        } else {
                            isMatch = (frontName === activeFilterFront);
                        }
                    }

                    // 2. Apply styling based on filter state
                    let inlineBgColor = "";
                    let inlineTextColor = "";
                    
                    if (!activeFilterFront) {
                        // No filter: paint every unit in its active front color
                        if (frontIndex === FRENTES_SEQUENCIA.length) {
                            inlineBgColor = FRENTES_CORES["Concluido"] || "#00c853";
                            inlineTextColor = "#ffffff";
                        } else {
                            inlineBgColor = FRENTES_CORES[frontName] || "#ccc";
                            inlineTextColor = (frontName === 'VQ' || inlineBgColor === '#eab308') ? '#000000' : '#ffffff';
                        }
                    } else {
                        // Filter active
                        if (isMatch) {
                            // Unit matches the filter: paint it
                            if (['VQ', 'VA', 'VH', 'VE'].includes(activeFilterFront)) {
                                // Quality front: use CSS classes (va-aprovado, va-reprovado, etc.)
                                const status = getUnitQualityStatus(matchedUnit, activeFilterFront);
                                cellClass = `va-${status.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '')}`;
                            } else {
                                // Production front or Concluido: use inline color
                                if (frontIndex === FRENTES_SEQUENCIA.length) {
                                    inlineBgColor = FRENTES_CORES["Concluido"] || "#00c853";
                                    inlineTextColor = "#ffffff";
                                } else {
                                    inlineBgColor = FRENTES_CORES[frontName] || "#ccc";
                                    inlineTextColor = (frontName === 'VQ' || inlineBgColor === '#eab308') ? '#000000' : '#ffffff';
                                }
                            }
                        } else {
                            // Unit is outside the filter: remains colorless (default grey/dark)
                            cellClass = ""; // no color class
                            inlineBgColor = ""; // no inline background
                            inlineTextColor = ""; // no inline color
                        }
                    }
                    
                    if (cellClass) {
                        cell.className = `unit-cell ${cellClass}`;
                        if (matchedUnit.isHall) {
                            cell.classList.add('hall-cell');
                        }
                    }
                    if (inlineBgColor) {
                        cell.style.backgroundColor = inlineBgColor;
                        cell.style.color = inlineTextColor;
                    } else {
                        cell.style.backgroundColor = "";
                        cell.style.color = "";
                    }

                    const displayText = matchedUnit.isHall ? matchedUnit.unit : unitNum;
                    if (['VQ', 'VA', 'VH', 'VE'].includes(activeFilterFront) && isMatch) {
                        const status = getUnitQualityStatus(matchedUnit, activeFilterFront);
                        cell.innerHTML = `
                            <span class="unit-num" style="font-size: 0.8rem; font-weight: 700; line-height: 1.1;">${displayText}</span>
                            <span class="va-status-label">${status}</span>
                        `;
                    } else {
                        cell.innerHTML = `<span class="unit-num">${displayText}</span>`;
                    }
                    
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
                    
                    let statusGeralText = matchedUnit.status_geral;
                    if (['VQ', 'VA', 'VH', 'VE'].includes(activeFilterFront)) {
                        statusGeralText = getUnitQualityStatus(matchedUnit, activeFilterFront);
                    }
                    cell.title = `${matchedUnit.tower} - ${unitNum}\nFrente: ${frontIndex === FRENTES_SEQUENCIA.length ? 'Entrega dos Sonhos' : frontName}\nStatus: ${statusGeralText}`;
                    if (outOfOrder) cell.title += `\n⚠️ Fora de sequência!`;
                    if (delayed) cell.title += `\n⚠️ Prazo atrasado!`;
                    
                    if (activeFilterFront && !isMatch) {
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
            });
            gridContainer.appendChild(row);
        }
    });

    // Render Sequence Alerts
    renderSequenceAlerts();
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

    // 2.5. Populate Batch Approval (Lote) interface and permissions
    const loteTowerSelect = document.getElementById('lote-tower');
    const loteFloorSelect = document.getElementById('lote-floor');
    const loteContainer = document.getElementById('frente-lote-container');
    const loteDateInput = document.getElementById('lote-date');

    // Set today as default date for batch approval
    if (loteDateInput && !loteDateInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        loteDateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    if (loteTowerSelect && loteContainer) {
        const userRole = currentUser ? currentUser.role : 'fiscal';
        const allowed = currentUser ? currentUser.allowedFronts : null;
        const isFrontAllowed = !allowed || allowed.length === 0 || allowed.includes(activeFrente);
        const canBatchApprove = (userRole === 'admin' || userRole === 'engenheiro' || userRole === 'gestor') && isFrontAllowed;

        if (canBatchApprove && pendingUnits.length > 0) {
            loteContainer.classList.remove('hidden');

            // Dynamically handle lote status dropdown based on activeFrente
            const loteStatusGroup = document.getElementById('lote-status-group');
            const loteStatusSelect = document.getElementById('lote-status');
            const loteSubmitBtn = document.getElementById('btn-lote-submit');

            if (loteStatusGroup && loteStatusSelect) {
                const isQualityFront = ['VA', 'VQ', 'VH', 'VE'].includes(activeFrente);
                if (isQualityFront) {
                    loteStatusGroup.classList.remove('hidden');
                    
                    // Save previous selection to restore
                    const prevStatusVal = loteStatusSelect.value;
                    loteStatusSelect.innerHTML = '';

                    let statuses = [];
                    if (activeFrente === 'VA') {
                        statuses = [
                            { val: 'APROVADO', label: 'Aprovado' },
                            { val: 'REPROVADO', label: 'Reprovado' },
                            { val: 'LIBERADO', label: 'Liberado' },
                            { val: 'BLOQUEADO', label: 'Bloqueado' },
                            { val: 'INDISPONÍVEL', label: 'Indisponível' },
                            { val: 'AGENDADO', label: 'Agendado' },
                            { val: 'PERMUTANTE', label: 'Permutante' }
                        ];
                    } else {
                        // VH, VE, VQ
                        statuses = [
                            { val: 'APROVADO', label: 'Aprovado' },
                            { val: 'REPROVADO', label: 'Reprovado' },
                            { val: 'LIBERADO', label: 'Liberado' },
                            { val: 'BLOQUEADO', label: 'Bloqueado' }
                        ];
                    }

                    statuses.forEach(st => {
                        const opt = document.createElement('option');
                        opt.value = st.val;
                        opt.textContent = st.label;
                        if (st.val === prevStatusVal) {
                            opt.selected = true;
                        }
                        loteStatusSelect.appendChild(opt);
                    });

                    // Add listener to change button text dynamically based on status
                    const updateSubmitBtnText = () => {
                        if (loteSubmitBtn) {
                            if (loteStatusSelect.value === 'APROVADO') {
                                loteSubmitBtn.innerHTML = '<i class="fa fa-check-double"></i> Aprovar em Lote';
                            } else {
                                loteSubmitBtn.innerHTML = '<i class="fa fa-traffic-light"></i> Aplicar Status em Lote';
                            }
                        }
                    };

                    if (!loteStatusSelect.dataset.listenerBound) {
                        loteStatusSelect.addEventListener('change', updateSubmitBtnText);
                        loteStatusSelect.dataset.listenerBound = 'true';
                    }

                    // Run it once now
                    updateSubmitBtnText();

                } else {
                    loteStatusGroup.classList.add('hidden');
                    loteStatusSelect.innerHTML = '';
                    if (loteSubmitBtn) {
                        loteSubmitBtn.innerHTML = '<i class="fa fa-check-double"></i> Aprovar em Lote';
                    }
                }
            }
            
            // Save current selection to restore after rendering
            const currentSelectedTower = loteTowerSelect.value;
            loteTowerSelect.innerHTML = '<option value="">Selecione a Torre...</option>';
            projectState.towers.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t.name;
                opt.textContent = t.name;
                if (t.name === currentSelectedTower) {
                    opt.selected = true;
                }
                loteTowerSelect.appendChild(opt);
            });

            // Handle floor selection population based on selected tower
            const updateFloorOptions = () => {
                const selectedTowerName = loteTowerSelect.value;
                const currentSelectedFloor = loteFloorSelect.value;
                loteFloorSelect.innerHTML = '<option value="all">Toda a Torre</option>';
                if (selectedTowerName) {
                    const towerObj = projectState.towers.find(t => t.name === selectedTowerName);
                    if (towerObj) {
                        const totalFloors = towerObj.floors || 12;
                        for (let f = 1; f <= totalFloors; f++) {
                            const opt = document.createElement('option');
                            opt.value = f;
                            opt.textContent = `${f}º Pavimento`;
                            if (f.toString() === currentSelectedFloor) {
                                opt.selected = true;
                            }
                            loteFloorSelect.appendChild(opt);
                        }
                    }
                }
                updateLoteUnitsSelection();
            };
            
            // Only bind change listener once
            if (!loteTowerSelect.dataset.listenerBound) {
                loteTowerSelect.addEventListener('change', updateFloorOptions);
                loteTowerSelect.dataset.listenerBound = 'true';
            }

            if (!loteFloorSelect.dataset.listenerBound) {
                loteFloorSelect.addEventListener('change', () => {
                    filterLoteUnitsByFloor(loteFloorSelect.value);
                });
                loteFloorSelect.dataset.listenerBound = 'true';
            }

            const btnLoteSelectAll = document.getElementById('btn-lote-select-all');
            if (btnLoteSelectAll && !btnLoteSelectAll.dataset.listenerBound) {
                btnLoteSelectAll.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('.lote-unit-item:not(.hidden) .lote-unit-checkbox');
                    checkboxes.forEach(cb => cb.checked = true);
                    updateLoteUnitsSelectedCount();
                });
                btnLoteSelectAll.dataset.listenerBound = 'true';
            }

            const btnLoteDeselectAll = document.getElementById('btn-lote-deselect-all');
            if (btnLoteDeselectAll && !btnLoteDeselectAll.dataset.listenerBound) {
                btnLoteDeselectAll.addEventListener('click', () => {
                    const checkboxes = document.querySelectorAll('.lote-unit-item:not(.hidden) .lote-unit-checkbox');
                    checkboxes.forEach(cb => cb.checked = false);
                    updateLoteUnitsSelectedCount();
                });
                btnLoteDeselectAll.dataset.listenerBound = 'true';
            }
            
            // Run it now
            updateFloorOptions();
        } else {
            loteContainer.classList.add('hidden');
            const unitsSelContainer = document.getElementById('lote-units-selection-container');
            if (unitsSelContainer) unitsSelContainer.classList.add('hidden');
        }
    }

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
            if (fData.na) {
                statusLabel = '<span class="badge" style="background-color: var(--status-bloqueado)">Não se Aplica</span>';
                dateText = `<span class="text-muted">-</span>`;
                realDoneDate = `<strong style="color: var(--status-bloqueado)">N/A</strong>`;
            } else {
                statusLabel = '<span class="badge bg-green">Concluído</span>';
                dateText = `<span class="text-muted">-</span>`;
                realDoneDate = `<strong class="text-success">${fData.dataFinal}</strong>`;
            }
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
        const isQualityFront = ['VH', 'VE', 'VQ', 'VA'].includes(activeFrente);
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
        } else if (isActive || isQualityFront) {
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

        let reprovaBtn = "";
        if ((isActive || isQualityFront) && ['VQ', 'VA', 'VH', 'VE'].includes(activeFrente) && !isReadOnly && isFrontAllowed) {
            reprovaBtn = `
                <button class="btn btn-xs btn-danger btn-unit-reprova" data-id="${u.id}" style="background-color: var(--status-reprovado); border-color: var(--status-reprovado); color: white;" title="Registrar Reprova Individual"><i class="fa fa-triangle-exclamation"></i> Reprova</button>
                <button class="btn btn-xs btn-outline btn-unit-reprova-lote" data-id="${u.id}" style="color: var(--status-reprovado); border-color: var(--status-reprovado);" title="Inserir Dados em Lote"><i class="fa fa-layer-group"></i> Inserir em Lote</button>
            `;
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
                    ${reprovaBtn}
                </div>
            </td>
        `;

        tr.querySelector('.btn-unit-view').addEventListener('click', () => openUnitDetailsModal(u.id));
        if (isDone && canReopen) {
            tr.querySelector('.btn-unit-reopen').addEventListener('click', () => handleReopenFront(u.id, activeFrente));
        } else if ((isActive || isQualityFront) && !isReadOnly && isFrontAllowed) {
            tr.querySelector('.btn-unit-update').addEventListener('click', () => openUpdateFrontModal(u.id, activeFrente));
            if (['VQ', 'VA', 'VH', 'VE'].includes(activeFrente)) {
                tr.querySelector('.btn-unit-reprova').addEventListener('click', () => openAddReprovaModal(u.id));
                const btnLote = tr.querySelector('.btn-unit-reprova-lote');
                if (btnLote) {
                    btnLote.addEventListener('click', () => openUnitDetailsModal(u.id, 'modal-tab-reprovas', 'modal-rep-sub-excel'));
                }
            }
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
        status: (document.getElementById('rep-col-filter-status')?.value || '').toLowerCase().trim(),
        data_inicio: (document.getElementById('rep-col-filter-data-inicio')?.value || '').toLowerCase().trim(),
        data_fim: (document.getElementById('rep-col-filter-data-fim')?.value || '').toLowerCase().trim()
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
    if (colFilters.data_inicio) {
        matchedReprovas = matchedReprovas.filter(m => (m.reprova.data_inicio || '').toLowerCase().includes(colFilters.data_inicio));
    }
    if (colFilters.data_fim) {
        matchedReprovas = matchedReprovas.filter(m => (m.reprova.data_fim || '').toLowerCase().includes(colFilters.data_fim));
    }

    const totalItems = matchedReprovas.length;
    const totalPages = Math.ceil(totalItems / reprovasPageSize) || 1;
    
    if (currentReprovasPage > totalPages) {
        currentReprovasPage = totalPages;
    }
    
    // Update pagination DOM elements
    document.getElementById('rep-pag-start').textContent = totalItems === 0 ? 0 : (currentReprovasPage - 1) * reprovasPageSize + 1;
    document.getElementById('rep-pag-end').textContent = Math.min(currentReprovasPage * reprovasPageSize, totalItems);
    document.getElementById('rep-pag-total').textContent = totalItems;
    document.getElementById('rep-pag-current').textContent = currentReprovasPage;
    document.getElementById('rep-pag-total-pages').textContent = totalPages;
    
    const btnPrev = document.getElementById('btn-rep-pag-prev');
    const btnNext = document.getElementById('btn-rep-pag-next');
    if (btnPrev) {
        btnPrev.disabled = currentReprovasPage <= 1;
        btnPrev.style.opacity = btnPrev.disabled ? '0.4' : '1';
        btnPrev.style.pointerEvents = btnPrev.disabled ? 'none' : 'auto';
    }
    if (btnNext) {
        btnNext.disabled = currentReprovasPage >= totalPages;
        btnNext.style.opacity = btnNext.disabled ? '0.4' : '1';
        btnNext.style.pointerEvents = btnNext.disabled ? 'none' : 'auto';
    }

    if (totalItems === 0) {
        emptyMsg.classList.remove('hidden');
        document.getElementById('reprovas-pagination-container').style.display = 'none';
        return;
    }
    emptyMsg.classList.add('hidden');
    document.getElementById('reprovas-pagination-container').style.display = 'flex';

    // Sort by status (Pendente first)
    matchedReprovas.sort((a, b) => {
        if (a.reprova.status === 'Pendente' && b.reprova.status === 'Resolvido') return -1;
        if (a.reprova.status === 'Resolvido' && b.reprova.status === 'Pendente') return 1;
        return 0;
    });

    const paginatedReprovas = matchedReprovas.slice(
        (currentReprovasPage - 1) * reprovasPageSize,
        currentReprovasPage * reprovasPageSize
    );

    paginatedReprovas.forEach(m => {
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
                <span class="badge" style="background-color: ${r.exec_status === 'CONCLUÍDO' ? 'var(--status-aprovado)' : r.exec_status === 'EXECUTANDO' ? 'var(--status-agendado)' : 'var(--status-reprovado)'}">
                    ${r.exec_status || 'PENDENTE'}
                </span>
            </td>
            <td>
                <span class="badge" style="background-color: ${r.dificuldade === 'EASY' ? 'var(--status-aprovado)' : r.dificuldade === 'HARD' ? 'var(--status-reprovado)' : 'var(--status-agendado)'}">
                    ${r.dificuldade || 'NORMAL'}
                </span>
            </td>
            <td>
                <span class="badge" style="background-color: ${r.status === 'Resolvido' ? 'var(--status-aprovado)' : 'var(--status-reprovado)'}">
                    ${r.status_aprovacao || (r.status === 'Resolvido' ? 'APROVADO' : 'REPROVADO')}
                </span>
            </td>
            <td>${r.data_inicio || '-'}</td>
            <td>${r.data_fim || '-'}</td>
            <td>
                <div style="display: flex; gap: 6px; align-items: center;">
                ${r.status === 'Pendente' ? `
                    <button class="btn btn-xs btn-primary btn-resolve-reprova" data-unit-id="${m.unitId}" data-rep-id="${r.id}">
                        <i class="fa fa-check"></i> Resolver
                    </button>
                ` : '<span class="text-success" style="font-size: 0.75rem; font-weight: 500;"><i class="fa fa-circle-check"></i> Resolvido</span>'}
                <button class="btn btn-xs btn-outline btn-edit-reprova" data-unit-id="${m.unitId}" data-rep-id="${r.id}">
                    <i class="fa fa-pen"></i> Editar
                </button>
                </div>
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

        const btnEdit = tr.querySelector('.btn-edit-reprova');
        if (btnEdit) {
            btnEdit.addEventListener('click', () => {
                const uId = btnEdit.dataset.unitId;
                const rId = btnEdit.dataset.repId;
                openEditReprovaModal(uId, rId);
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
            rep.status_aprovacao = 'APROVADO';
            rep.exec_status = 'CONCLUÍDO';
            
            // Re-evaluate quality front advancement if any
            const activeFrontName = FRENTES_SEQUENCIA[unit.activeFrontIndex];
            checkAndAdvanceQualityFront(unit, activeFrontName);
            
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
        alert("Apenas o Engenheiro, Administrador e Gestor podem alterar a estrutura da obra.");
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
            const tCode = name.replace(/\s+/g, '').substring(0, 2).toUpperCase(); // e.g. T1, T2

            // Normal units
            for (let u = 1; u <= unitsPerFloor; u++) {
                const unitNum = `${f}` + String(u).padStart(2, '0');
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

            // Hall unit for this floor
            const hallUnitNum = `${f} Hall`;
            const hallId = `${tCode}-${f}-HALL`;
            const existingHall = projectState.units.find(x => x.tower === name && x.floor == f && x.unit === hallUnitNum);

            if (existingHall) {
                newUnits.push(existingHall);
            } else {
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
                    id: hallId,
                    tower: name,
                    floor: f,
                    unit: hallUnitNum,
                    status_geral: "Ativo",
                    activeFrontIndex: 0,
                    frontsData: fronts,
                    reprovas: [],
                    isHall: true
                });
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
        const localKey = 'mrv_project_state_' + activeProjectName;
        localStorage.removeItem(localKey);
        
        if (syncMode === 'api') {
            try {
                const response = await fetch('/api/project/reset?name=' + encodeURIComponent(activeProjectName));
                if (response.ok) {
                    alert("Dados semente da Planilha Splendore restaurados no servidor!");
                    location.reload();
                    return;
                }
            } catch (e) {
                console.error("Erro ao resetar no servidor, tentando local", e);
            }
        }
        
        await loadSeedData();
        alert("Dados semente da Planilha Splendore restaurados localmente!");
        navigateToPage('page-mapa');
    }
}

// -------------------------------------------------------------
// MODALS METHODS & HANDLERS
// -------------------------------------------------------------

function openUnitDetailsModal(unitId, openTabId = 'modal-tab-workflow', openSubTabId = null) {
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
    optDone.textContent = "Entrega dos Sonhos";
    selector.appendChild(optDone);

    if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
        selector.value = "Concluido";
    } else {
        selector.value = FRENTES_SEQUENCIA[u.activeFrontIndex];
    }
    
    // VH status selector handling
    const vhStatusContainer = document.getElementById('modal-unit-vh-status-container');
    const vhSelector = document.getElementById('modal-unit-vh-status-selector');
    if (vhStatusContainer) {
        vhStatusContainer.classList.remove('hidden');
        if (vhSelector) vhSelector.value = u.status_vh || "";
    }

    // VE status selector handling
    const veStatusContainer = document.getElementById('modal-unit-ve-status-container');
    const veSelector = document.getElementById('modal-unit-ve-status-selector');
    if (veStatusContainer) {
        veStatusContainer.classList.remove('hidden');
        if (veSelector) veSelector.value = u.status_ve || "";
    }

    // VQ status selector handling
    const vqStatusContainer = document.getElementById('modal-unit-vq-status-container');
    const vqSelector = document.getElementById('modal-unit-vq-status-selector');
    if (vqStatusContainer) {
        vqStatusContainer.classList.remove('hidden');
        if (vqSelector) vqSelector.value = u.status_vq || "";
    }

    // VA status selector handling
    const vaStatusContainer = document.getElementById('modal-unit-va-status-container');
    const vaSelector = document.getElementById('modal-unit-va-status-selector');
    if (vaStatusContainer) {
        vaStatusContainer.classList.remove('hidden');
        if (vaSelector) vaSelector.value = u.status_va || "";
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
            if (fData.na) {
                statusClass = "na-ignored";
                statusText = "Não se aplica a esta unidade / Serviço excluído";
            } else {
                statusClass = "done";
                statusText = `Executado por ${fData.responsavel || 'N/D'} em ${fData.dataFinal || ''} (Duração: ${fData.duracaoReal || 1} dias)`;
            }
        } else if (u.activeFrontIndex === idx) {
            statusClass = "active";
            statusText = "Liberado para execução - Em andamento";
        }
        
        item.classList.add(statusClass);
        if (statusClass === "na-ignored") {
            item.style.opacity = "0.7";
        }
        
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
                ${fData.concluido ? (fData.na ? '<i class="fa fa-ban" style="color: var(--status-bloqueado)"></i>' : '<i class="fa fa-check"></i>') : idx + 1}
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

        if (fData.concluido || u.activeFrontIndex === idx) {
            item.style.cursor = 'pointer';
            item.title = "Clique para editar ou alterar a data deste serviço";
            
            const header = item.querySelector('.timeline-header');
            if (header) {
                const editIndicator = document.createElement('span');
                editIndicator.innerHTML = ` <i class="fa fa-pen" style="font-size: 0.7rem; color: var(--primary-color);" title="Editar"></i>`;
                header.appendChild(editIndicator);
            }

            item.addEventListener('click', () => {
                openUpdateFrontModal(u.id, f);
            });
        }

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
            
            const dateLine = `<span>Início: ${r.data_inicio || '-'}</span>${r.data_fim ? ` | <span>Fim: ${r.data_fim}</span>` : ''}`;
            const statusBadges = `
                <div style="margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap;">
                    <span class="badge" style="font-size: 0.7rem; padding: 2px 6px; background-color: ${r.exec_status === 'CONCLUÍDO' ? 'var(--status-aprovado)' : r.exec_status === 'EXECUTANDO' ? 'var(--status-agendado)' : 'var(--status-reprovado)'}; opacity: 0.9;">Exec: ${r.exec_status || 'PENDENTE'}</span>
                    <span class="badge" style="font-size: 0.7rem; padding: 2px 6px; background-color: ${r.dificuldade === 'EASY' ? 'var(--status-aprovado)' : r.dificuldade === 'HARD' ? 'var(--status-reprovado)' : 'var(--status-agendado)'}; opacity: 0.9;">Dif: ${r.dificuldade || 'NORMAL'}</span>
                    <span class="badge" style="font-size: 0.7rem; padding: 2px 6px; background-color: ${r.status === 'Resolvido' ? 'var(--status-aprovado)' : 'var(--status-reprovado)'}; opacity: 0.9;">Aprovação: ${r.status_aprovacao || (r.status === 'Resolvido' ? 'APROVADO' : 'REPROVADO')}</span>
                </div>
            `;

            card.innerHTML = `
                <div class="reprova-card-header">
                    <span class="room"><i class="fa fa-location-dot text-danger"></i> ${r.local} (${r.servico})</span>
                    <span class="badge" style="background-color: ${r.status === 'Pendente' ? 'var(--status-reprovado)' : 'var(--status-aprovado)'}">${r.status}</span>
                </div>
                <div class="reprova-card-body">${r.descricao}</div>
                ${matLine}
                ${statusBadges}
                <div class="reprova-card-footer" style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; border-top: 1px dashed var(--border-color); padding-top: 8px;">
                    <div>
                        <span>Resp: ${r.responsavel || 'N/D'}</span> | 
                        ${dateLine}
                    </div>
                    <button class="btn btn-xs btn-outline btn-edit-unit-reprova" data-rep-id="${r.id}" style="padding: 2px 6px; font-size: 0.75rem;"><i class="fa fa-pen"></i> Editar</button>
                </div>
            `;
            
            card.querySelector('.btn-edit-unit-reprova').addEventListener('click', () => {
                modalUnitDetails.classList.add('hidden');
                openEditReprovaModal(u.id, r.id);
            });
            
            repRoot.appendChild(card);
        });
    }


    // Show Add Reprova button if unit is in VH, VE, VQ or VA step
    const btnAddRep = document.getElementById('modal-btn-add-reprova');
    const vhIdx = FRENTES_SEQUENCIA.indexOf("VH");
    const veIdx = FRENTES_SEQUENCIA.indexOf("VE");
    const vqIdx = FRENTES_SEQUENCIA.indexOf("VQ");
    const vaIdx = FRENTES_SEQUENCIA.indexOf("VA");
    const isQualityActive = [vhIdx, veIdx, vqIdx, vaIdx].includes(u.activeFrontIndex);
    if (isQualityActive && u.activeFrontIndex < FRENTES_SEQUENCIA.length) {
        btnAddRep.classList.remove('hidden');
    } else {
        btnAddRep.classList.add('hidden');
    }

    // Set active tab
    modal.querySelectorAll('.modal-tab-btn').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));

    const tabBtn = modal.querySelector(`[data-tab="${openTabId}"]`);
    const tabPanel = modal.querySelector(`#${openTabId}`);
    if (tabBtn && tabPanel) {
        tabBtn.classList.add('active');
        tabPanel.classList.add('active');
    } else {
        modal.querySelector('[data-tab="modal-tab-workflow"]').classList.add('active');
        modal.querySelector('#modal-tab-workflow').classList.add('active');
    }

    // Also reset VQ/VA sub-tabs internally
    modal.querySelectorAll('#modal-tab-reprovas .modal-tab-btn').forEach(b => b.classList.remove('active'));
    modal.querySelectorAll('#modal-tab-reprovas .modal-tab-panel').forEach(p => p.classList.remove('active'));

    const subTab = openSubTabId || 'modal-rep-sub-list';
    const subListBtn = modal.querySelector(`#modal-tab-reprovas [data-tab="${subTab}"]`);
    const subListPanel = modal.querySelector(`#${subTab}`);
    if (subListBtn && subListPanel) {
        subListBtn.classList.add('active');
        subListPanel.classList.add('active');
    } else {
        const defaultSubBtn = modal.querySelector('#modal-tab-reprovas [data-tab="modal-rep-sub-list"]');
        if (defaultSubBtn) defaultSubBtn.classList.add('active');
        const defaultSubPanel = modal.querySelector('#modal-rep-sub-list');
        if (defaultSubPanel) defaultSubPanel.classList.add('active');
    }

    if (subTab === 'modal-rep-sub-excel') {
        updateBulkWizardStep(1);
    }

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

    if (!u.frontsData[frenteName]) {
        u.frontsData[frenteName] = {
            responsavel: "",
            dataInicio: "",
            dataFinal: "",
            duracaoProj: 0,
            duracaoReal: 0,
            concluido: false,
            materials: {}
        };
    }
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

        // Recalculate active front index based on sequential completion
        let newIndex = 0;
        for (let i = 0; i < FRENTES_SEQUENCIA.length; i++) {
            const f = FRENTES_SEQUENCIA[i];
            if (u.frontsData[f] && u.frontsData[f].concluido) {
                newIndex = i + 1;
            } else {
                break;
            }
        }
        u.activeFrontIndex = newIndex;

        // If the front is VA, set status_va to APROVADO
        if (frenteName === 'VA') {
            u.status_va = 'APROVADO';
        }
        
        // Update general status
        if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
            u.status_geral = 'Aprovado';
        } else {
            const hasPending = u.reprovas && u.reprovas.some(r => r.status === 'Pendente');
            u.status_geral = hasPending ? 'Reprovado' : 'Ativo';
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

async function handleUpdateNaClick() {
    const unitId = document.getElementById('update-unit-id').value;
    const frenteName = document.getElementById('update-front-name').value;
    
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;
    
    if (!confirm(`Deseja realmente marcar a frente "${frenteName}" como "Não se Aplica" para a unidade ${u.tower} - Apto ${u.unit}?`)) {
        return;
    }
    
    if (!u.frontsData[frenteName]) {
        u.frontsData[frenteName] = {};
    }
    const fData = u.frontsData[frenteName];
    fData.concluido = true;
    fData.na = true;
    fData.responsavel = "N/A";
    fData.dataFinal = "N/A";
    
    // Advance to next service front
    u.activeFrontIndex++;
    
    // Update general status
    if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
        u.status_geral = 'Aprovado';
    } else {
        u.status_geral = 'Ativo';
    }
    
    await saveState();
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

async function handleBatchApprovalSubmit(e) {
    e.preventDefault();
    
    const tower = document.getElementById('lote-tower').value;
    const floorStr = document.getElementById('lote-floor').value;
    const responsavel = document.getElementById('lote-resp').value.trim();
    const dataFinalVal = document.getElementById('lote-date').value;
    const materialNome = document.getElementById('lote-material-nome').value.trim();
    const materialQtd = parseFloat(document.getElementById('lote-material-qtd').value) || 0;

    if (!tower) {
        alert("Por favor, selecione uma Torre.");
        return;
    }
    if (!responsavel) {
        alert("Por favor, preencha o Responsável.");
        return;
    }
    if (!dataFinalVal) {
        alert("Por favor, selecione a Data de Conclusão.");
        return;
    }

    const fIdx = FRENTES_SEQUENCIA.indexOf(activeFrente);
    if (fIdx === -1) return;

    // Filter units matching the checked checkboxes
    const checkedCheckboxes = Array.from(document.querySelectorAll('.lote-unit-checkbox:checked'));
    const selectedUnitIds = checkedCheckboxes.map(cb => cb.value);

    let unitsToApprove = projectState.units.filter(u => selectedUnitIds.includes(u.id));

    const loteStatusSelect = document.getElementById('lote-status');
    const loteStatusGroup = document.getElementById('lote-status-group');
    const hasStatus = loteStatusGroup && !loteStatusGroup.classList.contains('hidden');
    const selectedStatus = hasStatus ? loteStatusSelect.value : 'APROVADO';

    if (unitsToApprove.length === 0) {
        alert("Nenhuma unidade pendente foi selecionada para aprovação em lote.");
        return;
    }

    const confirmMsg = selectedStatus === 'APROVADO' 
        ? `Deseja realmente aprovar em lote a frente "${activeFrente}" para as ${unitsToApprove.length} unidades selecionadas?`
        : `Deseja realmente aplicar o status "${selectedStatus}" em lote na frente "${activeFrente}" para as ${unitsToApprove.length} unidades selecionadas?`;
        
    if (!confirm(confirmMsg)) {
        return;
    }

    const formattedDate = convertYMDToDMY(dataFinalVal);

    // Prepare materials array if supplied
    let batchMaterials = [];
    if (materialNome && materialQtd > 0) {
        batchMaterials.push({
            material: materialNome,
            quantidade: materialQtd,
            tipo: "",
            subtipo: "",
            observacao: "Lançamento em lote",
            data_lancamento: new Date().toLocaleDateString('pt-BR')
        });
    }

    // Process approval
    unitsToApprove.forEach(u => {
        if (!u.frontsData[activeFrente]) {
            u.frontsData[activeFrente] = {};
        }
        const fData = u.frontsData[activeFrente];
        fData.responsavel = responsavel;
        fData.dataFinal = formattedDate;
        
        if (batchMaterials.length > 0) {
            fData.materials = JSON.parse(JSON.stringify(batchMaterials));
        }

        if (selectedStatus === 'APROVADO') {
            fData.concluido = true;
            fData.duracaoProj = fData.duracaoProj || 1;
            fData.duracaoReal = fData.duracaoReal || 1;

            // Apply quality status property to the unit if it is a quality front
            if (activeFrente === 'VH') u.status_vh = 'APROVADO';
            else if (activeFrente === 'VE') u.status_ve = 'APROVADO';
            else if (activeFrente === 'VQ') u.status_vq = 'APROVADO';
            else if (activeFrente === 'VA') u.status_va = 'APROVADO';

            // Advance front index
            u.activeFrontIndex++;

            // Update status_geral
            if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
                u.status_geral = 'Aprovado';
            } else {
                u.status_geral = 'Ativo';
            }
        } else {
            fData.concluido = false;
            
            // Apply other quality status property
            if (activeFrente === 'VH') u.status_vh = selectedStatus;
            else if (activeFrente === 'VE') u.status_ve = selectedStatus;
            else if (activeFrente === 'VQ') u.status_vq = selectedStatus;
            else if (activeFrente === 'VA') u.status_va = selectedStatus;
        }
    });

    // Save and refresh
    await saveState();

    // Reset optional material inputs in form
    document.getElementById('lote-material-nome').value = "";
    document.getElementById('lote-material-qtd').value = "";

    // Show feedback
    if (selectedStatus === 'APROVADO') {
        alert(`${unitsToApprove.length} unidades aprovadas com sucesso!`);
    } else {
        alert(`Status "${selectedStatus}" aplicado com sucesso para ${unitsToApprove.length} unidades!`);
    }

    // Refresh UI
    if (activePage === 'page-frentes') {
        renderFrentesSubtabs();
        renderFrenteDetails();
    }
}

function updateLoteUnitsSelection() {
    const towerSelect = document.getElementById('lote-tower');
    const floorSelect = document.getElementById('lote-floor');
    const container = document.getElementById('lote-units-selection-container');
    const grid = document.getElementById('lote-units-grid');
    const countSpan = document.getElementById('lote-units-selected-count');

    if (!towerSelect || !container || !grid || !countSpan) return;

    const tower = towerSelect.value;
    const floorStr = floorSelect ? floorSelect.value : 'all';

    if (!tower) {
        container.classList.add('hidden');
        grid.innerHTML = '';
        countSpan.textContent = '0 de 0 selecionadas';
        return;
    }

    const fIdx = FRENTES_SEQUENCIA.indexOf(activeFrente);
    if (fIdx === -1) {
        container.classList.add('hidden');
        return;
    }

    // Get matching units (pending in this activeFrente on selected tower)
    const matchingUnits = projectState.units.filter(u => {
        if (u.tower !== tower) return false;
        const fData = u.frontsData[activeFrente] || {};
        const isDone = fData.concluido;
        const isActive = !isDone && u.activeFrontIndex === fIdx;
        return isActive;
    });

    if (matchingUnits.length === 0) {
        container.classList.add('hidden');
        grid.innerHTML = '';
        countSpan.textContent = '0 de 0 selecionadas';
        return;
    }

    container.classList.remove('hidden');

    // Get currently checked IDs to preserve them if user changes selection
    const checkedIds = new Set(
        Array.from(grid.querySelectorAll('.lote-unit-checkbox:checked')).map(cb => cb.value)
    );

    // If grid is empty or tower changed, default-check ALL
    const currentTowerInGrid = grid.dataset.tower;
    const wasEmpty = grid.children.length === 0 || currentTowerInGrid !== tower;
    grid.dataset.tower = tower;

    grid.innerHTML = '';

    matchingUnits.forEach(u => {
        const item = document.createElement('label');
        item.className = 'lote-unit-item';
        item.dataset.floor = u.floor;
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '8px';
        item.style.padding = '6px 10px';
        item.style.background = 'rgba(255,255,255,0.05)';
        item.style.border = '1px solid var(--border-color)';
        item.style.borderRadius = '6px';
        item.style.cursor = 'pointer';
        item.style.userSelect = 'none';
        item.style.fontSize = '0.85rem';

        const shouldBeChecked = wasEmpty ? true : checkedIds.has(u.id);

        item.innerHTML = `
            <input type="checkbox" class="lote-unit-checkbox" value="${u.id}" ${shouldBeChecked ? 'checked' : ''} style="cursor: pointer; width: 14px; height: 14px; accent-color: var(--primary-color);">
            <span style="color: var(--text-primary); font-weight: 500;">
                ${u.unit}
                <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">${u.floor}º Pav</span>
            </span>
        `;

        item.querySelector('.lote-unit-checkbox').addEventListener('change', updateLoteUnitsSelectedCount);

        grid.appendChild(item);
    });

    // Apply floor filter visibility
    filterLoteUnitsByFloor(floorStr);
    updateLoteUnitsSelectedCount();
}

function filterLoteUnitsByFloor(floorStr) {
    const grid = document.getElementById('lote-units-grid');
    if (!grid) return;
    const items = grid.querySelectorAll('.lote-unit-item');
    items.forEach(item => {
        if (floorStr === 'all' || item.dataset.floor === floorStr) {
            item.classList.remove('hidden');
            item.style.display = 'flex';
        } else {
            item.classList.add('hidden');
            item.style.display = 'none';
        }
    });
}

function updateLoteUnitsSelectedCount() {
    const grid = document.getElementById('lote-units-grid');
    const countSpan = document.getElementById('lote-units-selected-count');
    if (!grid || !countSpan) return;

    const total = grid.querySelectorAll('.lote-unit-checkbox').length;
    const checked = grid.querySelectorAll('.lote-unit-checkbox:checked').length;
    countSpan.textContent = `${checked} de ${total} selecionadas`;
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
    
    // Reset edit mode hidden flags
    document.getElementById('rep-edit-mode').value = "false";
    document.getElementById('rep-id').value = "";
    
    // Set default service type based on active front
    const activeFrontName = FRENTES_SEQUENCIA[u.activeFrontIndex] || "VQ";
    let matchedOption = "VQ";
    if (activeFrontName.includes("PISO") || activeFrontName.includes("Azulejo") || activeFrontName.includes("PISO CERAMICO / AZULEJO")) {
        matchedOption = "Piso";
    } else if (activeFrontName.includes("Rejunte")) {
        matchedOption = "Rejunte";
    } else if (activeFrontName.includes("Laminado") || activeFrontName.includes("PISO LAMINADO")) {
        matchedOption = "Laminado";
    } else if (activeFrontName.includes("Água") || activeFrontName.includes("Esgoto") || activeFrontName.includes("PRUMADA")) {
        matchedOption = "Hidráulica";
    } else if (activeFrontName.includes("cabo") || activeFrontName.includes("Disjuntores") || activeFrontName.includes("Elétrica")) {
        matchedOption = "Elétrica";
    } else if (activeFrontName.includes("Pintura") || activeFrontName.includes("PINTURA")) {
        matchedOption = "Pintura";
    } else if (activeFrontName.includes("Checklist") || activeFrontName.includes("Check list")) {
        matchedOption = "Check list";
    } else if (activeFrontName.includes("Limpeza") || activeFrontName.includes("LIMPEZA")) {
        matchedOption = "Limpeza";
    } else if (activeFrontName === "VQ") {
        matchedOption = "VQ";
    } else if (activeFrontName === "VA") {
        matchedOption = "VA";
    } else if (activeFrontName === "VH") {
        matchedOption = "VH";
    } else if (activeFrontName === "VE") {
        matchedOption = "VE";
    }
    document.getElementById('rep-servico-tipo').value = matchedOption;
    
    // Set today as default start date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('rep-data-inicio').value = `${yyyy}-${mm}-${dd}`;
    document.getElementById('rep-data-fim').value = "";

    // Reset submit button text
    const submitBtn = document.getElementById('form-add-reprova').querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa fa-triangle-exclamation"></i> Registrar Reprova`;
        submitBtn.className = 'btn btn-danger';
    }

    modalAddReprova.classList.remove('hidden');
}

function openEditReprovaModal(unitId, reprovaId) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;
    const r = u.reprovas.find(x => x.id === reprovaId);
    if (!r) return;

    document.getElementById('rep-unit-id').value = unitId;
    document.getElementById('modal-rep-unit-title').textContent = `${u.tower} - Apto ${u.unit} (Editar Reprova)`;
    document.getElementById('rep-edit-mode').value = "true";
    document.getElementById('rep-id').value = reprovaId;
    
    document.getElementById('rep-local').value = r.local || "";
    document.getElementById('rep-servico-tipo').value = r.servico || "";
    document.getElementById('rep-desc').value = r.descricao || "";
    document.getElementById('rep-resp').value = r.responsavel || "";
    
    document.getElementById('rep-exec-status').value = r.exec_status || "PENDENTE";
    document.getElementById('rep-dificuldade').value = r.dificuldade || "NORMAL";
    document.getElementById('rep-app-status').value = r.status_aprovacao || (r.status === 'Resolvido' ? 'APROVADO' : 'REPROVADO');
    
    document.getElementById('rep-data-inicio').value = convertDMYToYMD(r.data_inicio);
    document.getElementById('rep-data-fim').value = convertDMYToYMD(r.data_fim);
    
    document.getElementById('rep-mat-nome').value = r.material || "";
    document.getElementById('rep-mat-qtd').value = r.quantidade_material || "";
    document.getElementById('rep-mat-tipo').value = r.tipo_material || "";
    document.getElementById('rep-mat-subtipo').value = r.subtipo_material || "";

    // Set submit button style and text
    const submitBtn = document.getElementById('form-add-reprova').querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = `<i class="fa fa-floppy-disk"></i> Salvar Alterações`;
        submitBtn.className = 'btn btn-primary';
    }

    modalAddReprova.classList.remove('hidden');
}

function updateBulkWizardStep(step) {
    if (step < 1) step = 1;
    if (step > 13) step = 13;
    bulkWizardCurrentStep = step;

    // Show/Hide panels
    document.querySelectorAll('#modal-rep-sub-excel .wizard-step-panel').forEach(panel => {
        const panelStep = parseInt(panel.dataset.step);
        if (panelStep === bulkWizardCurrentStep) {
            panel.classList.remove('hidden');
        } else {
            panel.classList.add('hidden');
        }
    });

    // Update Indicators
    document.querySelectorAll('#modal-rep-sub-excel .wizard-step-indicator').forEach(ind => {
        const indStep = parseInt(ind.dataset.step);
        if (indStep === bulkWizardCurrentStep) {
            ind.classList.add('active');
        } else {
            ind.classList.remove('active');
        }
    });

    // Update Progress Text
    const progressText = document.getElementById('bulk-wizard-progress-text');
    if (progressText) {
        progressText.textContent = `Passo ${bulkWizardCurrentStep} de 13`;
    }

    // Update Buttons
    const btnPrev = document.getElementById('btn-bulk-prev');
    const btnNext = document.getElementById('btn-bulk-next');
    const btnSave = document.getElementById('btn-modal-rep-bulk-save');

    if (btnPrev) {
        if (bulkWizardCurrentStep === 1) {
            btnPrev.disabled = true;
            btnPrev.style.opacity = '0.5';
            btnPrev.style.pointerEvents = 'none';
        } else {
            btnPrev.disabled = false;
            btnPrev.style.opacity = '1';
            btnPrev.style.pointerEvents = 'auto';
        }
    }

    if (btnNext && btnSave) {
        if (bulkWizardCurrentStep === 13) {
            btnNext.classList.add('hidden');
            btnSave.classList.remove('hidden');
            btnSave.style.display = 'flex';
        } else {
            btnNext.classList.remove('hidden');
            btnSave.classList.add('hidden');
            btnSave.style.display = 'none';
        }
    }
}

function openBatchApprovalModal() {
    const modal = document.getElementById('modal-batch-approval');
    if (!modal) return;

    // Set default date to today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    document.getElementById('batch-approve-date').value = `${yyyy}-${mm}-${dd}`;

    // Set default responsible to currentUser name
    document.getElementById('batch-approve-resp').value = currentUser ? currentUser.name : '';

    // Reset tower select to 'all'
    const towerSelect = document.getElementById('batch-approve-tower-select');
    if (towerSelect) towerSelect.value = 'all';

    allUnitsSelected = false;
    allFrontsSelected = false;
    const btnAllUnits = document.getElementById('btn-batch-approve-select-all-units');
    if (btnAllUnits) btnAllUnits.textContent = 'Selecionar Todas';
    const btnAllFronts = document.getElementById('btn-batch-approve-select-all-fronts');
    if (btnAllFronts) btnAllFronts.textContent = 'Selecionar Todas';

    // Populate units and fronts lists
    populateBatchApproveUnitsList();
    populateBatchApproveFrontsList();

    modal.classList.remove('hidden');
}

function populateBatchApproveUnitsList() {
    const listContainer = document.getElementById('batch-approve-units-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const selectedTower = document.getElementById('batch-approve-tower-select').value;
    
    // Filter units based on tower selection
    const filteredUnits = projectState.units.filter(u => {
        if (selectedTower !== 'all' && u.tower !== selectedTower) return false;
        return true;
    });

    // Sort units by tower and unit number
    filteredUnits.sort((a, b) => {
        if (a.tower !== b.tower) return a.tower.localeCompare(b.tower);
        return a.unit.localeCompare(b.unit, undefined, { numeric: true });
    });

    filteredUnits.forEach(u => {
        const label = document.createElement('label');
        label.style.cssText = 'font-size: 0.75rem; display: flex; align-items: center; gap: 4px; padding: 4px; border: 1px solid var(--border-color); border-radius: 4px; background: var(--bg-card); cursor: pointer;';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'batch-approve-unit-cb';
        cb.value = u.id;
        cb.checked = allUnitsSelected;
        
        const span = document.createElement('span');
        span.textContent = `${u.tower} - ${u.unit}`;
        
        label.appendChild(cb);
        label.appendChild(span);
        listContainer.appendChild(label);
    });
}

function populateBatchApproveFrontsList() {
    const listContainer = document.getElementById('batch-approve-fronts-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    // Render checkbox for each front
    FRENTES_SEQUENCIA.forEach(f => {
        const label = document.createElement('label');
        label.style.cssText = 'font-size: 0.75rem; display: flex; align-items: center; gap: 6px; padding: 4px; cursor: pointer; color: var(--text-primary);';
        
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'batch-approve-front-cb';
        cb.value = f;
        cb.checked = allFrontsSelected;
        
        const span = document.createElement('span');
        span.textContent = f;
        
        label.appendChild(cb);
        label.appendChild(span);
        listContainer.appendChild(label);
    });
}

let allUnitsSelected = false;
function toggleSelectAllUnits() {
    const cbs = document.querySelectorAll('.batch-approve-unit-cb');
    allUnitsSelected = !allUnitsSelected;
    cbs.forEach(cb => cb.checked = allUnitsSelected);
    
    const btn = document.getElementById('btn-batch-approve-select-all-units');
    if (btn) {
        btn.textContent = allUnitsSelected ? 'Desmarcar Todas' : 'Selecionar Todas';
    }
}

let allFrontsSelected = false;
function toggleSelectAllFronts() {
    const cbs = document.querySelectorAll('.batch-approve-front-cb');
    allFrontsSelected = !allFrontsSelected;
    cbs.forEach(cb => cb.checked = allFrontsSelected);

    const btn = document.getElementById('btn-batch-approve-select-all-fronts');
    if (btn) {
        btn.textContent = allFrontsSelected ? 'Desmarcar Todas' : 'Selecionar Todas';
    }
}

async function handleBatchApproveSubmit(e) {
    e.preventDefault();

    // Get selected units
    const selectedUnitCbs = document.querySelectorAll('.batch-approve-unit-cb:checked');
    const selectedUnitIds = Array.from(selectedUnitCbs).map(cb => cb.value);

    // Get selected fronts
    const selectedFrontCbs = document.querySelectorAll('.batch-approve-front-cb:checked');
    const selectedFrontNames = Array.from(selectedFrontCbs).map(cb => cb.value);

    if (selectedUnitIds.length === 0) {
        alert("Por favor, selecione ao menos uma unidade.");
        return;
    }
    if (selectedFrontNames.length === 0) {
        alert("Por favor, selecione ao menos uma frente de serviço.");
        return;
    }

    const rawDate = document.getElementById('batch-approve-date').value;
    const formattedDate = convertYMDToDMY(rawDate) || new Date().toLocaleDateString('pt-BR');
    const responsavel = document.getElementById('batch-approve-resp').value.trim() || "Engenharia";

    let approvedCount = 0;

    selectedUnitIds.forEach(uId => {
        const u = projectState.units.find(x => x.id === uId);
        if (!u) return;

        selectedFrontNames.forEach(fName => {
            if (!u.frontsData[fName]) {
                u.frontsData[fName] = {
                    responsavel: "",
                    dataInicio: "",
                    dataFinal: "",
                    duracaoProj: 0,
                    duracaoReal: 0,
                    concluido: false,
                    materials: {}
                };
            }

            const fData = u.frontsData[fName];
            fData.concluido = true;
            fData.responsavel = responsavel;
            fData.dataFinal = formattedDate;

            // If the front is VA, set status_va to APROVADO
            if (fName === 'VA') {
                u.status_va = 'APROVADO';
            }
            approvedCount++;
        });

        // Recalculate activeFrontIndex sequentially
        let newIndex = 0;
        for (let i = 0; i < FRENTES_SEQUENCIA.length; i++) {
            const f = FRENTES_SEQUENCIA[i];
            if (u.frontsData[f] && u.frontsData[f].concluido) {
                newIndex = i + 1;
            } else {
                break;
            }
        }
        u.activeFrontIndex = newIndex;

        // Update general status
        if (u.activeFrontIndex === FRENTES_SEQUENCIA.length) {
            u.status_geral = 'Aprovado';
        } else {
            const hasPending = u.reprovas && u.reprovas.some(r => r.status === 'Pendente');
            u.status_geral = hasPending ? 'Reprovado' : 'Ativo';
        }
    });

    await saveState();

    const modal = document.getElementById('modal-batch-approval');
    if (modal) modal.classList.add('hidden');

    alert(`Aprovação em lote realizada com sucesso! Foram aprovados ${approvedCount} serviços.`);

    // Refresh active page
    if (activePage === 'page-mapa') {
        renderSummaryStats();
        renderTowers();
    } else if (activePage === 'page-frentes') {
        renderFrentesSubtabs();
        renderFrenteDetails();
    }
}

async function handleBulkReprovasSave() {
    const modalUnitTitleEl = document.getElementById('modal-unit-title');
    const unitId = modalUnitTitleEl.dataset.unitId;
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;
    
    const descs = document.getElementById('bulk-rep-desc').value.split('\n').map(x => x.trim()).filter(x => x !== '');
    if (descs.length === 0) {
        alert("Por favor, preencha a coluna de Descrições das Reprovas.");
        return;
    }
    
    const locals = document.getElementById('bulk-rep-local').value.split('\n').map(x => x.trim());
    const servicos = document.getElementById('bulk-rep-servico').value.split('\n').map(x => x.trim());
    const resps = document.getElementById('bulk-rep-resp').value.split('\n').map(x => x.trim());
    const execs = document.getElementById('bulk-rep-exec').value.split('\n').map(x => x.trim());
    const dificults = document.getElementById('bulk-rep-dificuldade').value.split('\n').map(x => x.trim());
    const apps = document.getElementById('bulk-rep-app').value.split('\n').map(x => x.trim());
    const datesInicio = document.getElementById('bulk-rep-data-inicio').value.split('\n').map(x => x.trim());
    const datesFim = document.getElementById('bulk-rep-data-fim').value.split('\n').map(x => x.trim());
    
    const matNomes = document.getElementById('bulk-rep-mat-nome').value.split('\n').map(x => x.trim());
    const matQtds = document.getElementById('bulk-rep-mat-qtd').value.split('\n').map(x => x.trim());
    const matTipos = document.getElementById('bulk-rep-mat-tipo').value.split('\n').map(x => x.trim());
    const matSubtipos = document.getElementById('bulk-rep-mat-subtipo').value.split('\n').map(x => x.trim());
    
    const activeFrontName = FRENTES_SEQUENCIA[u.activeFrontIndex] || "VQ";
    let count = 0;
    
    const totalRows = Math.min(100, descs.length);
    
    function cleanExcelPlaceholder(val) {
        if (!val) return "";
        const trimmed = val.trim();
        if (trimmed.toLowerCase() === "x") return "";
        return trimmed;
    }
    
    function formatPastedDate(dStr) {
        const clean = cleanExcelPlaceholder(dStr);
        if (!clean) return "";
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) return clean;
        if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
            const parts = clean.split('-');
            return `${parts[2]}/${parts[1]}/${parts[0]}`;
        }
        return clean;
    }
    
    for (let i = 0; i < totalRows; i++) {
        const desc = cleanExcelPlaceholder(descs[i]);
        if (!desc) continue;
        
        const local = cleanExcelPlaceholder(locals[i]) || "Apartamento";
        const servico = cleanExcelPlaceholder(servicos[i]) || activeFrontName;
        const resp = cleanExcelPlaceholder(resps[i]) || "Equipe Qualidade";
        const execStatus = (cleanExcelPlaceholder(execs[i]) || "PENDENTE").toUpperCase();
        const difficulty = (cleanExcelPlaceholder(dificults[i]) || "NORMAL").toUpperCase();
        const appStatus = (cleanExcelPlaceholder(apps[i]) || "REPROVADO").toUpperCase();
        
        let dInicio = formatPastedDate(datesInicio[i]);
        if (!dInicio) {
            dInicio = new Date().toLocaleDateString('pt-BR');
        }
        
        let dFim = formatPastedDate(datesFim[i]);
        if (appStatus === 'APROVADO' && !dFim) {
            dFim = new Date().toLocaleDateString('pt-BR');
        }
        
        const matNome = cleanExcelPlaceholder(matNomes[i]);
        const matQtd = cleanExcelPlaceholder(matQtds[i]);
        const matTipo = cleanExcelPlaceholder(matTipos[i]);
        const matSubtipo = cleanExcelPlaceholder(matSubtipos[i]);
        
        const reprovaItem = {
            id: uuidv4(),
            servico: servico,
            local: local,
            descricao: desc,
            material: matNome,
            tipo_material: matTipo,
            subtipo_material: matSubtipo,
            quantidade_material: matQtd,
            responsavel: resp,
            status: appStatus === 'APROVADO' ? 'Resolvido' : 'Pendente',
            data_inicio: dInicio,
            data_fim: dFim,
            exec_status: execStatus,
            dificuldade: difficulty,
            status_aprovacao: appStatus
        };
        
        u.reprovas.push(reprovaItem);
        count++;
    }
    
    // Check quality front advancement (VQ/VA)
    checkAndAdvanceQualityFront(u, activeFrontName);
    
    await saveState();
    
    alert(`${count} reprova(s) cadastrada(s) em lote com sucesso!`);
    
    // Clear fields
    document.getElementById('bulk-rep-desc').value = '';
    document.getElementById('bulk-rep-local').value = '';
    document.getElementById('bulk-rep-servico').value = '';
    document.getElementById('bulk-rep-resp').value = '';
    document.getElementById('bulk-rep-exec').value = '';
    document.getElementById('bulk-rep-dificuldade').value = '';
    document.getElementById('bulk-rep-app').value = '';
    document.getElementById('bulk-rep-data-inicio').value = '';
    document.getElementById('bulk-rep-data-fim').value = '';
    document.getElementById('bulk-rep-mat-nome').value = '';
    document.getElementById('bulk-rep-mat-qtd').value = '';
    document.getElementById('bulk-rep-mat-tipo').value = '';
    document.getElementById('bulk-rep-mat-subtipo').value = '';
    
    // Refresh modal and view
    openUnitDetailsModal(u.id);
    
    if (activePage === 'page-frentes') {
        renderFrenteDetails();
    } else if (activePage === 'page-reprovas') {
        renderReprovasPage();
    } else if (activePage === 'page-mapa') {
        renderSummaryStats();
        renderTowers();
    }
}

function checkAndAdvanceQualityFront(unit, frontName) {
    if (frontName !== 'VH' && frontName !== 'VE' && frontName !== 'VQ' && frontName !== 'VA') return;
    
    // If the unit's active front is not this front, do nothing
    const activeFrontName = FRENTES_SEQUENCIA[unit.activeFrontIndex];
    if (activeFrontName !== frontName) return;
    
    // Check if there are any pending reprovas for this front
    const hasPending = unit.reprovas.some(r => r.servico === frontName && r.status === 'Pendente');
    
    if (!hasPending) {
        // Mark the current quality front as NOT concluded (requires manual approval/signature)
        if (!unit.frontsData[frontName]) {
            unit.frontsData[frontName] = {};
        }
        const fData = unit.frontsData[frontName];
        fData.concluido = false;
        
        // Reset manual status to LIBERADO so it returns to being inspectable
        if (frontName === 'VA') unit.status_va = 'LIBERADO';
        else if (frontName === 'VQ') unit.status_vq = 'LIBERADO';
        else if (frontName === 'VH') unit.status_vh = 'LIBERADO';
        else if (frontName === 'VE') unit.status_ve = 'LIBERADO';
        
        // Update general status
        unit.status_geral = 'Ativo';
    } else {
        // If there are pending reprovas, the unit status must be "Reprovado"
        unit.status_geral = 'Reprovado';
        if (unit.frontsData[frontName]) {
            unit.frontsData[frontName].concluido = false;
        }
        if (frontName === 'VA') unit.status_va = 'REPROVADO';
        else if (frontName === 'VQ') unit.status_vq = 'REPROVADO';
        else if (frontName === 'VH') unit.status_vh = 'REPROVADO';
        else if (frontName === 'VE') unit.status_ve = 'REPROVADO';
    }
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

    const execStatus = document.getElementById('rep-exec-status').value;
    const dificuldade = document.getElementById('rep-dificuldade').value;
    const appStatus = document.getElementById('rep-app-status').value;

    const isEdit = document.getElementById('rep-edit-mode').value === 'true';
    const repId = document.getElementById('rep-id').value;

    const activeFrontName = FRENTES_SEQUENCIA[u.activeFrontIndex] || "VQ";

    const servicoTipo = document.getElementById('rep-servico-tipo').value;
    const dataInicioYMD = document.getElementById('rep-data-inicio').value;
    const dataFimYMD = document.getElementById('rep-data-fim').value;

    const dataInicio = convertYMDToDMY(dataInicioYMD) || new Date().toLocaleDateString('pt-BR');
    let dataFim = convertYMDToDMY(dataFimYMD);
    if (appStatus === 'APROVADO' && !dataFim) {
        dataFim = new Date().toLocaleDateString('pt-BR');
    }

    if (isEdit) {
        const r = u.reprovas.find(x => x.id === repId);
        if (r) {
            r.local = local;
            r.descricao = desc;
            r.responsavel = resp;
            r.material = matNome || "";
            r.tipo_material = matNome ? matTipo : "";
            r.subtipo_material = matNome ? matSub : "";
            r.quantidade_material = matNome ? matQtdVal : "";
            r.exec_status = execStatus;
            r.dificuldade = dificuldade;
            r.status_aprovacao = appStatus;
            r.servico = servicoTipo || r.servico || activeFrontName;
            r.data_inicio = dataInicio;
            
            if (appStatus === 'APROVADO') {
                r.status = 'Resolvido';
                r.data_fim = dataFim || new Date().toLocaleDateString('pt-BR');
            } else {
                r.status = 'Pendente';
                r.data_fim = dataFim;
            }
        }
    } else {
        // Create the reproval item
        const newRep = {
            id: uuidv4(),
            descricao: desc,
            responsavel: resp,
            data_inicio: dataInicio,
            data_fim: dataFim,
            servico: servicoTipo || activeFrontName,
            local: local,
            status: appStatus === 'APROVADO' ? 'Resolvido' : 'Pendente',
            material: matNome || "",
            tipo_material: matNome ? matTipo : "",
            subtipo_material: matNome ? matSub : "",
            quantidade_material: matNome ? matQtdVal : "",
            exec_status: execStatus,
            dificuldade: dificuldade,
            status_aprovacao: appStatus
        };

        u.reprovas.push(newRep);
    }

    // Check quality front advancement (VQ/VA)
    checkAndAdvanceQualityFront(u, activeFrontName);

    saveState();
    modalAddReprova.classList.add('hidden');
    
    // Refresh page data
    if (activePage === 'page-frentes') {
        renderFrenteDetails();
    } else if (activePage === 'page-reprovas') {
        renderReprovasPage();
    } else if (activePage === 'page-mapa') {
        renderSummaryStats();
        renderTowers();
    } else {
        openUnitDetailsModal(unitId);
    }
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

// -------------------------------------------------------------
// RELATÓRIO DE PLANEJAMENTO SEMANAL (METAS E ABASTECIMENTO)
// -------------------------------------------------------------

function initWeeklyPlanningListeners() {
    const repRepTower = document.getElementById('rep-rep-tower');
    const repRepDate = document.getElementById('rep-rep-date');
    const btnMeta = document.getElementById('btn-export-meta-semana');
    const btnAbast = document.getElementById('btn-export-abast-semana');
    const formEditMat = document.getElementById('form-edit-rep-materials');

    if (repRepTower) {
        repRepTower.addEventListener('change', renderWeeklyPlanningReport);
    }
    if (repRepDate) {
        repRepDate.addEventListener('change', renderWeeklyPlanningReport);
    }
    if (btnMeta) {
        btnMeta.addEventListener('click', exportWeeklyGoals);
    }
    if (btnAbast) {
        btnAbast.addEventListener('click', exportWeeklySupply);
    }
    if (formEditMat) {
        formEditMat.addEventListener('submit', handleSaveWeeklyMaterials);
    }

    // Modal close buttons
    const modalEditMat = document.getElementById('modal-edit-rep-materials');
    if (modalEditMat) {
        modalEditMat.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                modalEditMat.classList.add('hidden');
            });
        });
    }
}

function getProjectionsMapForService(serviceName) {
    const fConfig = projectState.frentesConfig[serviceName] || { dataInicio: "2026-06-08", capacidadeDia: 2 };
    const dataInicio = fConfig.dataInicio || "2026-06-08";
    
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
    
    return projectionsMap;
}

function parseDateBR(str) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length === 3) {
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    const ymd = str.split('-');
    if (ymd.length === 3) {
        return new Date(ymd[0], ymd[1] - 1, ymd[2]);
    }
    return null;
}

function formatDateBRDate(date) {
    if (!date) return "-";
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function getUnitFrontExpectedDate(unit, frenteName, allProjections) {
    const fData = unit.frontsData[frenteName] || {};
    if (fData.concluido) {
        return parseDateBR(fData.dataFinal);
    }
    const projMap = allProjections[frenteName] || {};
    const projDateStr = projMap[unit.id];
    if (projDateStr) {
        return parseDateBR(convertDMYToYMD(projDateStr)) || parseDateBR(projDateStr);
    }
    return null;
}

function getMaterialsForUnitFront(unit, frenteName) {
    if (!unit) return [];
    const fData = unit.frontsData[frenteName] || {};
    let materialsList = getMaterialsList(fData);

    // If unit is on floor > 1 and has no materials, try to inherit from ground floor (floor 1)
    if (materialsList.length === 0 && unit.floor > 1) {
        const col = unit.unit.slice(-2);
        const terreoUnit = projectState.units.find(u => u.tower === unit.tower && u.floor === 1 && u.unit.slice(-2) === col);
        if (terreoUnit) {
            const tData = terreoUnit.frontsData[frenteName] || {};
            materialsList = getMaterialsList(tData).map(m => ({
                ...m,
                herdado: true,
                terreoUnit: terreoUnit.unit
            }));
        }
    }
    return materialsList;
}

function renderWeeklyPlanningReport() {
    const towerSelect = document.getElementById('rep-rep-tower');
    const dateInput = document.getElementById('rep-rep-date');
    const layoutContainer = document.getElementById('rep-tower-layout-container');
    const grid = document.getElementById('rep-tower-grid');
    const alertsContainer = document.getElementById('rep-alerts-container');
    const alertsList = document.getElementById('rep-alerts-list');

    // New columns DOM elements
    const schedContainer = document.getElementById('rep-schedule-columns-container');
    const supplyContainer = document.getElementById('rep-supply-columns-container');
    const schedLastWeek = document.getElementById('rep-schedule-last-week');
    const schedThisWeek = document.getElementById('rep-schedule-this-week');
    const schedNextWeek = document.getElementById('rep-schedule-next-week');
    const supplyLastWeek = document.getElementById('rep-supply-last-week');
    const supplyThisWeek = document.getElementById('rep-supply-this-week');
    const supplyNextWeek = document.getElementById('rep-supply-next-week');

    if (!towerSelect || !dateInput || !layoutContainer || !grid || !alertsContainer || !alertsList) return;

    // Populate/repopulate planning report tower options if they don't match projectState.towers
    const currentTowerOptions = Array.from(towerSelect.options).map(o => o.value).filter(Boolean);
    const expectedTowerNames = projectState ? projectState.towers.map(t => t.name) : [];
    
    // Check if current options match expected tower names
    const needsRepopulate = currentTowerOptions.length !== expectedTowerNames.length ||
                            !currentTowerOptions.every(name => expectedTowerNames.includes(name));

    if (needsRepopulate && projectState) {
        towerSelect.innerHTML = '<option value="">Selecione...</option>';
        projectState.towers.forEach(t => {
            const opt = document.createElement('option');
            opt.value = t.name;
            opt.textContent = t.name;
            towerSelect.appendChild(opt);
        });
        
        if (projectState.towers.length > 0) {
            towerSelect.value = projectState.towers[0].name;
        }
    }

    // Set default date for planning date to today if empty
    if (!dateInput.value) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const towerName = towerSelect.value;
    if (!towerName) {
        layoutContainer.classList.add('hidden');
        alertsContainer.classList.add('hidden');
        if (schedContainer) schedContainer.classList.add('hidden');
        if (supplyContainer) supplyContainer.classList.add('hidden');
        grid.innerHTML = '';
        alertsList.innerHTML = '';
        if (schedLastWeek) schedLastWeek.innerHTML = '';
        if (schedThisWeek) schedThisWeek.innerHTML = '';
        if (schedNextWeek) schedNextWeek.innerHTML = '';
        if (supplyLastWeek) supplyLastWeek.innerHTML = '';
        if (supplyThisWeek) supplyThisWeek.innerHTML = '';
        if (supplyNextWeek) supplyNextWeek.innerHTML = '';
        return;
    }

    layoutContainer.classList.remove('hidden');
    alertsContainer.classList.remove('hidden');
    if (schedContainer) schedContainer.classList.remove('hidden');
    if (supplyContainer) supplyContainer.classList.remove('hidden');

    const refDate = new Date(dateInput.value + 'T12:00:00');
    
    // Calculate week start and end
    const lastWeekStart = new Date(refDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const upcomingWeekEnd = new Date(refDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Build projections cache for all fronts
    const allProjections = {};
    FRENTES_SEQUENCIA.forEach(f => {
        allProjections[f] = getProjectionsMapForService(f);
    });

    // 1. Render Tower Figure (Esquema de Torre)
    grid.innerHTML = '';
    const towerObj = projectState.towers.find(t => t.name === towerName);
    const totalFloors = towerObj ? (towerObj.floors || 12) : 12;

    // Filter units of selected tower
    const towerUnits = projectState.units.filter(u => u.tower === towerName);

    // Loop floors from top to bottom (térreo)
    for (let f = totalFloors; f >= 1; f--) {
        const row = document.createElement('div');
        row.className = 'rep-tower-row';

        const label = document.createElement('div');
        label.className = 'rep-tower-label';
        label.textContent = f === 1 ? 'Térreo (Pav 1)' : `${f}º Pavimento`;
        row.appendChild(label);

        const cellsContainer = document.createElement('div');
        cellsContainer.className = 'rep-tower-cells';

        // Check if this tower has any halls on this floor
        const hasHallOnThisFloor = towerUnits.some(unit => unit.floor === f && unit.isHall);
        
        let unitsOrder = [];
        if (hasHallOnThisFloor) {
            // Cittá Splendore/Chapada layout: 1 to 4, Hall, 5 to 8
            for (let u = 1; u <= 4; u++) {
                unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
            }
            const hallUnit = towerUnits.find(unit => unit.floor === f && unit.isHall);
            if (hallUnit) {
                unitsOrder.push(hallUnit.unit);
            } else {
                unitsOrder.push(`${f} Hall`);
            }
            for (let u = 5; u <= 8; u++) {
                unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
            }
        } else {
            for (let u = 1; u <= (towerObj ? towerObj.unitsPerFloor : 8); u++) {
                unitsOrder.push(`${f}` + String(u).padStart(2, '0'));
            }
        }

        cellsContainer.style.display = 'grid';
        cellsContainer.style.gridTemplateColumns = `repeat(${unitsOrder.length}, 1fr)`;
        cellsContainer.style.gap = '4px';
        cellsContainer.style.flex = '1';

        unitsOrder.forEach(unitNum => {
            const u = towerUnits.find(unit => unit.unit == unitNum && unit.floor == f);
            if (!u) return;

            const cell = document.createElement('div');
            cell.className = 'rep-tower-cell';
            
            // Format name/appearance for display
            const displayText = u.unit;
            cell.textContent = displayText;
            cell.dataset.unitId = u.id;
            if (u.isHall) {
                cell.classList.add('hall-cell');
            }

            // Determine cell status for color coding
            let statusClass = 'alert-none';
            
            // Check if any service was executed in the last week
            let hasExecutedLastWeek = false;
            let hasUrgentAlert = false;
            let hasModerateAlert = false;

            FRENTES_SEQUENCIA.forEach(frente => {
                const fData = u.frontsData[frente] || {};
                const expectedDate = getUnitFrontExpectedDate(u, frente, allProjections);
                if (expectedDate) {
                    if (fData.concluido) {
                        if (expectedDate >= lastWeekStart && expectedDate <= refDate) {
                            hasExecutedLastWeek = true;
                        }
                    } else {
                        // Pending. Find projected start date
                        const fConfig = projectState.frentesConfig[frente] || {};
                        const cap = parseFloat(fConfig.capacidadeDia) || 1;
                        let duration = 1 / cap;
                        if (fData.duracaoProj && parseFloat(fData.duracaoProj) > 0) {
                            duration = parseFloat(fData.duracaoProj);
                        }
                        const startDate = new Date(expectedDate.getTime() - duration * 24 * 60 * 60 * 1000);
                        const daysDiff = (startDate.getTime() - refDate.getTime()) / (24 * 60 * 60 * 1000);
                        
                        if (daysDiff >= 0 && daysDiff <= 7) {
                            if (daysDiff <= 2) {
                                hasUrgentAlert = true;
                            } else if (daysDiff <= 5) {
                                hasModerateAlert = true;
                            }
                        }
                    }
                }
            });

            if (hasUrgentAlert) statusClass = 'alert-urgent';
            else if (hasModerateAlert) statusClass = 'alert-moderate';
            else if (hasExecutedLastWeek) statusClass = 'executed';

            cell.classList.add(statusClass);

            cell.addEventListener('click', () => {
                openEditPlanningMaterialsModal(u.id);
            });

            cellsContainer.appendChild(cell);
        });

        row.appendChild(cellsContainer);
        grid.appendChild(row);
    }

    // 2. Generate Alerts List
    alertsList.innerHTML = '';
    let alertCount = 0;

    towerUnits.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            if (fData.concluido) return;

            const expectedDate = getUnitFrontExpectedDate(u, frente, allProjections);
            if (!expectedDate) return;

            const fConfig = projectState.frentesConfig[frente] || {};
            const cap = parseFloat(fConfig.capacidadeDia) || 1;
            let duration = 1 / cap;
            if (fData.duracaoProj && parseFloat(fData.duracaoProj) > 0) {
                duration = parseFloat(fData.duracaoProj);
            }
            const startDate = new Date(expectedDate.getTime() - duration * 24 * 60 * 60 * 1000);
            const daysDiff = (startDate.getTime() - refDate.getTime()) / (24 * 60 * 60 * 1000);

            if (daysDiff >= 0 && daysDiff <= 5) {
                alertCount++;
                const isUrgent = daysDiff <= 2;
                const limitDate = new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000);

                const alertItem = document.createElement('div');
                alertItem.className = `rep-alert-item ${isUrgent ? 'urgent' : 'moderate'}`;
                alertItem.innerHTML = `
                    <i class="fa ${isUrgent ? 'fa-triangle-exclamation text-danger' : 'fa-circle-exclamation text-warning'}" style="font-size: 1.1rem;"></i>
                    <div style="flex: 1;">
                        <strong>Apto ${u.unit}</strong> - Frente <strong>${frente}</strong> inicia em <strong>${formatDateBRDate(startDate)}</strong> (${Math.ceil(daysDiff)} dias).
                        <span style="display: block; font-size: 0.75rem; color: var(--text-secondary);">
                            Prazo limite para abastecer material: <strong class="${isUrgent ? 'text-danger' : 'text-warning'}">${formatDateBRDate(limitDate)}</strong> (2 a 5 dias antes).
                        </span>
                    </div>
                `;
                alertsList.appendChild(alertItem);
            }
        });
    });

    if (alertCount === 0) {
        alertsList.innerHTML = `
            <div class="empty-state" style="padding: 1.5rem 0;">
                <i class="fa fa-circle-check text-success"></i>
                <p>Nenhum alerta de abastecimento para esta semana.</p>
            </div>
        `;
    }

    // Populate Schedule and Supply Columns
    const refTime = refDate.getTime();
    const lastWeekTime = lastWeekStart.getTime();
    const thisWeekEndTime = refTime + 7 * 24 * 60 * 60 * 1000;
    const nextWeekEndTime = refTime + 14 * 24 * 60 * 60 * 1000;

    // Lists of items to show
    const schedLastItems = [];
    const schedThisItems = [];
    const schedNextItems = [];

    const supplyLastItems = [];
    const supplyThisItems = [];
    const supplyNextItems = [];

    towerUnits.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            const expectedDate = getUnitFrontExpectedDate(u, frente, allProjections);
            if (!expectedDate) return;

            const expectedTime = expectedDate.getTime();
            const color = FRENTES_CORES[frente] || '#ccc';

            if (fData.concluido) {
                // Executed Last Week
                if (expectedTime >= lastWeekTime && expectedTime < refTime) {
                    schedLastItems.push({
                        unit: u.unit,
                        floor: u.floor,
                        frente: frente,
                        color: color,
                        dateStr: fData.dataFinal || formatDateBRDate(expectedDate)
                    });

                    const materials = getMaterialsForUnitFront(u, frente);
                    if (materials.length > 0) {
                        supplyLastItems.push({
                            unit: u.unit,
                            floor: u.floor,
                            frente: frente,
                            color: color,
                            materials: materials
                        });
                    }
                }
            } else {
                // Pending - This Week
                if (expectedTime >= refTime && expectedTime < thisWeekEndTime) {
                    schedThisItems.push({
                        unit: u.unit,
                        floor: u.floor,
                        frente: frente,
                        color: color,
                        dateStr: formatDateBRDate(expectedDate)
                    });

                    const materials = getMaterialsForUnitFront(u, frente);
                    if (materials.length > 0) {
                        supplyThisItems.push({
                            unit: u.unit,
                            floor: u.floor,
                            frente: frente,
                            color: color,
                            materials: materials
                        });
                    }
                }
                // Pending - Next Week
                else if (expectedTime >= thisWeekEndTime && expectedTime < nextWeekEndTime) {
                    schedNextItems.push({
                        unit: u.unit,
                        floor: u.floor,
                        frente: frente,
                        color: color,
                        dateStr: formatDateBRDate(expectedDate)
                    });

                    const materials = getMaterialsForUnitFront(u, frente);
                    if (materials.length > 0) {
                        supplyNextItems.push({
                            unit: u.unit,
                            floor: u.floor,
                            frente: frente,
                            color: color,
                            materials: materials
                        });
                    }
                }
            }
        });
    });

    // Sort helper: by floor (descending) then unit
    const sortUnits = (a, b) => b.floor - a.floor || a.unit.localeCompare(b.unit);

    // Helper to render schedule item card
    const createScheduleCard = (item, badgeClass, badgeText) => {
        const div = document.createElement('div');
        div.className = 'rep-item-card';
        div.style.borderLeftColor = item.color;
        div.innerHTML = `
            <div class="rep-item-header">
                <span class="rep-item-title">${item.unit.includes('Hall') ? item.unit : `Apto ${item.unit}`}</span>
                <span class="rep-item-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="rep-item-subtitle" style="font-weight: 500; color: var(--text-primary);">${item.frente}</div>
            <div class="rep-item-details">
                <span><i class="fa fa-calendar-day" style="opacity: 0.7; margin-right: 4px;"></i> Data: <strong>${item.dateStr}</strong></span>
            </div>
        `;
        return div;
    };

    // Helper to render supply item card
    const createSupplyCard = (item, badgeClass, badgeText) => {
        const div = document.createElement('div');
        div.className = 'rep-item-card';
        div.style.borderLeftColor = item.color;

        let materialsHtml = '';
        item.materials.forEach(m => {
            let note = '';
            if (m.herdado) {
                note = ` <span class="text-muted" style="font-size: 0.75rem; color: #a855f7 !important;" title="Herdado do Térreo (Apto ${m.terreoUnit})"><i class="fa fa-lightbulb"></i></span>`;
            } else if (m.observacao && m.observacao.includes('Kit')) {
                note = ` <span class="text-muted" style="font-size: 0.75rem; color: #fbbf24 !important;" title="Customização Kit Exclusivita"><i class="fa fa-gem"></i></span>`;
            }
            materialsHtml += `
                <li style="margin-bottom: 4px; line-height: 1.2;">
                    <strong>${m.quantidade}</strong> ${m.tipo || ''} - ${m.material}${note}
                    ${m.subtipo ? `<span style="display: block; font-size: 0.7rem; opacity: 0.7; padding-left: 4px;">${m.subtipo}</span>` : ''}
                </li>
            `;
        });

        div.innerHTML = `
            <div class="rep-item-header">
                <span class="rep-item-title">${item.unit.includes('Hall') ? item.unit : `Apto ${item.unit}`}</span>
                <span class="rep-item-badge ${badgeClass}">${badgeText}</span>
            </div>
            <div class="rep-item-subtitle" style="font-weight: 500; color: var(--text-primary);">${item.frente}</div>
            <div class="rep-item-details" style="margin-top: 4px;">
                <ul style="margin: 0; padding-left: 14px; font-size: 0.8rem; color: var(--text-primary);">
                    ${materialsHtml}
                </ul>
            </div>
        `;
        return div;
    };

    // Populate DOM
    // Clear list columns
    schedLastWeek.innerHTML = '';
    schedThisWeek.innerHTML = '';
    schedNextWeek.innerHTML = '';
    supplyLastWeek.innerHTML = '';
    supplyThisWeek.innerHTML = '';
    supplyNextWeek.innerHTML = '';

    // 1. Schedule
    if (schedLastItems.length === 0) {
        schedLastWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhuma frente concluída.</p></div>';
    } else {
        schedLastItems.sort(sortUnits);
        schedLastItems.forEach(item => {
            schedLastWeek.appendChild(createScheduleCard(item, 'badge-concluido', 'Executado'));
        });
    }

    if (schedThisItems.length === 0) {
        schedThisWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhuma frente planejada.</p></div>';
    } else {
        schedThisItems.sort(sortUnits);
        schedThisItems.forEach(item => {
            schedThisWeek.appendChild(createScheduleCard(item, 'badge-andamento', 'A Executar'));
        });
    }

    if (schedNextItems.length === 0) {
        schedNextWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhuma previsão.</p></div>';
    } else {
        schedNextItems.sort(sortUnits);
        schedNextItems.forEach(item => {
            schedNextWeek.appendChild(createScheduleCard(item, 'badge-previsto', 'Previsão'));
        });
    }

    // 2. Supply
    if (supplyLastItems.length === 0) {
        supplyLastWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhum material abastecido.</p></div>';
    } else {
        supplyLastItems.sort(sortUnits);
        supplyLastItems.forEach(item => {
            supplyLastWeek.appendChild(createSupplyCard(item, 'badge-concluido', 'Abastecido'));
        });
    }

    if (supplyThisItems.length === 0) {
        supplyThisWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhum material a abastecer.</p></div>';
    } else {
        supplyThisItems.sort(sortUnits);
        supplyThisItems.forEach(item => {
            supplyThisWeek.appendChild(createSupplyCard(item, 'badge-andamento', 'A Abastecer'));
        });
    }

    if (supplyNextItems.length === 0) {
        supplyNextWeek.innerHTML = '<div class="empty-state" style="padding: 1rem 0; font-size: 0.8rem;"><p>Nenhuma previsão.</p></div>';
    } else {
        supplyNextItems.sort(sortUnits);
        supplyNextItems.forEach(item => {
            supplyNextWeek.appendChild(createSupplyCard(item, 'badge-previsto', 'Previsão'));
        });
    }
}

function openEditPlanningMaterialsModal(unitId) {
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    document.getElementById('modal-edit-rep-unit-name').textContent = u.unit;
    document.getElementById('modal-edit-rep-unit-id').value = u.id;

    const listContainer = document.getElementById('modal-edit-rep-materials-list');
    listContainer.innerHTML = '';

    // Show materials for active front and quality fronts (VH, VE, VQ, VA)
    const activeFrontName = FRENTES_SEQUENCIA[u.activeFrontIndex] || 'VQ';
    const frontsToShow = Array.from(new Set([activeFrontName, 'VH', 'VE', 'VQ', 'VA']));

    frontsToShow.forEach(frenteName => {
        const fData = u.frontsData[frenteName] || {};
        const materials = getMaterialsForUnitFront(u, frenteName);

        const group = document.createElement('div');
        group.style.border = '1px solid var(--border-color)';
        group.style.borderRadius = '6px';
        group.style.padding = '10px';
        group.style.background = 'rgba(0,0,0,0.1)';

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '8px';
        header.style.borderBottom = '1px solid var(--border-color)';
        header.style.paddingBottom = '4px';

        header.innerHTML = `
            <strong style="color: var(--primary-color); font-size: 0.9rem;">${frenteName}</strong>
            <button type="button" class="btn btn-outline btn-xs btn-add-editor-material" data-frente="${frenteName}">
                <i class="fa fa-plus"></i> Insumo
            </button>
        `;

        group.appendChild(header);

        const rowsContainer = document.createElement('div');
        rowsContainer.className = 'editor-rows-container';
        rowsContainer.dataset.frente = frenteName;

        const renderRows = () => {
            rowsContainer.innerHTML = '';
            if (materials.length === 0) {
                rowsContainer.innerHTML = '<span class="text-muted" style="font-size: 0.8rem; padding: 4px 0; display: block;">Nenhum insumo planejado.</span>';
                return;
            }

            materials.forEach((m, idx) => {
                const row = document.createElement('div');
                row.className = 'material-editor-row';
                row.innerHTML = `
                    <input type="text" class="input-glow edit-mat-name" value="${m.material || ''}" placeholder="Nome do Material" style="font-size: 0.8rem; padding: 4px 8px;" required>
                    <input type="number" class="input-glow edit-mat-qtd" value="${m.quantidade || ''}" placeholder="Qtd" style="font-size: 0.8rem; padding: 4px 8px;" min="0" step="any" required>
                    <input type="text" class="input-glow edit-mat-tipo" value="${m.tipo || ''}" placeholder="Tipo" style="font-size: 0.8rem; padding: 4px 8px;">
                    <input type="text" class="input-glow edit-mat-subtipo" value="${m.subtipo || ''}" placeholder="Subtipo/Formato" style="font-size: 0.8rem; padding: 4px 8px;">
                    <button type="button" class="btn btn-danger btn-xs btn-remove-editor-material" style="padding: 4px 6px;"><i class="fa fa-trash"></i></button>
                `;

                // If inherited from ground floor, show alert
                if (m.herdado) {
                    const note = document.createElement('div');
                    note.style.gridColumn = 'span 5';
                    note.style.fontSize = '0.7rem';
                    note.style.color = 'var(--status-agendado)';
                    note.style.marginTop = '-4px';
                    note.style.marginBottom = '4px';
                    note.textContent = `💡 Baseline herdada do Térreo (Apto ${m.terreoUnit}). Salvar para customizar para esta unidade.`;
                    row.insertBefore(note, row.firstChild);
                }

                row.querySelector('.btn-remove-editor-material').addEventListener('click', () => {
                    materials.splice(idx, 1);
                    renderRows();
                });

                rowsContainer.appendChild(row);
            });
        };

        group.querySelector('.btn-add-editor-material').addEventListener('click', () => {
            materials.push({
                material: "",
                quantidade: 1,
                tipo: "",
                subtipo: "",
                observacao: "Customização Kit Exclusivita",
                data_lancamento: new Date().toLocaleDateString('pt-BR')
            });
            renderRows();
        });

        renderRows();
        group.appendChild(rowsContainer);
        listContainer.appendChild(group);
    });

    document.getElementById('modal-edit-rep-materials').classList.remove('hidden');
}

async function handleSaveWeeklyMaterials(e) {
    e.preventDefault();
    const unitId = document.getElementById('modal-edit-rep-unit-id').value;
    const u = projectState.units.find(x => x.id === unitId);
    if (!u) return;

    const listContainer = document.getElementById('modal-edit-rep-materials-list');
    const groups = listContainer.querySelectorAll('.editor-rows-container');

    groups.forEach(group => {
        const frenteName = group.dataset.frente;
        const rows = group.querySelectorAll('.material-editor-row');
        const list = [];

        rows.forEach(row => {
            const name = row.querySelector('.edit-mat-name').value.trim();
            const qtd = parseFloat(row.querySelector('.edit-mat-qtd').value) || 0;
            const tipo = row.querySelector('.edit-mat-tipo').value.trim();
            const subtipo = row.querySelector('.edit-mat-subtipo').value.trim();

            if (name) {
                list.push({
                    material: name,
                    quantidade: qtd,
                    tipo: tipo,
                    subtipo: subtipo,
                    observacao: "Customização Kit Exclusivita",
                    data_lancamento: new Date().toLocaleDateString('pt-BR')
                });
            }
        });

        if (!u.frontsData[frenteName]) {
            u.frontsData[frenteName] = {
                responsavel: "",
                dataInicio: "",
                dataFinal: "",
                duracaoProj: 0,
                duracaoReal: 0,
                concluido: false,
                materials: {}
            };
        }
        u.frontsData[frenteName].materials = list;
    });

    await saveState();
    document.getElementById('modal-edit-rep-materials').classList.add('hidden');
    alert("Insumos planejados salvos com sucesso!");
    renderWeeklyPlanningReport();
}

function exportWeeklyGoals() {
    const towerSelect = document.getElementById('rep-rep-tower');
    const dateInput = document.getElementById('rep-rep-date');
    if (!towerSelect || !dateInput) return;

    const towerName = towerSelect.value;
    if (!towerName) {
        alert("Por favor, selecione uma torre para exportar.");
        return;
    }

    const refDate = new Date(dateInput.value + 'T12:00:00');
    const lastWeekStart = new Date(refDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const upcomingWeekEnd = new Date(refDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allProjections = {};
    FRENTES_SEQUENCIA.forEach(f => {
        allProjections[f] = getProjectionsMapForService(f);
    });

    const csvRows = [
        ["Torre", "Unidade", "Pavimento", "Frente de Servico", "Responsavel", "Status", "Data de Execucao (Real/Prevista)"]
    ];

    const towerUnits = projectState.units.filter(u => u.tower === towerName);

    towerUnits.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            const expectedDate = getUnitFrontExpectedDate(u, frente, allProjections);
            if (!expectedDate) return;

            if (fData.concluido) {
                if (expectedDate >= lastWeekStart && expectedDate <= refDate) {
                    csvRows.push([
                        u.tower,
                        u.unit,
                        u.floor + "o Pav",
                        frente,
                        fData.responsavel || "-",
                        "EXECUTADO NA ULTIMA SEMANA",
                        fData.dataFinal
                    ]);
                }
            } else {
                if (expectedDate >= refDate && expectedDate <= upcomingWeekEnd) {
                    csvRows.push([
                        u.tower,
                        u.unit,
                        u.floor + "o Pav",
                        frente,
                        "-",
                        "PREVISTO PARA A SEMANA",
                        formatDateBRDate(expectedDate)
                    ]);
                }
            }
        });
    });

    downloadCSV(csvRows, `meta_semanal_${towerName.replace(/\s+/g, '_')}.csv`);
}

function exportWeeklySupply() {
    const towerSelect = document.getElementById('rep-rep-tower');
    const dateInput = document.getElementById('rep-rep-date');
    if (!towerSelect || !dateInput) return;

    const towerName = towerSelect.value;
    if (!towerName) {
        alert("Por favor, selecione uma torre para exportar.");
        return;
    }

    const refDate = new Date(dateInput.value + 'T12:00:00');
    const lastWeekStart = new Date(refDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const upcomingWeekEnd = new Date(refDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const allProjections = {};
    FRENTES_SEQUENCIA.forEach(f => {
        allProjections[f] = getProjectionsMapForService(f);
    });

    const csvRows = [
        ["Torre", "Unidade", "Frente de Servico", "Material", "Tipo", "Subtipo/Formato", "Quantidade", "Status Abastecimento", "Data Limite Abastecimento (Prazo)"]
    ];

    const towerUnits = projectState.units.filter(u => u.tower === towerName);

    towerUnits.forEach(u => {
        FRENTES_SEQUENCIA.forEach(frente => {
            const fData = u.frontsData[frente] || {};
            const expectedDate = getUnitFrontExpectedDate(u, frente, allProjections);
            if (!expectedDate) return;

            let statusAbast = "";
            let limitDateStr = "-";

            if (fData.concluido) {
                if (expectedDate >= lastWeekStart && expectedDate <= refDate) {
                    statusAbast = "SUBIDO NA ULTIMA SEMANA";
                }
            } else {
                if (expectedDate >= refDate && expectedDate <= upcomingWeekEnd) {
                    statusAbast = "PROGRAMADO PARA SUBIR";
                    
                    const fConfig = projectState.frentesConfig[frente] || {};
                    const cap = parseFloat(fConfig.capacidadeDia) || 1;
                    let duration = 1 / cap;
                    if (fData.duracaoProj && parseFloat(fData.duracaoProj) > 0) {
                        duration = parseFloat(fData.duracaoProj);
                    }
                    const startDate = new Date(expectedDate.getTime() - duration * 24 * 60 * 60 * 1000);
                    const limitDate = new Date(startDate.getTime() - 2 * 24 * 60 * 60 * 1000);
                    limitDateStr = formatDateBRDate(limitDate);
                }
            }

            if (statusAbast) {
                const materials = getMaterialsForUnitFront(u, frente);
                if (materials.length > 0) {
                    materials.forEach(m => {
                        csvRows.push([
                            u.tower,
                            u.unit,
                            frente,
                            m.material,
                            m.tipo || "-",
                            m.subtipo || "-",
                            m.quantidade,
                            statusAbast,
                            limitDateStr
                        ]);
                    });
                } else {
                    csvRows.push([
                        u.tower,
                        u.unit,
                        frente,
                        "Nenhum material cadastrado",
                        "-",
                        "-",
                        "0",
                        statusAbast,
                        limitDateStr
                    ]);
                }
            }
        });
    });

    downloadCSV(csvRows, `abastecimento_material_${towerName.replace(/\s+/g, '_')}.csv`);
}

function downloadCSV(csvRows, filename) {
    const csvContent = csvRows.map(row => row.map(cell => {
        if (cell === null || cell === undefined) cell = "";
        let val = String(cell);
        val = val.replace(/"/g, '""');
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
            val = `"${val}"`;
        }
        return val;
    }).join(",")).join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function calculateAdditionalCollaboratorsNeeded(frenteName, targetDate, currentDate) {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    // Ensure dates are valid and set in values
    const currentVal = currentDate.getTime() < today.getTime() ? today.getTime() + 24*60*60*1000 : currentDate.getTime();
    const targetVal = targetDate.getTime() < today.getTime() ? today.getTime() + 24*60*60*1000 : targetDate.getTime();

    const dCurrent = (currentVal - today.getTime()) / (24 * 60 * 60 * 1000);
    const dTarget = (targetVal - today.getTime()) / (24 * 60 * 60 * 1000);

    if (dTarget <= 0 || dCurrent <= dTarget) return 0;

    const fConfig = projectState.frentesConfig[frenteName] || {};
    const colabs = fConfig.colaboradores || [];
    let nCurrent = colabs.length;
    if (nCurrent === 0) {
        const cap = parseFloat(fConfig.capacidadeDia) || 1;
        nCurrent = Math.max(1, Math.ceil(cap / 0.4)); // assume average 0.4 units/day per colab
    }

    const additional = Math.ceil(nCurrent * ((dCurrent / dTarget) - 1));
    return isNaN(additional) || additional < 0 ? 0 : additional;
}

function renderSequenceAlerts() {
    const alertsList = document.getElementById('seq-alerts-list');
    const noAlertsMsg = document.getElementById('no-seq-alerts-msg');
    const alertsContainer = document.getElementById('alertas-planejamento-container');

    if (!alertsList || !noAlertsMsg || !alertsContainer) return;

    if (!projectState || !projectState.units) {
        alertsList.innerHTML = '';
        noAlertsMsg.classList.remove('hidden');
        return;
    }

    // Initialize dismissedAlerts array if missing
    projectState.dismissedAlerts = projectState.dismissedAlerts || [];

    // Show/hide restore button
    const btnRestore = document.getElementById('btn-restore-alerts');
    if (btnRestore) {
        const hasDismissed = projectState.dismissedAlerts.length > 0;
        const isAuthorized = currentUser && ['admin', 'engenheiro', 'gestor', 'diretor'].includes(currentUser.role);
        if (hasDismissed && isAuthorized) {
            btnRestore.classList.remove('hidden');
        } else {
            btnRestore.classList.add('hidden');
        }
    }

    // Build projections cache for all fronts
    const allProjections = {};
    FRENTES_SEQUENCIA.forEach(f => {
        allProjections[f] = getProjectionsMapForService(f);
    });

    const rawWarnings = [];

    projectState.units.forEach(u => {
        for (let i = 0; i < FRENTES_SEQUENCIA.length; i++) {
            const frenteA = FRENTES_SEQUENCIA[i];
            const fDataA = u.frontsData[frenteA] || {};
            const dateA_end = getUnitFrontExpectedDate(u, frenteA, allProjections);
            if (!dateA_end) continue;

            const fConfigA = projectState.frentesConfig[frenteA] || {};
            const capA = parseFloat(fConfigA.capacidadeDia) || 1;
            let durationA = 1 / capA;
            if (fDataA.duracaoProj && parseFloat(fDataA.duracaoProj) > 0) {
                durationA = parseFloat(fDataA.duracaoProj);
            }
            const dateA_start = new Date(dateA_end.getTime() - durationA * 24 * 60 * 60 * 1000);

            for (let j = i + 1; j < FRENTES_SEQUENCIA.length; j++) {
                const frenteB = FRENTES_SEQUENCIA[j];
                const fDataB = u.frontsData[frenteB] || {};
                
                if (fDataB.concluido) continue;

                const dateB_end = getUnitFrontExpectedDate(u, frenteB, allProjections);
                if (!dateB_end) continue;

                const fConfigB = projectState.frentesConfig[frenteB] || {};
                const capB = parseFloat(fConfigB.capacidadeDia) || 1;
                let durationB = 1 / capB;
                if (fDataB.duracaoProj && parseFloat(fDataB.duracaoProj) > 0) {
                    durationB = parseFloat(fDataB.duracaoProj);
                }
                const dateB_start = new Date(dateB_end.getTime() - durationB * 24 * 60 * 60 * 1000);

                // 1. Check clash: B starts before A ends
                if (dateB_start < dateA_end) {
                    rawWarnings.push({
                        type: 'Choque',
                        tower: u.tower,
                        unitName: u.unit,
                        frenteA: frenteA,
                        frenteB: frenteB,
                        dateA_end: dateA_end,
                        dateB_start: dateB_start
                    });
                }

                // 2. Check gap: B is the immediate next and gap is > 30 days
                if (j === i + 1) {
                    const gapDays = (dateB_start.getTime() - dateA_end.getTime()) / (24 * 60 * 60 * 1000);
                    if (gapDays > 30) {
                        rawWarnings.push({
                            type: 'Hiato',
                            tower: u.tower,
                            unitName: u.unit,
                            frenteA: frenteA,
                            frenteB: frenteB,
                            dateA_end: dateA_end,
                            dateB_start: dateB_start,
                            gapDays: gapDays
                        });
                    }
                }
            }
        }
    });

    // Group the raw warnings
    const groupedAlerts = {};
    rawWarnings.forEach(w => {
        const key = `${w.type}|${w.tower}|${w.frenteA}|${w.frenteB}`;
        
        // Filter out if this key is in dismissedAlerts
        if (projectState.dismissedAlerts.includes(key)) return;

        if (!groupedAlerts[key]) {
            groupedAlerts[key] = {
                type: w.type,
                tower: w.tower,
                frenteA: w.frenteA,
                frenteB: w.frenteB,
                units: [],
                datesA_end: [],
                datesB_start: [],
                gaps: []
            };
        }
        groupedAlerts[key].units.push(w.unitName);
        groupedAlerts[key].datesA_end.push(w.dateA_end);
        groupedAlerts[key].datesB_start.push(w.dateB_start);
        if (w.gapDays) groupedAlerts[key].gaps.push(w.gapDays);
    });

    alertsList.innerHTML = '';

    const alertKeys = Object.keys(groupedAlerts);

    if (alertKeys.length === 0) {
        noAlertsMsg.classList.remove('hidden');
        return;
    }

    noAlertsMsg.classList.add('hidden');

    const isAuthorized = currentUser && ['admin', 'engenheiro', 'gestor', 'diretor'].includes(currentUser.role);

    alertKeys.forEach(key => {
        const g = groupedAlerts[key];
        
        g.units.sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, ''), 10);
            const numB = parseInt(b.replace(/\D/g, ''), 10);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });

        let unitsListText = g.units.slice(0, 15).join(', ');
        if (g.units.length > 15) {
            unitsListText += `, (+${g.units.length - 15} outras)`;
        }

        const isChoque = g.type === 'Choque';
        const alertItem = document.createElement('div');
        alertItem.className = `rep-alert-item ${isChoque ? 'urgent' : 'moderate'}`;
        alertItem.style.display = 'flex';
        alertItem.style.justifyContent = 'space-between';
        alertItem.style.alignItems = 'flex-start';
        alertItem.style.gap = '12px';
        
        const minDateA_end = new Date(Math.min(...g.datesA_end.map(d => d.getTime())));
        const minDateB_start = new Date(Math.min(...g.datesB_start.map(d => d.getTime())));
        
        const avgDateA_end = new Date(g.datesA_end.reduce((sum, d) => sum + d.getTime(), 0) / g.datesA_end.length);
        const avgDateB_start = new Date(g.datesB_start.reduce((sum, d) => sum + d.getTime(), 0) / g.datesB_start.length);

        let addColabs = 0;
        if (isChoque) {
            addColabs = calculateAdditionalCollaboratorsNeeded(g.frenteA, avgDateB_start, avgDateA_end);
        } else {
            const avgGap = g.gaps.reduce((sum, v) => sum + v, 0) / g.gaps.length;
            const reduction = avgGap - 10; // target gap is 10 days
            const targetDateB_start = new Date(avgDateB_start.getTime() - reduction * 24*60*60*1000);
            addColabs = calculateAdditionalCollaboratorsNeeded(g.frenteB, targetDateB_start, avgDateB_start);
        }

        let contentHtml = "";
        if (isChoque) {
            contentHtml = `
                <div style="display: flex; gap: 10px; flex: 1;">
                    <i class="fa fa-triangle-exclamation text-danger" style="font-size: 1.1rem; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">
                            Choque de Produtividade na ${g.tower} (Inconsistência de Sequência)
                        </div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                            A frente <strong>${g.frenteB}</strong> está projetada para iniciar antes do término da frente anterior <strong>${g.frenteA}</strong>.
                            <br>
                            O choque afetará <strong>${g.units.length} unidades</strong>: <span style="color: var(--primary-color); font-weight: 500;">${unitsListText}</span>.
                            <br>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">
                                Início de ${g.frenteB} previsto a partir de ${formatDateBRDate(minDateB_start)} (Frente anterior ${g.frenteA} termina em ${formatDateBRDate(minDateA_end)}).
                            </span>
                            ${addColabs > 0 ? `
                            <div style="margin-top: 6px; font-weight: 600; color: var(--status-reprovado); display: flex; align-items: center; gap: 6px;">
                                <i class="fa fa-user-plus"></i> Acelerar anterior: a frente <strong>${g.frenteA}</strong> precisa de mais <strong>${addColabs} colaborador(es)</strong> para concluir antes de iniciar ${g.frenteB}.
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        } else {
            const avgGap = Math.round(g.gaps.reduce((sum, v) => sum + v, 0) / g.gaps.length);
            contentHtml = `
                <div style="display: flex; gap: 10px; flex: 1;">
                    <i class="fa fa-hourglass-half text-warning" style="font-size: 1.1rem; margin-top: 2px;"></i>
                    <div style="flex: 1;">
                        <div style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">
                            Possível Hiato de Execução na ${g.tower} (> 30 dias de ociosidade)
                        </div>
                        <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">
                            Há um intervalo ocioso médio de <strong>${avgGap} dias</strong> de espera entre o término de <strong>${g.frenteA}</strong> e o início de <strong>${g.frenteB}</strong>.
                            <br>
                            O hiato afetará <strong>${g.units.length} unidades</strong>: <span style="color: var(--primary-color); font-weight: 500;">${unitsListText}</span>.
                            <br>
                            <span style="font-size: 0.75rem; color: var(--text-muted);">
                                Término de ${g.frenteA} em ${formatDateBRDate(minDateA_end)} e início de ${g.frenteB} em ${formatDateBRDate(minDateB_start)}.
                            </span>
                            ${addColabs > 0 ? `
                            <div style="margin-top: 6px; font-weight: 600; color: var(--status-agendado); display: flex; align-items: center; gap: 6px;">
                                <i class="fa fa-user-plus"></i> Acelerar posterior: a frente <strong>${g.frenteB}</strong> precisa de mais <strong>${addColabs} colaborador(es)</strong> para iniciar mais cedo e eliminar o hiato.
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
        }

        const actionHtml = isAuthorized ? `
            <button class="btn btn-xs btn-outline btn-dismiss-alert" style="border-color: var(--border-color); display: flex; align-items: center; gap: 4px; padding: 4px 8px; font-size: 0.75rem;" data-alert-key="${key}">
                <i class="fa fa-square-check text-success"></i> Check
            </button>
        ` : "";

        alertItem.innerHTML = contentHtml + actionHtml;

        if (isAuthorized) {
            const btnDismiss = alertItem.querySelector('.btn-dismiss-alert');
            if (btnDismiss) {
                btnDismiss.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const keyVal = btnDismiss.dataset.alertKey;
                    projectState.dismissedAlerts.push(keyVal);
                    await saveState();
                    renderSequenceAlerts();
                });
            }
        }

        alertsList.appendChild(alertItem);
    });
}

async function renderProjectSelector() {
    const grid = document.querySelector('.project-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let projects = [];
    
    // 1. Try to load from server
    try {
        const res = await fetch('/api/projects');
        if (res.ok) {
            projects = await res.json();
            // Save to localStorage as cache
            localStorage.setItem('mrv_projects_list', JSON.stringify(projects));
        }
    } catch (e) {
        console.log("Offline or no server, loading projects from cache");
    }

    // 2. Fallback to localStorage
    if (projects.length === 0) {
        const cached = localStorage.getItem('mrv_projects_list');
        if (cached) {
            try {
                projects = JSON.parse(cached);
            } catch (e) {}
        }
    }

    // 3. Guarantee default projects are in the list
    const defaults = [
        { key: 'chapada_fontana', name: 'Chapada Fontana', iconClass: 'fa-building-circle-check', city: 'Cuiabá - MT' },
        { key: 'citta_splendore', name: 'Cittá Splendore', iconClass: 'fa-building-shield', city: 'Cuiabá - MT' }
    ];

    defaults.forEach(d => {
        if (!projects.some(p => p.key === d.key)) {
            projects.unshift(d);
        }
    });

    // 4. Render project cards
    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-project', p.key);
        card.style.cssText = `background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 1.5rem; cursor: pointer; transition: transform 0.2s, border-color 0.2s; text-align: center;`;
        
        const iconClass = p.iconClass || 'fa-building-wheat';
        const city = p.city || 'Obra Cadastrada';
        
        card.innerHTML = `
            <i class="fa ${iconClass} text-success" style="font-size: 2.2rem; margin-bottom: 0.75rem;"></i>
            <h3 style="font-size: 1.2rem; color: var(--text-primary); margin-bottom: 4px;">${p.name}</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted);">${city}</p>
        `;
        
        card.addEventListener('click', async () => {
            activeProjectName = p.key;
            sessionStorage.setItem('mrv_active_project_name', activeProjectName);
            
            // Load project-specific database
            await checkDatabaseConnection();
            
            // Transition view
            document.getElementById('project-selector-container').classList.add('hidden');
            loginContainer.classList.remove('hidden');
            
            // Check active session for this project
            checkAuthSession();
        });
        
        grid.appendChild(card);
    });
}

function initCriarObraPage() {
    document.getElementById('form-generate-project').reset();
    document.getElementById('new-project-towers-list').innerHTML = '';
    addNewTowerConfigRow();
}

function addNewTowerConfigRow() {
    const container = document.getElementById('new-project-towers-list');
    const towerIndex = container.children.length + 1;
    
    const row = document.createElement('div');
    row.className = 'config-tower-card';
    row.style.cssText = `margin-bottom: 1rem; border: 1px solid var(--border-color); padding: 1rem; border-radius: 8px; position: relative;`;
    
    row.innerHTML = `
        <button type="button" class="btn-remove-tower" style="position: absolute; top: 10px; right: 10px; color: var(--status-reprovado); background: none; border: none; cursor: pointer;"><i class="fa fa-trash"></i></button>
        <div class="form-row">
            <div class="form-group col">
                <label>Nome da Torre</label>
                <input type="text" class="new-t-name" placeholder="Ex: Torre ${String(towerIndex).padStart(2, '0')}" value="Torre ${String(towerIndex).padStart(2, '0')}" required>
            </div>
            <div class="form-row col">
                <div class="form-group col">
                    <label>Pavimentos</label>
                    <input type="number" class="new-t-floors" min="1" max="30" value="12" required>
                </div>
                <div class="form-group col">
                    <label>Aptos por Pavimento</label>
                    <input type="number" class="new-t-units" min="1" max="20" value="8" required>
                </div>
            </div>
        </div>
    `;
    
    row.querySelector('.btn-remove-tower').addEventListener('click', () => {
        if (container.children.length > 1) {
            row.remove();
        } else {
            alert("A obra precisa ter pelo menos uma torre configurada!");
        }
    });
    
    container.appendChild(row);
}

async function handleGenerateProjectSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-project-name').value.trim();
    const key = document.getElementById('new-project-key').value.trim();
    
    if (!name || !key) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }
    
    const rows = document.querySelectorAll('#new-project-towers-list .config-tower-card');
    const newTowers = [];
    const newUnits = [];
    
    rows.forEach(row => {
        const tName = row.querySelector('.new-t-name').value.trim();
        const floors = parseInt(row.querySelector('.new-t-floors').value);
        const unitsPerFloor = parseInt(row.querySelector('.new-t-units').value);
        
        newTowers.push({ name: tName, floors, unitsPerFloor });
        
        for (let f = floors; f >= 1; f--) {
            const tCode = tName.replace(/\s+/g, '').substring(0, 2).toUpperCase();
            
            for (let u = 1; u <= unitsPerFloor; u++) {
                const unitNum = `${f}` + String(u).padStart(2, '0');
                const id = `${tCode}-${unitNum}`;
                
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
                    tower: tName,
                    floor: f,
                    unit: unitNum,
                    status_geral: "Ativo",
                    activeFrontIndex: 0,
                    frontsData: fronts,
                    reprovas: []
                });
            }
            
            const hallUnitNum = `${f} Hall`;
            const hallId = `${tCode}-${f}-HALL`;
            
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
                id: hallId,
                tower: tName,
                floor: f,
                unit: hallUnitNum,
                status_geral: "Ativo",
                activeFrontIndex: 0,
                frontsData: fronts,
                reprovas: [],
                isHall: true
            });
        }
    });
    
    const defaultUsers = [
        { username: "admin", password: "admin123", role: "admin", name: "Administrador Geral" },
        { username: "fiscal", password: "fiscal123", role: "fiscal", name: "Fiscal de Campo" }
    ];
    
    const frentesConfig = {};
    const today_str = new Date().toISOString().split('T')[0];
    FRENTES_SEQUENCIA.forEach(f => {
        frentesConfig[f] = {
            dataInicio: today_str,
            capacidadeDia: 2,
            colaboradores: []
        };
    });
    
    const newProjectState = {
        name: name,
        towers: newTowers,
        units: newUnits,
        users: defaultUsers,
        frentesConfig: frentesConfig,
        frentesMigrationRun: true,
        frentesMigrationV2Run: true
    };
    
    activeProjectName = key;
    projectState = newProjectState;
    
    sessionStorage.setItem('mrv_active_project_name', activeProjectName);
    
    if (syncMode === 'api') {
        try {
            const response = await fetch('/api/project?name=' + encodeURIComponent(activeProjectName), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectState)
            });
            if (response.ok) {
                let projects = [];
                const cached = localStorage.getItem('mrv_projects_list');
                if (cached) {
                    try { projects = JSON.parse(cached); } catch (e) {}
                }
                if (!projects.some(p => p.key === key)) {
                    projects.push({ key, name });
                    localStorage.setItem('mrv_projects_list', JSON.stringify(projects));
                }
                
                alert(`Obra "${name}" gerada com sucesso no servidor!`);
                
                syncMode = 'api';
                updateConnectionBadge(true);
                dbModeIndicator.textContent = `Conectado: ${projectState.name}`;
                
                loginContainer.classList.remove('hidden');
                document.getElementById('project-selector-container').classList.add('hidden');
                appContainer.classList.add('hidden');
                
                document.getElementById('username').value = "admin";
                document.getElementById('password').value = "admin123";
                
                return;
            }
        } catch (e) {
            console.error("Failed to save to server, falling back to local only", e);
        }
    }
    
    syncMode = 'local';
    const localKey = 'mrv_project_state_' + activeProjectName;
    localStorage.setItem(localKey, JSON.stringify(projectState));
    
    let projects = [];
    const cached = localStorage.getItem('mrv_projects_list');
    if (cached) {
        try { projects = JSON.parse(cached); } catch (e) {}
    }
    if (!projects.some(p => p.key === key)) {
        projects.push({ key, name });
        localStorage.setItem('mrv_projects_list', JSON.stringify(projects));
    }
    
    alert(`Obra "${name}" gerada localmente no navegador!`);
    
    updateConnectionBadge(false);
    dbModeIndicator.textContent = "Navegador Offline";
    
    loginContainer.classList.remove('hidden');
    document.getElementById('project-selector-container').classList.add('hidden');
    appContainer.classList.add('hidden');
    
    document.getElementById('username').value = "admin";
    document.getElementById('password').value = "admin123";
}

