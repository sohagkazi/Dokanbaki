import fs from 'fs/promises';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'database.json');

export interface User {
    id: string;
    name: string;
    mobile: string;
    password: string; // Hashed password
    createdAt: string;
    // Profile details
    image?: string;
    address?: string;
}

export interface Shop {
    id: string;
    ownerId: string; // Link to user
    name: string;
    mobile?: string; // Display mobile for shop contact
    // Legacy fields (optional support for old data)
    createdAt: string;
    ownerName?: string;
    address?: string;
    image?: string;
}

export interface Transaction {
    id: string;
    shopId: string; // Link to shop
    customerName: string;
    mobileNumber: string;
    amount: number;
    type: 'DUE' | 'PAYMENT';
    date: string;
    createdAt: string;
}

export interface DatabaseSchema {
    users: User[];
    shops: Shop[];
    transactions: Transaction[];
    otps: OTP[];
}

export interface OTP {
    mobile: string;
    code: string;
    expiresAt: string;
}

async function getDb(): Promise<DatabaseSchema> {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        const db = JSON.parse(data);

        // Ensure structure is correct (simple migration)
        if (!Array.isArray(db.users)) db.users = [];
        if (!Array.isArray(db.shops)) db.shops = [];
        if (!Array.isArray(db.transactions)) db.transactions = [];
        if (!Array.isArray(db.otps)) db.otps = [];

        return db;
    } catch (error) {
        // If file doesn't exist or error parsing, return default structure
        return { users: [], shops: [], transactions: [], otps: [] };
    }
}

async function saveDb(data: DatabaseSchema) {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// --- USER FUNCTIONS ---

export async function createUser(name: string, mobile: string, password: string) {
    const db = await getDb();

    if (db.users.find(u => u.mobile === mobile)) {
        throw new Error('User with this mobile number already exists');
    }

    const newUser: User = {
        id: Math.random().toString(36).substring(2, 9),
        name,
        mobile,
        password,
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    await saveDb(db);
    return newUser;
}

export async function updateUser(id: string, data: Partial<User>) {
    const db = await getDb();
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
        throw new Error('User not found');
    }

    const updatedUser = {
        ...db.users[userIndex],
        ...data,
        id: db.users[userIndex].id, // Prevent ID override
        createdAt: db.users[userIndex].createdAt // Prevent createdAt override
    };

    db.users[userIndex] = updatedUser;
    await saveDb(db);
    return updatedUser;
}

export async function getUserByMobile(mobile: string) {
    const db = await getDb();
    return db.users.find(u => u.mobile === mobile);
}

export async function getUserById(id: string) {
    const db = await getDb();
    return db.users.find(u => u.id === id);
}

// --- SHOP FUNCTIONS ---

export async function createShop(ownerId: string, name: string, mobile: string) {
    const db = await getDb();

    const newShop: Shop = {
        id: Math.random().toString(36).substring(2, 9),
        ownerId,
        name,
        mobile,
        createdAt: new Date().toISOString()
    };

    db.shops.push(newShop);
    await saveDb(db);
    return newShop;
}

export async function updateShop(id: string, data: Partial<Shop>) {
    const db = await getDb();
    const shopIndex = db.shops.findIndex(s => s.id === id);

    if (shopIndex === -1) {
        throw new Error('Shop not found');
    }

    // Merge existing shop data with new data (excluding id and createdAt for safety)
    const updatedShop = {
        ...db.shops[shopIndex],
        ...data,
        id: db.shops[shopIndex].id, // Ensure ID doesn't change
        createdAt: db.shops[shopIndex].createdAt // Ensure createdAt doesn't change
    };

    db.shops[shopIndex] = updatedShop;
    await saveDb(db);
    return updatedShop;
}

export async function getShopById(id: string) {
    const db = await getDb();
    return db.shops.find(s => s.id === id);
}

export async function getShopsByOwner(ownerId: string) {
    const db = await getDb();
    return db.shops.filter(s => s.ownerId === ownerId);
}

// Legacy support (can remove if migrated fully)
export async function getShopByMobile(mobile: string) {
    const db = await getDb();
    return db.shops.find(s => s.mobile === mobile);
}

// --- TRANSACTION FUNCTIONS ---

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    const db = await getDb();

    const newTransaction: Transaction = {
        ...transaction,
        id: Math.random().toString(36).substring(2, 9), // Simple ID generation
        createdAt: new Date().toISOString(),
    };

    db.transactions.push(newTransaction);
    await saveDb(db);

    return newTransaction;
}

export async function getTransactions(shopId: string) {
    const db = await getDb();
    // Filter transactions by shopId
    return db.transactions.filter(t => t.shopId === shopId);
}

export interface CustomerDue {
    name: string;
    phone: string;
    totalDue: number;
    lastDate?: string;
}

export async function getCustomersWithDue(shopId: string): Promise<CustomerDue[]> {
    const transactions = await getTransactions(shopId);
    const customerMap = new Map<string, CustomerDue>();

    transactions.forEach(t => {
        if (!customerMap.has(t.customerName)) {
            customerMap.set(t.customerName, {
                name: t.customerName,
                phone: t.mobileNumber,
                totalDue: 0,
                lastDate: t.date
            });
        }
        const customer = customerMap.get(t.customerName)!;
        if (t.type === 'DUE') {
            customer.totalDue += t.amount;
        } else {
            customer.totalDue -= t.amount;
        }
        // Update phone if the new transaction has a phone (simplified logic)
        if (t.mobileNumber) customer.phone = t.mobileNumber;

        // Update lastDate if current transaction date is newer (lexicographical comparison for ISO dates works)
        if (t.date > (customer.lastDate || '')) {
            customer.lastDate = t.date;
        }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalDue - a.totalDue);
}

// --- OTP FUNCTIONS ---

export async function saveOtp(mobile: string, code: string) {
    const db = await getDb();
    // Remove existing OTP for this mobile
    db.otps = db.otps.filter(o => o.mobile !== mobile);

    // Add new OTP (expires in 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    db.otps.push({ mobile, code, expiresAt });

    await saveDb(db);
}

export async function getOtp(mobile: string) {
    const db = await getDb();
    return db.otps.find(o => o.mobile === mobile);
}

export async function deleteOtp(mobile: string) {
    const db = await getDb();
    db.otps = db.otps.filter(o => o.mobile !== mobile);
    await saveDb(db);
}
