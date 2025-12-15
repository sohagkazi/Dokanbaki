'use server'

import bcrypt from 'bcryptjs';

// ... (other imports remain, but ensure to keep them or re-add them if replacement overrides)
import { addTransaction, createShop, createUser, getUserByMobile, getShopsByOwner, updateShop, updateUser, getUserById, createPayment, updatePaymentStatus, deleteCustomerTransactions } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sendWhatsApp } from '@/lib/sms';
import { loginUser, logoutUser, getCurrentShopId, getCurrentUserId, setShopContext, clearShopContext } from '@/lib/auth';

// --- USER ACTIONS ---

export async function logoutAction() {
    await logoutUser();
    redirect('/login');
}

export async function exitShopAction() {
    await clearShopContext();
    redirect('/shops');
}

export async function registerUserAction(formData: FormData) {
    const name = formData.get('name') as string;
    const mobile = formData.get('mobile') as string;
    const password = formData.get('password') as string;

    if (!name || !mobile || !password) {
        throw new Error('All fields are required');
    }

    // Password Complexity Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        // ideally return error to UI, but for now throwing
        throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(name, mobile, hashedPassword);
        await loginUser(newUser.id);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'User with this mobile number already exists') {
            redirect('/register?error=user_exists');
        }
        redirect('/register?error=registration_failed');
    }

    redirect('/shops');
}

export async function loginUserAction(formData: FormData) {
    const mobile = formData.get('mobile') as string;
    const password = formData.get('password') as string;

    const user = await getUserByMobile(mobile);

    if (!user) {
        redirect('/login?error=invalid');
    }

    const isValid = await bcrypt.compare(password, user.password || ''); // Handle migration or empty
    if (!isValid) {
        redirect('/login?error=invalid');
    }

    await loginUser(user.id);

    // Check if user has shops
    const shops = await getShopsByOwner(user.id);
    if (shops.length > 0) {
        redirect('/shops');
    } else {
        redirect('/shops');
    }
}

export async function updateUserProfile(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const image = formData.get('image') as string; // Expecting Base64 or URL

    await updateUser(userId, {
        name,
        address,
        image
    });

    revalidatePath('/shops'); // Where user info might be displayed
    revalidatePath('/user-profile'); // Assuming this page exists
    redirect('/user-profile');
}

// --- SHOP ACTIONS ---

export async function createShopAction(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const shopName = formData.get('shopName') as string;
    const mobile = formData.get('mobile') as string; // Optional shop contact

    if (!shopName) {
        throw new Error('Shop Name is required');
    }

    const user = await getUserById(userId);
    if (!user) redirect('/login');

    const existingShops = await getShopsByOwner(userId);

    // Subscription Limits
    // Subscription Limits - REMOVED for Free App
    // const limits = {
    //     'FREE': 1,
    //     'PRO': 3,
    //     'PLATINUM': 10,
    //     'TITANIUM': Infinity
    // };
    // const currentPlan = user.subscriptionPlan || 'FREE';
    // const limit = limits[currentPlan];
    // if (existingShops.length >= limit) {
    //     redirect('/subscription?error=limit_reached');
    // }

    const newShop = await createShop(userId, shopName, mobile || '');
    await setShopContext(newShop.id); // Auto-select new shop

    redirect('/');
}

export async function selectShopAction(shopId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    // Verify ownership? (Good to have)
    const shops = await getShopsByOwner(userId);
    if (!shops.find(s => s.id === shopId)) {
        throw new Error('Unauthorized access to shop');
    }

    await setShopContext(shopId);
    redirect('/');
}

// --- TRANSACTION ACTIONS ---

export async function saveDueEntry(formData: FormData) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/shops'); // Redirect to shop selection if no context

    const customerName = (formData.get('customerName') as string).trim();
    const mobileNumber = (formData.get('mobileNumber') as string).trim();
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    const dueDate = formData.get('dueDate') as string; // Optional

    if (!customerName || isNaN(amount)) {
        throw new Error('Missing required fields or invalid amount');
    }

    await addTransaction({
        shopId,
        customerName,
        mobileNumber,
        amount,
        date,
        dueDate,
        type: 'DUE',
    });

    // Send WhatsApp
    if (mobileNumber) {
        await sendWhatsApp(mobileNumber, `Hello *${customerName}*,\nYour due of *Tk ${amount}* has been added.\nDate: ${date}\n\n- Baki Khata App`);
    }

    revalidatePath('/');
    revalidatePath('/customers');
    redirect('/');
}

export async function savePaymentEntry(formData: FormData) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/shops');

    const customerName = (formData.get('customerName') as string).trim();
    const mobileNumber = (formData.get('mobileNumber') as string).trim();
    const amount = parseFloat(formData.get('amount') as string);
    const date = new Date().toISOString().split('T')[0];

    if (!customerName || isNaN(amount)) {
        throw new Error('Missing required fields or invalid amount');
    }

    await addTransaction({
        shopId,
        customerName,
        mobileNumber,
        amount,
        date,
        type: 'PAYMENT',
    });

    if (mobileNumber) {
        await sendWhatsApp(mobileNumber, `Hello *${customerName}*,\nWe received your payment of *Tk ${amount}*.\n\n- Baki Khata App`);
    }

    revalidatePath('/');
    revalidatePath('/customers');
    revalidatePath('/add-payment');
    redirect('/');
}

