import { db } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export default async function DebugPage() {
    let status = 'Loading...';
    let details = '';
    let collections = [];

    try {
        console.log('[Debug Page] Attempting to connect to Firestore...');
        // Try simple read
        const collectionsList = await db.listCollections();
        collections = collectionsList.map(c => c.id);

        status = 'Success';
        details = `Connected to Project: ${process.env.GCLOUD_PROJECT || 'Unknown'}\nCollections found: ${collections.join(', ')}`;

        // Try reading users
        const usersSnap = await db.collection('users').limit(1).get();
        details += `\nUsers found: ${usersSnap.size}`;

    } catch (e: any) {
        status = 'Failed';
        details = `Error: ${e.message}\nCode: ${e.code}\nStack: ${e.stack}`;
        console.error('[Debug Page] Error:', e);
    }

    return (
        <div className="p-10 font-mono">
            <h1 className="text-2xl font-bold mb-4">System Debug Diagnostic</h1>

            <div className={`p-4 border rounded ${status === 'Success' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                <h2 className="text-xl font-bold">{status}</h2>
                <pre className="mt-4 whitespace-pre-wrap text-sm">{details}</pre>
            </div>

            <div className="mt-8">
                <h3 className="font-bold">Environment Variables:</h3>
                <ul className="list-disc pl-5">
                    <li>NODE_ENV: {process.env.NODE_ENV}</li>
                    <li>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}</li>
                    <li>GCLOUD_PROJECT: {process.env.GCLOUD_PROJECT}</li>
                </ul>
            </div>
        </div>
    );
}
