export interface User {
    id: string;
    name: string;
    mobile: string;
    password: string;
    email?: string;
    createdAt: string;
    image?: string;
    address?: string;
    subscriptionPlan: 'FREE' | 'PRO' | 'PLATINUM' | 'TITANIUM';
    subscriptionExpiry?: string;
    smsBalance: number;
}

export interface Shop {
    id: string;
    ownerId: string;
    name: string;
    mobile?: string;
    createdAt: string;
    ownerName?: string;
    address?: string;
    image?: string;
}

export interface Transaction {
    id: string;
    shopId: string;
    customerName: string;
    mobileNumber: string;
    amount: number;
    type: 'DUE' | 'PAYMENT';
    productName?: string;
    date: string;
    dueDate?: string;
    createdAt: string;
}

export interface Notification {
    id: string;
    shopId: string;
    message: string;
    type: 'DUE_ALERT' | 'SYSTEM';
    date: string;
    isRead: boolean;
}

export interface Payment {
    id: string;
    userId: string;
    plan: 'PRO' | 'PLATINUM' | 'TITANIUM' | 'SMS_PACK';
    amount: number;
    method: 'bKash' | 'Nagad' | 'Rocket' | 'SSL Commerz' | 'Piprapay' | 'MoynaPay';
    senderNumber: string;
    transactionId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    createdAt: string;
}

export interface OTP {
    mobile: string;
    code: string;
    expiresAt: string;
}

export interface CustomerDue {
    name: string;
    phone: string;
    totalDue: number;
    lastDate?: string;
}
