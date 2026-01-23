import fs from 'fs';
import path from 'path';
import { User, Shop, Transaction, Notification, Payment, OTP } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const DB_DIR = path.dirname(DB_PATH);

interface DBSchema {
    users: User[];
    shops: Shop[];
    transactions: Transaction[];
    notifications: Notification[];
    payments: Payment[];
    otps: OTP[];
}

const initialData: DBSchema = {
    users: [],
    shops: [],
    transactions: [],
    notifications: [],
    payments: [],
    otps: []
};

class JsonDBService {
    private static instance: JsonDBService;
    private data: DBSchema;

    private constructor() {
        if (!fs.existsSync(DB_DIR)) {
            fs.mkdirSync(DB_DIR, { recursive: true });
        }
        this.data = this.readDb();
    }

    public static getInstance(): JsonDBService {
        if (!JsonDBService.instance) {
            JsonDBService.instance = new JsonDBService();
        }
        return JsonDBService.instance;
    }

    private readDb(): DBSchema {
        if (!fs.existsSync(DB_PATH)) {
            this.writeDb(initialData);
            return initialData;
        }
        try {
            const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
            if (!fileContent.trim()) {
                console.warn('[JsonDB] DB file empty, re-initializing.');
                return initialData;
            }
            return JSON.parse(fileContent) as DBSchema;
        } catch (e) {
            console.error('[JsonDB] Error reading DB:', e);
            return initialData;
        }
    }

    private writeDb(data: DBSchema) {
        try {
            // Write atomically using .tmp file
            const tempPath = `${DB_PATH}.tmp`;
            fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
            fs.renameSync(tempPath, DB_PATH);
            // Update local memory cache if write succeeds
            this.data = data;
        } catch (e) {
            console.error('[JsonDB] Error writing DB:', e);
        }
    }

    // Generic Methods

    public get<K extends keyof DBSchema>(collection: K): DBSchema[K] {
        // Always refresh from disk in dev mode to catch manual edits, 
        // or rely on memory cache for speed. Let's refresh for safety in this buggy environment.
        this.data = this.readDb();
        return this.data[collection];
    }

    public insert<K extends keyof DBSchema>(collection: K, item: any): any {
        const db = this.readDb();
        if (!db[collection]) (db[collection] as any) = [];

        // Generate ID if missing (Simple random string for now, but logged)
        if (!item.id) {
            item.id = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
        }
        if (!item.createdAt) {
            item.createdAt = new Date().toISOString();
        }

        console.log(`[JsonDB] Insert into [${collection}]:`, item);
        (db[collection] as any[]).push(item);
        this.writeDb(db);
        return item;
    }

    public update<K extends keyof DBSchema>(collection: K, id: string, updates: Partial<DBSchema[K][number]>): any | null {
        const db = this.readDb();
        if (!db[collection]) return null;

        const index = (db[collection] as any[]).findIndex((i: any) => i.id === id);
        if (index === -1) {
            console.warn(`[JsonDB] Update failed: Item ${id} not found in ${collection}`);
            return null;
        }

        (db[collection] as any[])[index] = { ...(db[collection] as any[])[index], ...updates };
        console.log(`[JsonDB] Updated [${collection}] ID: ${id}`, updates);
        this.writeDb(db);
        return (db[collection] as any[])[index];
    }

    public delete<K extends keyof DBSchema>(collection: K, query: Partial<DBSchema[K][number]>) {
        const db = this.readDb();
        if (!db[collection]) return;

        const initialLength = (db[collection] as any[]).length;
        (db[collection] as any[]) = (db[collection] as any[]).filter((item: any) => {
            for (const key in query) {
                if (item[key] !== (query as any)[key]) return true; // Keep if mismatch
            }
            return false; // Remove if match
        });

        if ((db[collection] as any[]).length < initialLength) {
            console.log(`[JsonDB] Deleted items from [${collection}] matching:`, query);
            this.writeDb(db);
        }
    }

    public findOne<K extends keyof DBSchema>(collection: K, query: Partial<DBSchema[K][number]>): any | undefined {
        const db = this.readDb();
        const found = (db[collection] as any[])?.find((item: any) => {
            for (const key in query) {
                if (item[key] !== (query as any)[key]) return false;
            }
            return true;
        });
        return found;
    }

    public find<K extends keyof DBSchema>(collection: K, query: Partial<DBSchema[K][number]> = {}): any[] {
        const db = this.readDb();
        if (Object.keys(query).length === 0) return db[collection] as any[] || [];

        return (db[collection] as any[])?.filter((item: any) => {
            for (const key in query) {
                if (item[key] !== (query as any)[key]) return false;
            }
            return true;
        }) || [];
    }
}

export const JsonDB = JsonDBService.getInstance();