export async function updateShopProfile(formData: FormData) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/shops');

    const ownerName = formData.get('ownerName') as string;
    const shopName = formData.get('shopName') as string;
    const mobile = formData.get('mobile') as string;
    const address = formData.get('address') as string;
    const image = formData.get('image') as string;

    await updateShop(shopId, {
        ownerName,
        name: shopName,
        mobile,
        address,
        image
    });

    revalidatePath('/profile');
    revalidatePath('/');
    redirect('/profile');
}

// --- MESSAGING ACTIONS ---

export async function sendManualMessage(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const customerName = formData.get('customerName') as string;
    const mobile = formData.get('mobile') as string;
    const message = formData.get('message') as string;

    if (!mobile || !message) {
        throw new Error('Mobile number and message are required');
    }

    await sendWhatsApp(mobile, `Hello *${customerName}*,\n\n${message}\n\n- Dokan Baki App`);

    redirect('/customers');
}

export async function deleteCustomerAction(customerName: string) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    await deleteCustomerTransactions(shopId, customerName);
    revalidatePath('/customers');
}

// --- ADMIN ACTIONS ---

export async function adminLoginAction(formData: FormData) {
    const userId = formData.get('userId') as string;
    const password = formData.get('password') as string;

    if (userId === 'sohagtanima' && password === 'St1920st@%&') {
        const cookieStore = await cookies();
        cookieStore.set('admin_session', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        redirect('/admin/dashboard');
    } else {
        redirect('/admin/login?error=invalid');
    }
}

export async function approvePaymentAction(id: string, userId: string, plan: string, amount: number) {
    // Verify admin session (skip for speed here, or check cookie)
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) redirect('/admin/login');

    await updatePaymentStatus(id, 'APPROVED');

    // Update User Plan
    if (plan === 'SMS_PACK') {
        // Special handling for SMS pack: add balance
        const user = await getUserById(userId);
        if (user) {
            const smsAmount = 1000; // Hardcoded pack size for now or pass it
            await updateUser(userId, { smsBalance: (user.smsBalance || 0) + smsAmount });
        }
    } else {
        // Subscription Plan
        await updateUser(userId, {
            subscriptionPlan: plan as any,
            subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    }

    revalidatePath('/admin/dashboard');
}

export async function rejectPaymentAction(id: string) {
    const cookieStore = await cookies();
    if (!cookieStore.get('admin_session')) redirect('/admin/login');

    await updatePaymentStatus(id, 'REJECTED');
    revalidatePath('/admin/dashboard');
}

// --- FORGOT PASSWORD ACTIONS ---

import { saveOtp, getOtp, deleteOtp } from '@/lib/db';
import { sendSMS } from '@/lib/sms';

export async function sendForgotPasswordOtp(mobile: string) {
    const user = await getUserByMobile(mobile);
    if (!user) {
        return { error: 'User not found' };
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    await saveOtp(mobile, otp);

    // Send SMS (Mock/Real)
    await sendSMS(mobile, `Your Baki Khata OTP is: ${otp}. Valid for 5 minutes.`);

    return { success: true, message: 'OTP sent to your mobile number' };
}

export async function resetPasswordWithOtp(mobile: string, otp: string, newPassword: string) {
    const savedOtp = await getOtp(mobile);

    if (!savedOtp) {
        return { error: 'OTP expired or not found. Please request a new one.' };
    }

    if (savedOtp.code !== otp) {
        return { error: 'Invalid OTP' };
    }

    // Check expiration
    if (new Date(savedOtp.expiresAt) < new Date()) {
        return { error: 'OTP expired' };
    }

    // Password Complexity Validation (Duplicated for now, or move to shared util)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return { error: 'Password does not meet complexity requirements.' };
    }

    // Update User Password
    const user = await getUserByMobile(mobile);
    if (!user) return { error: 'User not found' };

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUser(user.id, { password: hashedPassword });
    await deleteOtp(mobile);

    return { success: true };
}

// --- PAYMENT ACTIONS ---
export async function submitPaymentAction(formData: FormData) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    const plan = formData.get('plan') as 'PRO' | 'PLATINUM' | 'TITANIUM' | 'SMS_PACK';
    const amount = parseFloat(formData.get('amount') as string);
    const method = formData.get('method') as 'bKash' | 'Nagad' | 'Rocket';
    const senderNumber = formData.get('senderNumber') as string;
    const transactionId = formData.get('transactionId') as string;

    if (!plan || !amount || !method || !senderNumber || !transactionId) {
        throw new Error('All fields are required');
    }

    await createPayment({
        userId,
        plan,
        amount,
        method,
        senderNumber,
        transactionId
    });

    // In a real app we'd redirect to a "Thank You" or "Pending" page
    redirect('/subscription?success=payment_submitted');
}
