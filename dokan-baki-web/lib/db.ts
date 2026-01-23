import { JsonDB } from './json-db';
import { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue } from './types';

// Export types for consumption
export type { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue };

// --- USER FUNCTIONS ---

export async function createUser(name: string, mobile: string, password: string, email?: string): Promise<User> {
    const existingMobile = JsonDB.findOne('users', { mobile });
    if (existingMobile) throw new Error('User with this mobile number already exists');

    if (email) {
        const existingEmail = JsonDB.findOne('users', { email });
        if (existingEmail) throw new Error('User with this email already exists');
    }

    console.log('[DB] Create User:', { name, mobile });
    return JsonDB.insert('users', {
        name,
        mobile,
        password,
        email: email || '',
        subscriptionPlan: 'FREE',
        smsBalance: 0
    });
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    return JsonDB.findOne('users', { email });
}

export async function getUserByMobile(mobile: string): Promise<User | undefined> {
    return JsonDB.findOne('users', { mobile });
}

export async function getUserById(id: string): Promise<User | undefined> {
    return JsonDB.findOne('users', { id });
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return JsonDB.update('users', id, data);
}

// --- SHOP FUNCTIONS ---

export async function createShop(ownerId: string, name: string, mobile: string): Promise<Shop> {
    console.log('[DB] Creating Shop:', { ownerId, name });
    return JsonDB.insert('shops', {
        ownerId,
        name,
        mobile: mobile || ''
    });
}

export async function getShopsByOwner(ownerId: string): Promise<Shop[]> {
    const shops = JsonDB.find('shops', { ownerId });
    console.log(`[DB] Fetched ${shops.length} shops for owner ${ownerId}`);
    return shops;
}

export async function getShopById(id: string): Promise<Shop | undefined> {
    return JsonDB.findOne('shops', { id });
}

export async function updateShop(id: string, data: Partial<Shop>): Promise<Shop | null> {
    return JsonDB.update('shops', id, data);
}

// --- TRANSACTION FUNCTIONS ---

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    console.log('[DB] Adding Transaction:', transaction);
    return JsonDB.insert('transactions', transaction);
}

export async function getTransactions(shopId: string): Promise<Transaction[]> {
    return JsonDB.find('transactions', { shopId });
}

export async function deleteCustomerTransactions(shopId: string, customerName: string): Promise<void> {
    console.log('[DB] Deleting transactions for:', { shopId, customerName });
    JsonDB.delete('transactions', { shopId, customerName });
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
        if (t.mobileNumber) customer.phone = t.mobileNumber;
        if (t.date > (customer.lastDate || '')) customer.lastDate = t.date;
    });

    return Array.from(customerMap.values())
        .filter(c => Math.abs(c.totalDue) > 0) // Optional: Hide zero balances?
        .sort((a, b) => b.totalDue - a.totalDue);
}

// --- OTP & NOTIFICATIONS ---

export async function saveOtp(mobile: string, code: string): Promise<void> {
    JsonDB.delete('otps', { mobile });
    JsonDB.insert('otps', {
        mobile,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
}

export async function getOtp(mobile: string): Promise<OTP | undefined> {
    return JsonDB.findOne('otps', { mobile });
}

export async function deleteOtp(mobile: string): Promise<void> {
    JsonDB.delete('otps', { mobile });
}

export async function createPayment(payment: any): Promise<Payment> {
    return JsonDB.insert('payments', { ...payment, status: 'PENDING' });
}

export async function updatePaymentStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Payment | null> {
    return JsonDB.update('payments', id, { status });
}

export async function markNotificationRead(id: string): Promise<void> {
    JsonDB.update('notifications', id, { isRead: true });
}

// --- ADMIN FUNCTIONS ---

export async function getAllUsersWithStats(): Promise<any[]> {
    const users = JsonDB.get('users');
    const shops = JsonDB.get('shops');
    const transactions = JsonDB.get('transactions');

    return users.map(user => {
        const userShops = shops.filter(s => s.ownerId === user.id);

        // Calculate stats per shop
        const shopDetails = userShops.map(shop => {
            const shopTx = transactions.filter(t => t.shopId === shop.id);
            const uniqueCustomers = new Set(shopTx.map(t => t.customerName)).size;
            return `${shop.name} (${uniqueCustomers})`;
        });

        // Calculate total stats for user
        const allUserTx = transactions.filter(t => userShops.some(s => s.id === t.shopId));
        const totalCustomers = new Set(allUserTx.map(t => t.customerName)).size;

        // Calculate Total Due (DUE - PAYMENT)
        let totalDue = 0;
        allUserTx.forEach(t => {
            if (t.type === 'DUE') totalDue += t.amount;
            else totalDue -= t.amount;
        });

        return {
            ...user,
            shopCount: userShops.length,
            shopNames: shopDetails, // Array of strings: ["Shop A (5)", "Shop B (2)"]
            totalCustomers: totalCustomers,
            totalDue: totalDue,
            lastLogin: 'N/A'
        };
    });
}

export async function getAllPayments(): Promise<Payment[]> {
    return JsonDB.get('payments');
}

export async function approvePayment(id: string): Promise<void> {
    await updatePaymentStatus(id, 'APPROVED');
}

export async function rejectPayment(id: string): Promise<void> {
    await updatePaymentStatus(id, 'REJECTED');
}
