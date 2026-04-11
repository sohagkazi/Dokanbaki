import { db } from './firebase-admin';
import { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue } from './types';

export type { User, Shop, Transaction, Notification, Payment, OTP, CustomerDue };

const docWithId = <T>(doc: FirebaseFirestore.DocumentSnapshot): T | undefined => {
    if (!doc.exists) return undefined;
    const data = doc.data() as T;
    return { ...data, id: doc.id } as T;
};

// --- USER FUNCTIONS ---

export async function createUser(name: string, mobile: string, password: string, email?: string): Promise<User> {
    const usersRef = db.collection('users');
    
    const existingMobile = await usersRef.where('mobile', '==', mobile).get();
    if (!existingMobile.empty) throw new Error('User with this mobile number already exists');

    if (email) {
        const existingEmail = await usersRef.where('email', '==', email).get();
        if (!existingEmail.empty) throw new Error('User with this email already exists');
    }

    console.log('[DB] Create User:', { name, mobile });
    const userData = {
        name,
        mobile,
        password,
        email: email || '',
        subscriptionPlan: 'FREE',
        smsBalance: 0,
        createdAt: new Date().toISOString()
    };
    
    const docRef = await usersRef.add(userData);
    return { ...userData, id: docRef.id } as User;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return undefined;
    return docWithId<User>(snapshot.docs[0]);
}

export async function getUserByMobile(mobile: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('mobile', '==', mobile).limit(1).get();
    if (snapshot.empty) return undefined;
    return docWithId<User>(snapshot.docs[0]);
}

export async function getUserById(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    return docWithId<User>(doc);
}

export async function updateUser(id: string, data: Partial<User>): Promise<User | null> {
    try {
        await db.collection('users').doc(id).update(data);
        const updated = await getUserById(id);
        return updated || null;
    } catch {
        return null;
    }
}

// --- SHOP FUNCTIONS ---

export async function createShop(ownerId: string, name: string, mobile: string, theme?: any): Promise<Shop> {
    console.log('[DB] Creating Shop:', { ownerId, name });
    const shopData = {
        ownerId,
        name,
        mobile: mobile || '',
        theme: theme || null,
        createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('shops').add(shopData);
    return { ...shopData, id: docRef.id } as Shop;
}

export async function getShopsByOwner(ownerId: string): Promise<Shop[]> {
    const snapshot = await db.collection('shops').where('ownerId', '==', ownerId).get();
    return snapshot.docs.map(doc => docWithId<Shop>(doc) as Shop);
}

export async function getShopById(id: string): Promise<Shop | undefined> {
    const doc = await db.collection('shops').doc(id).get();
    return docWithId<Shop>(doc);
}

export async function updateShop(id: string, data: Partial<Shop>): Promise<Shop | null> {
    try {
        await db.collection('shops').doc(id).update(data);
        const updated = await getShopById(id);
        return updated || null;
    } catch {
        return null;
    }
}

// --- TRANSACTION FUNCTIONS ---

export async function addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> {
    console.log('[DB] Adding Transaction:', transaction);
    const txData = {
        ...transaction,
        createdAt: new Date().toISOString()
    };
    const docRef = await db.collection('transactions').add(txData);
    return { ...txData, id: docRef.id } as Transaction;
}

export async function getTransactions(shopId: string): Promise<Transaction[]> {
    const snapshot = await db.collection('transactions').where('shopId', '==', shopId).get();
    return snapshot.docs.map(doc => docWithId<Transaction>(doc) as Transaction);
}

export async function deleteCustomerTransactions(shopId: string, customerName: string): Promise<void> {
    console.log('[DB] Deleting transactions for:', { shopId, customerName });
    const snapshot = await db.collection('transactions')
        .where('shopId', '==', shopId)
        .where('customerName', '==', customerName)
        .get();
        
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
    await batch.commit();
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
        .filter(c => Math.abs(c.totalDue) > 0)
        .sort((a, b) => b.totalDue - a.totalDue);
}

// --- OTP & NOTIFICATIONS ---

export async function saveOtp(mobile: string, code: string): Promise<void> {
    const snapshot = await db.collection('otps').where('mobile', '==', mobile).get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    const newRef = db.collection('otps').doc();
    batch.set(newRef, {
        mobile,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
    
    await batch.commit();
}

export async function getOtp(mobile: string): Promise<OTP | undefined> {
    const snapshot = await db.collection('otps').where('mobile', '==', mobile).get();
    if (snapshot.empty) return undefined;
    return snapshot.docs[snapshot.docs.length - 1].data() as OTP;
}

export async function deleteOtp(mobile: string): Promise<void> {
    const snapshot = await db.collection('otps').where('mobile', '==', mobile).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
}

export async function createPayment(payment: any): Promise<Payment> {
    const payData = { ...payment, status: 'PENDING', createdAt: new Date().toISOString() };
    const docRef = await db.collection('payments').add(payData);
    return { ...payData, id: docRef.id } as Payment;
}

export async function updatePaymentStatus(id: string, status: 'APPROVED' | 'REJECTED'): Promise<Payment | null> {
    await db.collection('payments').doc(id).update({ status });
    const doc = await db.collection('payments').doc(id).get();
    return docWithId<Payment>(doc) || null;
}

export async function markNotificationRead(id: string): Promise<void> {
    await db.collection('notifications').doc(id).update({ isRead: true });
}

// --- ADMIN FUNCTIONS ---

export async function getAllUsersWithStats(): Promise<any[]> {
    const [usersSnap, shopsSnap, txSnap] = await Promise.all([
        db.collection('users').get(),
        db.collection('shops').get(),
        db.collection('transactions').get()
    ]);
    
    const users = usersSnap.docs.map(d => docWithId<User>(d) as User);
    const shops = shopsSnap.docs.map(d => docWithId<Shop>(d) as Shop);
    const transactions = txSnap.docs.map(d => docWithId<Transaction>(d) as Transaction);

    return users.map(user => {
        const userShops = shops.filter(s => s.ownerId === user.id);

        const shopDetails = userShops.map(shop => {
            const shopTx = transactions.filter(t => t.shopId === shop.id);
            const uniqueCustomers = new Set(shopTx.map(t => t.customerName)).size;
            return `${shop.name} (${uniqueCustomers})`;
        });

        const allUserTx = transactions.filter(t => userShops.some(s => s.id === t.shopId));
        const totalCustomers = new Set(allUserTx.map(t => t.customerName)).size;

        let totalDue = 0;
        allUserTx.forEach(t => {
            if (t.type === 'DUE') totalDue += t.amount;
            else totalDue -= t.amount;
        });

        return {
            ...user,
            shopCount: userShops.length,
            shopNames: shopDetails,
            totalCustomers: totalCustomers,
            totalDue: totalDue,
            lastLogin: 'N/A'
        };
    });
}

export async function getAllPayments(): Promise<Payment[]> {
    const snapshot = await db.collection('payments').get();
    return snapshot.docs.map(doc => docWithId<Payment>(doc) as Payment);
}

export async function approvePayment(id: string): Promise<void> {
    await updatePaymentStatus(id, 'APPROVED');
}

export async function rejectPayment(id: string): Promise<void> {
    await updatePaymentStatus(id, 'REJECTED');
}
