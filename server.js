const express = require('express');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

// Increase limit to allow larger project database state JSON payload
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static assets from project root
app.use(express.static(path.join(__dirname)));

const SEED_PATH = path.join(__dirname, 'src', 'data', 'initialData.json');
const COLLAB_PATH = path.join(__dirname, 'global_collaborators.json');

// Initialize PostgreSQL Client if DATABASE_URL is provided (Cloud Mode)
let pgClient = null;
const databaseUrl = process.env.DATABASE_URL;

if (databaseUrl) {
    pgClient = new Client({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false // Required for Render/Supabase/Neon connections in production
        }
    });

    pgClient.connect()
        .then(async () => {
            console.log("===================================================");
            console.log("   Conectado ao banco de dados PostgreSQL (Nuvem)!");
            console.log("===================================================");
            
            // Ensure necessary tables exist
            await pgClient.query(`
                CREATE TABLE IF NOT EXISTS projects (
                    name VARCHAR(255) PRIMARY KEY,
                    state JSONB NOT NULL
                );
            `);
            await pgClient.query(`
                CREATE TABLE IF NOT EXISTS collaborators (
                    id INTEGER PRIMARY KEY,
                    data JSONB NOT NULL
                );
            `);
        })
        .catch(err => {
            console.error("Erro ao conectar ao PostgreSQL:", err);
            pgClient = null; // Fallback to local files if connection fails
        });
} else {
    console.log("===================================================");
    console.log("   Modo Local: DATABASE_URL não configurada.");
    console.log("   A persistência será em arquivos JSON locais.");
    console.log("===================================================");
}

// API Endpoint to fetch project database state
app.get('/api/project', async (req, res) => {
    const projectName = req.query.name || 'chapada_fontana';
    const dbPath = path.join(__dirname, `database_${projectName}.json`);

    // 1. Try to read from PostgreSQL database if connected
    if (pgClient) {
        try {
            const queryRes = await pgClient.query('SELECT state FROM projects WHERE name = $1', [projectName]);
            if (queryRes.rows.length > 0) {
                return res.json(queryRes.rows[0].state);
            }
        } catch (e) {
            console.error("Erro ao ler do PostgreSQL, usando fallback local:", e);
        }
    }

    // 2. Local fallback: If project database exists, return it, otherwise return initial seed data
    if (fs.existsSync(dbPath)) {
        fs.readFile(dbPath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Failed to read database file." });
            }
            try {
                return res.json(JSON.parse(data));
            } catch (e) {
                return res.status(500).json({ error: "Corrupted database file." });
            }
        });
    } else {
        // Fallback to compiled seed data
        fs.readFile(SEED_PATH, 'utf8', (err, data) => {
            if (err) {
                return res.status(404).json({ error: "Seed data not found." });
            }
            try {
                const parsed = JSON.parse(data);
                // Customize project name dynamically with proper accents
                const projectDisplayNames = {
                    'chapada_fontana': 'MRV - Chapada Fontana',
                    'citta_splendore': 'MRV - Cittá Splendore'
                };
                parsed.name = projectDisplayNames[projectName] || ("MRV - " + projectName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '));
                return res.json(parsed);
            } catch (e) {
                return res.status(500).json({ error: "Corrupted seed file." });
            }
        });
    }
});

// API Endpoint to save project state
app.post('/api/project', async (req, res) => {
    const projectName = req.query.name || 'chapada_fontana';
    const projectState = req.body;
    
    if (!projectState) {
        return res.status(400).json({ error: "Missing body state." });
    }

    // 1. Try to save to PostgreSQL database if connected
    if (pgClient) {
        try {
            await pgClient.query(
                'INSERT INTO projects (name, state) VALUES ($1, $2) ON CONFLICT (name) DO UPDATE SET state = $2',
                [projectName, JSON.stringify(projectState)]
            );
            return res.json({ success: true });
        } catch (e) {
            console.error("Erro ao salvar no PostgreSQL, usando fallback local:", e);
        }
    }

    // 2. Local fallback: Write to database_${projectName}.json
    const dbPath = path.join(__dirname, `database_${projectName}.json`);
    fs.writeFile(dbPath, JSON.stringify(projectState, null, 4), 'utf8', (err) => {
        if (err) {
            console.error(`Error writing database_${projectName}.json`, err);
            return res.status(500).json({ error: "Failed to write database file." });
        }
        return res.json({ success: true });
    });
});

// API Endpoint to fetch global collaborators list
app.get('/api/collaborators', async (req, res) => {
    // 1. Try to read from PostgreSQL database if connected
    if (pgClient) {
        try {
            const queryRes = await pgClient.query('SELECT data FROM collaborators WHERE id = 1');
            if (queryRes.rows.length > 0) {
                return res.json(queryRes.rows[0].data);
            } else {
                return res.json([]);
            }
        } catch (e) {
            console.error("Erro ao ler colaboradores do PostgreSQL, usando fallback local:", e);
        }
    }

    // 2. Local fallback: Read from global_collaborators.json
    if (fs.existsSync(COLLAB_PATH)) {
        fs.readFile(COLLAB_PATH, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: "Failed to read collaborators file." });
            }
            try {
                return res.json(JSON.parse(data));
            } catch (e) {
                return res.status(500).json({ error: "Corrupted collaborators file." });
            }
        });
    } else {
        return res.json([]);
    }
});

// API Endpoint to save global collaborators list
app.post('/api/collaborators', async (req, res) => {
    const list = req.body;
    if (!list || !Array.isArray(list)) {
        return res.status(400).json({ error: "Missing or invalid collaborators list." });
    }

    // 1. Try to save to PostgreSQL database if connected
    if (pgClient) {
        try {
            await pgClient.query(
                'INSERT INTO collaborators (id, data) VALUES (1, $1) ON CONFLICT (id) DO UPDATE SET data = $1',
                [JSON.stringify(list)]
            );
            return res.json({ success: true });
        } catch (e) {
            console.error("Erro ao salvar colaboradores no PostgreSQL, usando fallback local:", e);
        }
    }

    // 2. Local fallback: Write to global_collaborators.json
    fs.writeFile(COLLAB_PATH, JSON.stringify(list, null, 4), 'utf8', (err) => {
        if (err) {
            console.error("Error writing global_collaborators.json", err);
            return res.status(500).json({ error: "Failed to write collaborators file." });
        }
        return res.json({ success: true });
    });
});

// Listen on all network interfaces to allow local network sync (cellphones, tablets)
app.listen(PORT, '0.0.0.0', () => {
    console.log(`===================================================`);
    console.log(`   www.mrvorganizer.com.br rodando com sucesso!`);
    console.log(`   Servidor local:  http://localhost:${PORT}`);
    console.log(`===================================================`);
    console.log(`   Acesse de outros dispositivos no canteiro usando`);
    console.log(`   o IP da máquina nesta mesma rede Wi-Fi.`);
    console.log(`===================================================`);
});
