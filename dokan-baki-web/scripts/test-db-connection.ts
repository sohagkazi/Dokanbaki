

process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'dokanbakikhata';
// Mock GCLOUD_PROJECT for the library check
process.env.GCLOUD_PROJECT = 'dokanbakikhata';
process.env.GOOGLE_CLOUD_PROJECT = 'dokanbakikhata';

import { db } from '../lib/firebase-admin';

async function testConnection() {
    console.log('Testing Firestore Connection...');


    try {
        const collections = await db.listCollections();
        console.log('Successfully connected to Firestore!');
        console.log('Collections:', collections.map(c => c.id).join(', '));

        // Try to fetch a user
        console.log('Attempting to read users collection...');
        const snapshot = await db.collection('users').limit(1).get();
        console.log(`Read success. Documents found: ${snapshot.size}`);

        if (snapshot.size > 0) {
            console.log('First user ID:', snapshot.docs[0].id);
        } else {
            console.log('Users collection is empty.');
        }

    } catch (error) {
        console.error('Connection Failed:', error);
    }
}

testConnection();
