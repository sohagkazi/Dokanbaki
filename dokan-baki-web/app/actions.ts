'use server'

import bcrypt from 'bcryptjs';

// ... (other imports remain, but ensure to keep them or re-add them if replacement overrides)
import { addTransaction, createShop, createUser, getUserByMobile, getUserByEmail, getShopsByOwner, updateShop, updateUser, getUserById, createPayment, updatePaymentStatus, deleteCustomerTransactions, markNotificationRead } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

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
    const email = (formData.get('email') as string || '').trim();
    const password = formData.get('password') as string;

    if (!name || !mobile || !password) {
        throw new Error('All fields are required');
    }

    // Password Complexity Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        // ideally return error to UI, but for now throwing
        // throw new Error('Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.');
        redirect('/register?error=weak_password');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await createUser(name, mobile, hashedPassword, email);
        await loginUser(newUser.id);
    } catch (error: any) {
        console.error(error);
        if (error.message === 'User with this mobile number already exists') {
            redirect('/register?error=user_exists');
        }
        if (error.message === 'User with this email already exists') {
            redirect('/register?error=email_exists');
        }
        redirect('/register?error=registration_failed');
    }

    redirect('/shops');
}

// ... (Top of function remains, just wrapping logic)
// ... (imports remain the same)

export async function loginUserAction(formData: FormData) {
    try {
        const mobileOrEmail = (formData.get('mobile') as string).trim();
        const password = (formData.get('password') as string).trim();

        // SUPER ADMIN BYPASS
        if (mobileOrEmail === 'sohagtanima' && password === 'St1920st@%&') {
            const cookieStore = await cookies();
            cookieStore.set('admin_session', 'true', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24, // 1 day
                path: '/',
            });
            redirect('/admin/dashboard');
        }

        // DEVELOPMENT BYPASS (If DB connection fails or testing locally)
        const isDev = process.env.NODE_ENV === 'development';
        const isDevUser = (mobileOrEmail === '0000' && password === '1234');

        if (isDev && isDevUser) {
            console.log("Using DEV BYPASS login");

            // Ensure Dev User Exists in DB so relations work
            let devUser = await getUserById('dev_user_id');
            if (!devUser) {
                console.log("Creating Dev User Stub...");
                // Directly insert to avoid uniqueness check conflicts if partial data exists
                const { JsonDB } = await import('@/lib/json-db');
                devUser = JsonDB.insert('users', {
                    id: 'dev_user_id',
                    name: 'Dev User',
                    mobile: '0000',
                    password: '1234', // plaintext for dev
                    subscriptionPlan: 'TITANIUM',
                    smsBalance: 999
                });
            }

            await loginUser('dev_user_id');

            // Check for shops
            const shops = await getShopsByOwner('dev_user_id');
            if (shops.length > 0) {
                await setShopContext(shops[0].id);
                redirect('/');
            } else {
                redirect('/shops');
            }
        }

        let user;
        try {
            console.log(`[Login Debug] Attempting login for: ${mobileOrEmail}`);
            if (mobileOrEmail.includes('@')) {
                user = await getUserByEmail(mobileOrEmail);
            } else {
                user = await getUserByMobile(mobileOrEmail);
            }
            console.log(`[Login Debug] User fetch result:`, user ? `Found user ${user.id}` : 'User not found');
        } catch (error: any) {
            console.error("[Login Debug] DB Error:", error);
            redirect('/login?error=db_connection');
        }

        if (!user) {
            redirect('/login?error=invalid');
        }

        const isValid = await bcrypt.compare(password, user.password || '');
        if (!isValid) {
            redirect('/login?error=invalid');
        }

        // AI DYNAMIC THEMING
        if (!user.theme) {
            try {
                // We don't have shop info here easily unless we fetch shops first, 
                // or just use user name/generic
                const shops = await getShopsByOwner(user.id);
                const shopName = shops.length > 0 ? shops[0].name : user.name + "'s Shop";

                // Dynamic import to avoid circular dep if needed, or just import
                const { generateUserTheme } = await import('@/lib/ai');
                const theme = await generateUserTheme(shopName);

                await updateUser(user.id, { theme });
                console.log(`[AI Theme] Generated and saved for user ${user.id}`);
            } catch (e) {
                console.error("[AI Theme] Error generating theme:", e);
            }
        }

        await loginUser(user.id);
        console.log(`[Login Debug] Login successful for user ${user.id}`);

        const shops = await getShopsByOwner(user.id);
        if (shops.length > 0) {
            // Auto-select first shop if available? Or force selection?
            // Let's redirect to shops listing to be safe, or select first one.
            // Safe bet: Redirect to /shops so they know they have shops.
            redirect('/shops');
        } else {
            redirect('/shops');
        }

    } catch (error: any) {
        if (error.message === 'NEXT_REDIRECT' || error.digest?.startsWith('NEXT_REDIRECT')) {
            throw error;
        }
        console.error("CRITICAL LOGIN ERROR:", error);
        redirect('/login?error=system_error');
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
    console.log('[DEBUG ShopAction] Current UserId:', userId);

    if (!userId) {
        console.log('[DEBUG ShopAction] No userId found, redirecting to login');
        redirect('/login');
    }

    const shopName = formData.get('shopName') as string;
    const mobile = formData.get('mobile') as string; // Optional shop contact
    console.log('[DEBUG ShopAction] Form Data - Name:', shopName, 'Mobile:', mobile);

    if (!shopName) {
        throw new Error('Shop Name is required');
    }

    const user = await getUserById(userId);
    console.log('[DEBUG ShopAction] Fetched User:', user ? user.id : 'null');

    if (!user) redirect('/login');

    // AI THEME GENERATION FOR SHOP
    let theme;
    try {
        console.log(`[AI Shop Theme] Generating for ${shopName}...`);
        const { generateUserTheme } = await import('@/lib/ai');
        theme = await generateUserTheme(shopName, 'retail');
    } catch (e) {
        console.error('[AI Shop Theme] Failed:', e);
    }

    const newShop = await createShop(userId, shopName, mobile || '', theme);
    console.log('[DEBUG ShopAction] New Shop Created:', newShop);

    await setShopContext(newShop.id); // Auto-select new shop
    console.log('[DEBUG ShopAction] Shop Context Set. Redirecting to home...');

    redirect('/');
}

