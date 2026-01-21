import { cookies } from 'next/headers';
import { USER_COOKIE, SHOP_COOKIE } from './constants';

export { USER_COOKIE, SHOP_COOKIE }; // Re-export for backward compatibility if needed, or better just use direct imports elsewhere


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

import { trackUser } from './online-tracker';

export async function getCurrentUserId() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(USER_COOKIE);
    if (cookie?.value) trackUser(cookie.value);
    return cookie?.value;
}

// --- Shop Context ---

export async function setShopContext(shopId: string) {
    const cookieStore = await cookies();
    cookieStore.set(SHOP_COOKIE, shopId, { httpOnly: true, path: '/' });
}

export async function clearShopContext() {
    const cookieStore = await cookies();
    cookieStore.delete(SHOP_COOKIE);
}

export async function getCurrentShopId() {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(SHOP_COOKIE);
    // Note: Tracking Shop ID implies user activity too if we map shop->user, 
    // but strict "User" tracking is best done in getCurrentUserId or similar middleware.
    return cookie?.value;
}
