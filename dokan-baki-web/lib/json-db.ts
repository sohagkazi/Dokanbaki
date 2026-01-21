import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DB_DIR = path.dirname(DB_PATH);

// Ensure DB directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initial Schema
const initialData = {
    users: [],
    shops: [],
    transactions: [],
    notifications: [],
    payments: [],
    otps: []
};

function readDb() {
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
    try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("Error reading JSON DB:", e);
        return initialData;
    }
}

function writeDb(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export const JsonDB = {
    get: (collection: string) => {
        const db = readDb();
        return db[collection] || [];
    },

    insert: (collection: string, item: any) => {
        const db = readDb();
        if (!db[collection]) db[collection] = [];

        // Add ID if missing
        if (!item.id) {
            item.id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        }
        if (!item.createdAt) {
            item.createdAt = new Date().toISOString();
        }

        db[collection].push(item);
        writeDb(db);
        return item;
    },

    update: (collection: string, id: string, updates: any) => {
        const db = readDb();
        if (!db[collection]) return null;

        const index = db[collection].findIndex((i: any) => i.id === id);
        if (index === -1) return null;

        db[collection][index] = { ...db[collection][index], ...updates };
        writeDb(db);
        return db[collection][index];
    },

    delete: (collection: string, query: any) => {
        const db = readDb();
        if (!db[collection]) return;

        // Simple mock delete for specific keys
        db[collection] = db[collection].filter((item: any) => {
            for (const key in query) {
                if (item[key] !== query[key]) return true; // Keep if different
            }
            return false; // Remove if matches
        });
        writeDb(db);
    },

    findOne: (collection: string, query: any) => {
        const db = readDb();
        return db[collection]?.find((item: any) => {
            for (const key in query) {
                if (item[key] !== query[key]) return false;
            }
            return true;
        });
    },

    find: (collection: string, query: any = {}) => {
        const db = readDb();
        if (Object.keys(query).length === 0) return db[collection] || [];

        return db[collection]?.filter((item: any) => {
            for (const key in query) {
                // Basic equality check
                if (item[key] !== query[key]) return false;
            }
            return true;
        }) || [];
    }
};
