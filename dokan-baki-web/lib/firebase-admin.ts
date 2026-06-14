import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dokanbakikhata';

if (!process.env.GCLOUD_PROJECT) process.env.GCLOUD_PROJECT = projectId;
if (!process.env.GOOGLE_CLOUD_PROJECT) process.env.GOOGLE_CLOUD_PROJECT = projectId;

function formatPrivateKey(key: string) {
    let formattedKey = key.trim();
    if (formattedKey.startsWith('"') && formattedKey.endsWith('"')) {
        formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }
    return formattedKey.replace(/\\n/g, '\n');
}

function initFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApp();
    }

    let privKey = process.env.FIREBASE_PRIVATE_KEY;
    let clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // Next.js sometimes fails to load .env.local during early module init.
    // We explicitly read it from the file system to be bulletproof.
    if (!privKey || !clientEmail) {
        try {
            const fs = require('fs');
            const path = require('path');
            const envPath = path.join(process.cwd(), '.env.local');
            if (fs.existsSync(envPath)) {
                const envContent = fs.readFileSync(envPath, 'utf8');
                envContent.split('\\n').forEach((line: string) => {
                    const match = line.match(/^([^=]+)=(.*)$/);
                    if (match) {
                        const key = match[1].trim();
                        let val = match[2].trim();
                        if (val.startsWith('"') && val.endsWith('"')) {
                            val = val.substring(1, val.length - 1).replace(/\\\\n/g, '\\n');
                        }
                        if (key === 'FIREBASE_PRIVATE_KEY') privKey = val;
                        if (key === 'FIREBASE_CLIENT_EMAIL') clientEmail = val;
                    }
                });
            }
        } catch (e) {
            console.warn('[Firebase Admin] Handled fs parsing error:', e);
        }
    }

    if (!privKey || !clientEmail) {
        console.warn('[Firebase Admin] Explicit credentials not found in env. Falling back to auto-init.');
        try {
            return initializeApp({ projectId });
        } catch (e: any) {
             if (e.code === 'app/duplicate-app') return getApp();
             throw e;
        }
    }

    console.log('[Firebase Admin] Explicit initialization using environment credentials...');
    try {
        return initializeApp({
            credential: cert({
                projectId,
                clientEmail: clientEmail,
                privateKey: formatPrivateKey(privKey),
            }),
            projectId,
        });
    } catch (error: any) {
        console.error('[Firebase Admin] Initialization failed:', error);
        if (error.code === 'app/duplicate-app') return getApp();
        throw error;
    }
}

// NextJS HMR workaround
const globalAny = global as any;
if (!globalAny.firebaseAdminApp) {
    try {
        globalAny.firebaseAdminApp = initFirebaseAdmin();
        console.log('[Firebase Admin] Successfully initialized instance.');
    } catch (e) {
        console.error('[Firebase Admin] FATAL ERROR:', e);
    }
}

const adminApp = globalAny.firebaseAdminApp;
let firestoreInstance: FirebaseFirestore.Firestore | null = null;
if (adminApp) {
    firestoreInstance = getFirestore(adminApp);
}

export const db = firestoreInstance ? firestoreInstance : {
    collection: (_name: string) => { throw new Error('Firebase Admin SDK not initialized'); },
    batch: () => { throw new Error('Firebase Admin SDK not initialized'); },
    listCollections: () => { throw new Error('Firebase Admin SDK not initialized'); },
} as unknown as FirebaseFirestore.Firestore;

