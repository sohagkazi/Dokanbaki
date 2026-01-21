import { JsonDB } from './json-db';
import { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue } from './types';

export type { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue };

// --- USER FUNCTIONS ---

export async function createUser(name: string, mobile: string, password: string, email?: string) {
    // Check mobile uniqueness
    const existingMobile = JsonDB.findOne('users', { mobile });
    if (existingMobile) {
        throw new Error('User with this mobile number already exists');
    }

    // Check email uniqueness if provided
    if (email) {
        const existingEmail = JsonDB.findOne('users', { email });
        if (existingEmail) {
            throw new Error('User with this email already exists');
        }
    }

    const newUser = {
        name,
        mobile,
        password,
        email: email || '',
        subscriptionPlan: 'FREE',
        smsBalance: 0
    };

    const created = JsonDB.insert('users', newUser);
    return created;
}

export async function getUserByEmail(email: string) {
    return JsonDB.findOne('users', { email });
}

export async function updateUser(id: string, data: Partial<User>) {
    return JsonDB.update('users', id, data);
}

export async function getUserByMobile(mobile: string) {
    return JsonDB.findOne('users', { mobile });
}

export async function getUserById(id: string) {
    return JsonDB.findOne('users', { id });
}

export async function getAllUsersWithStats() {
    const users = JsonDB.get('users');

    return users.map((user: User) => {
        const shops = JsonDB.find('shops', { ownerId: user.id });

        let allTransactions: Transaction[] = [];
        for (const shop of shops) {
            const ts = JsonDB.find('transactions', { shopId: shop.id });
            allTransactions.push(...ts);
        }

        const uniqueCustomers = new Set(allTransactions.map(t => t.customerName)).size;

        const totalDue = allTransactions.reduce((acc, t) => {
            if (t.type === 'DUE') return acc + t.amount;
            if (t.type === 'PAYMENT') return acc - t.amount;
            return acc;
        }, 0);

        return {
            ...user,
            shopCount: shops.length,
            shopNames: shops.map((s: any) => s.name),
            totalCustomers: uniqueCustomers,
            totalDue: totalDue
        };
    });
}

// --- SHOP FUNCTIONS ---

export async function createShop(ownerId: string, name: string, mobile: string) {
    const newShop = {
        ownerId,
        name,
        mobile
    };
    return JsonDB.insert('shops', newShop);
}

export async function updateShop(id: string, data: Partial<Shop>) {
    return JsonDB.update('shops', id, data);
}

export async function getShopById(id: string) {
    return JsonDB.findOne('shops', { id });
}

export async function getShopsByOwner(ownerId: string) {
    return JsonDB.find('shops', { ownerId });
}

export async function getShopByMobile(mobile: string) {
    return JsonDB.findOne('shops', { mobile });
}

// --- TRANSACTION FUNCTIONS ---

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
    return JsonDB.insert('transactions', transaction);
}

export async function getTransactions(shopId: string) {
    return JsonDB.find('transactions', { shopId });
}

export async function deleteCustomerTransactions(shopId: string, customerName: string) {
    // Requires delete logic in JsonDB
    JsonDB.delete('transactions', { shopId, customerName });
}

export async function getAllDueTransactions() {
    const transactions = JsonDB.get('transactions');
    return transactions.filter((t: Transaction) => t.type === 'DUE' && t.dueDate);
}

export async function getCustomersWithDue(shopId: string): Promise<CustomerDue[]> {
    const transactions = await getTransactions(shopId);
    const customerMap = new Map<string, CustomerDue>();

    transactions.forEach((t: Transaction) => {
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

        if (t.date > (customer.lastDate || '')) {
            customer.lastDate = t.date;
        }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.totalDue - a.totalDue);
}

// --- OTP FUNCTIONS ---

export async function saveOtp(mobile: string, code: string) {
    // Remove old for this mobile
    JsonDB.delete('otps', { mobile });

    JsonDB.insert('otps', {
        mobile,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
}

export async function getOtp(mobile: string) {
    return JsonDB.findOne('otps', { mobile });
}

export async function deleteOtp(mobile: string) {
    JsonDB.delete('otps', { mobile });
}

// --- PAYMENT & NOTIFICATION STUBS ---

export async function createPayment(payment: any) {
    return JsonDB.insert('payments', { ...payment, status: 'PENDING' });
}

export async function getPaymentsByUser(userId: string) {
    return JsonDB.find('payments', { userId });
}

export async function getAllPayments() {
    return JsonDB.get('payments');
}

export async function updatePaymentStatus(id: string, status: string) {
    return JsonDB.update('payments', id, { status });
}

export async function createNotification(notification: any) {
    return JsonDB.insert('notifications', notification);
}

export async function getShopNotifications(shopId: string) {
    const notifs = JsonDB.find('notifications', { shopId });
    return notifs.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function markNotificationRead(id: string) {
    JsonDB.update('notifications', id, { isRead: true });
}

export async function getUnreadNotificationCount(shopId: string) {
    const notifs = JsonDB.find('notifications', { shopId, isRead: false });
    return notifs.length;
}