export async function selectShopAction(shopId: string) {
    const userId = await getCurrentUserId();
    if (!userId) redirect('/login');

    // Verify ownership? (Good to have)
    const shops = await getShopsByOwner(userId);
    if (!shops.find((s: any) => s.id === shopId)) {
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
    const productName = (formData.get('productName') as string || '').trim(); // Optional

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
        productName,
        type: 'DUE',
    });



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



export async function deleteCustomerAction(customerName: string) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/login');

    await deleteCustomerTransactions(shopId, customerName);
    revalidatePath('/customers');
}

// --- ADMIN ACTIONS ---

export async function adminLoginAction(formData: FormData) {
    const userId = (formData.get('userId') as string).trim();
    const password = (formData.get('password') as string).trim();

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
// --- NOTIFICATION ACTIONS ---

export async function markNotificationReadAction(id: string) {
    const shopId = await getCurrentShopId();
    if (!shopId) return; // Security check

    await markNotificationRead(id);
    revalidatePath('/notifications');
}

export async function sendManualMessage(formData: FormData) {
    const shopId = await getCurrentShopId();
    if (!shopId) redirect('/shops');

    const mobile = formData.get('mobile') as string;
    const message = formData.get('message') as string;

    if (!mobile || !message) {
        throw new Error('Mobile number and message are required');
    }

    await sendSMS(mobile, message);

    redirect('/customers');
}
