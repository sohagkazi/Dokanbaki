
// Simple in-memory storage for tracking active users
// This resets on server restart, which is expected behavior for "Live" status.

const activeUsers = new Map<string, number>();

export function trackUser(userId: string) {
    if (!userId) return;
    activeUsers.set(userId, Date.now());
}

export function getLiveUserCount(lastMinutes: number = 5): number {
    const now = Date.now();
    const threshold = lastMinutes * 60 * 1000;

    // Cleanup old entries
    for (const [userId, timestamp] of activeUsers.entries()) {
        if (now - timestamp > threshold) {
            activeUsers.delete(userId);
        }
    }

    return activeUsers.size;
}
