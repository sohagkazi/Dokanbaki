import { initializeApp, getApps, getApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dokanbakikhata';

// Fix for "Unable to detect a Project Id" error locally and ensuring env vars are set
if (!process.env.GCLOUD_PROJECT) {
    process.env.GCLOUD_PROJECT = projectId;
}
if (!process.env.GOOGLE_CLOUD_PROJECT) {
    process.env.GOOGLE_CLOUD_PROJECT = projectId;
}

function formatPrivateKey(key: string) {
    return key.replace(/\\n/g, '\n');
}

function customInitApp() {
    // 1. Check if the default app is already initialized
    if (getApps().length > 0) {
        console.log(`[Firebase Admin] Using existing default app.`);
        return getApp();
    }

    // 2. Try Standard Auto-Initialization (Works in Cloud Functions & with GOOGLE_APPLICATION_CREDENTIALS)
    console.log(`[Firebase Admin] Attempting standard auto-initialization...`);
    try {
        return initializeApp();
    } catch (autoError: any) {
        console.log('[Firebase Admin] Standard auto-init failed or app exists:', autoError.code || autoError.message);

        if (autoError.code === 'app/duplicate-app') {
            return getApp();
        }

        // 3. Try Explicit Initialization with Service Account (for local dev)
        if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
            console.log(`[Firebase Admin] Using explicit service account credentials.`);
            try {
                return initializeApp({
                    credential: cert({
                        projectId: projectId,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
                    }),
                    projectId: projectId,
                });
            } catch (certError: any) {
                console.error('[Firebase Admin] Explicit initialization failed:', certError);
                if (certError.code === 'app/duplicate-app') {
                    return getApp();
                }
            }
        }

        // 4. Fallback to Manual Initialization with Project ID (mostly for Cloud Functions or container envs)
        console.log(`[Firebase Admin] Falling back to manual initialization with projectId: ${projectId}`);
        try {
            return initializeApp({
                projectId,
            });
        } catch (manualError: any) {
            console.error('[Firebase Admin] Manual initialization failed:', manualError);
            if (manualError.code === 'app/duplicate-app') {
                return getApp();
            }
            throw manualError;
        }
    }
}

// Singleton pattern to prevent multiple initializations in serverless environments
let adminApp;
try {
    adminApp = customInitApp();
} catch (e) {
    console.error('[Firebase Admin] FATAL: Failed to initialize Firebase Admin SDK', e);
    // We don't throw here to allow the server to start, but DB calls will fail.
    // Ideally we might want to crash if this is critical.
}

// Export db, making sure to handle the potential undefined app if init failed (though we logged fatal error)
// Export db, ensuring we don't crash if app init failed. 
// We return a mock that throws on usage, allowing the app to start and the Debug page to catch the error.
export const db = (adminApp ? getFirestore(adminApp) : {
    collection: (_name: string) => { throw new Error('Firebase Admin SDK not initialized. Check server logs.'); },
    batch: () => { throw new Error('Firebase Admin SDK not initialized. Check server logs.'); },
    listCollections: () => { throw new Error('Firebase Admin SDK not initialized. Check server logs.'); },
}) as FirebaseFirestore.Firestore;
