import { cookies } from 'next/headers';

export const USER_COOKIE = 'user_session';
export const SHOP_COOKIE = 'shop_context';

// --- User Authentication ---

export async function loginUser(userId: string) {
    const cookieStore = await cookies();
    // Set user session indefinitely (or for a long time)
    cookieStore.set(USER_COOKIE, userId, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 }); // 30 days
}

export async function logoutUser() {
    const cookieStore = await cookies();
    cookieStore.delete(USER_COOKIE);
    cookieStore.delete(SHOP_COOKIE);
}

export async function getCurrentUserId() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(USER_COOKIE);
    return cookie?.value;
}

// --- Shop Context ---

export async function setShopContext(shopId: string) {
    const cookieStore = await cookies();
    // Shop context lasts as long as the session or until switched
    cookieStore.set(SHOP_COOKIE, shopId, { httpOnly: true, path: '/' });
}

export async function clearShopContext() {
    const cookieStore = await cookies();
    cookieStore.delete(SHOP_COOKIE);
}

export async function getCurrentShopId() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SHOP_COOKIE);
    return cookie?.value;
}
