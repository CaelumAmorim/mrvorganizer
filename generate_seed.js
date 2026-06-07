const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, 'src', 'data');
const jsonPath = path.join(outputDir, 'initialData.json');
const jsPath = path.join(outputDir, 'initialData.js');
const dbPath = path.join(__dirname, 'database.json');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Sequence of service fronts
const frentes = [
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

// Helper to initialize fronts data
function createFrontsData() {
    const data = {};
    frentes.forEach(f => {
        data[f] = {
            responsavel: "",
            dataInicio: "",
            dataFinal: "",
            duracaoProj: 0,
            duracaoReal: 0,
            concluido: false,
            materials: {}
        };
    });
    return data;
}

const units = [];

// Generate Torre 01 (12 floors, 8 units/floor)
for (let floor = 12; floor >= 1; floor--) {
    for (let u = 1; u <= 8; u++) {
        const unitNum = `${floor}${String(u).padStart(2, '0')}`;
        const id = `T1-${unitNum}`;
        units.push({
            id: id,
            tower: "Torre 01",
            floor: floor,
            unit: unitNum,
            status_geral: "Ativo",
            activeFrontIndex: 0,
            frontsData: createFrontsData(),
            reprovas: []
        });
    }
}

// Generate Torre 02 (11 floors, 8 units/floor)
for (let floor = 11; floor >= 1; floor--) {
    for (let u = 1; u <= 8; u++) {
        const unitNum = `${floor}${String(u).padStart(2, '0')}`;
        const id = `T2-${unitNum}`;
        units.push({
            id: id,
            tower: "Torre 02",
            floor: floor,
            unit: unitNum,
            status_geral: "Ativo",
            activeFrontIndex: 0,
            frontsData: createFrontsData(),
            reprovas: []
        });
    }
}

// Generate Torre 03 (11 floors, 8 units/floor)
for (let floor = 11; floor >= 1; floor--) {
    for (let u = 1; u <= 8; u++) {
        const unitNum = `${floor}${String(u).padStart(2, '0')}`;
        const id = `T3-${unitNum}`;
        units.push({
            id: id,
            tower: "Torre 03",
            floor: floor,
            unit: unitNum,
            status_geral: "Ativo",
            activeFrontIndex: 0,
            frontsData: createFrontsData(),
            reprovas: []
        });
    }
}

const users = [
    {
        username: "rafael.samorim",
        password: "030348",
        role: "admin",
        name: "Rafael Amorim"
    },
    {
        username: "fiscal",
        password: "fiscal123",
        role: "fiscal",
        name: "Fiscal de Campo"
    }
];

const frentesConfig = {};
frentes.forEach(f => {
    frentesConfig[f] = {
        dataInicio: "2026-06-08",
        capacidadeDia: 2,
        colaboradores: []
    };
});

const projectState = {
    name: "MRV - Organizer Plus",
    towers: [
        { name: "Torre 01", floors: 12, unitsPerFloor: 8 },
        { name: "Torre 02", floors: 11, unitsPerFloor: 8 },
        { name: "Torre 03", floors: 11, unitsPerFloor: 8 }
    ],
    units: units,
    users: users,
    frentesConfig: frentesConfig
};

// Write JSON file (UTF-8 without BOM)
fs.writeFileSync(jsonPath, JSON.stringify(projectState, null, 4), 'utf8');

// Write JS file (UTF-8 without BOM)
fs.writeFileSync(jsPath, `window.initialProjectData = ${JSON.stringify(projectState, null, 4)};`, 'utf8');

// Delete residual server database if exists to force clean state
if (fs.existsSync(dbPath)) {
    try {
        fs.unlinkSync(dbPath);
        console.log("Deleted old database.json to reset server database.");
    } catch (err) {
        console.error("Error deleting database.json:", err);
    }
}

console.log("Successfully generated clean seed database in initialData.json and initialData.js!");
console.log(`Total units generated: ${units.length}`);
console.log(`Encoding: UTF-8 (valid keys: 'Impermeabilização', 'Regularização')`);
