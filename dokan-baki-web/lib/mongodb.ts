import mongoose from 'mongoose';

// Dynamic import for dev-only dependency
let MongoMemoryServer: any;
if (process.env.NODE_ENV === 'development') {
    try {
        MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
    } catch (e) {
        console.error('Failed to load mongodb-memory-server', e);
    }
}

let MONGODB_URI = process.env.MONGODB_URI;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null, server: null };
}

async function dbConnect() {
    if (cached.conn) {
        return cached.conn;
    }

    // Auto-start Connection for Dev if no URI
    if (!MONGODB_URI) {
        if (process.env.NODE_ENV === 'development' && MongoMemoryServer) {
            if (!cached.server) {
                console.log('[MongoDB] Starting In-Memory Server...');
                cached.server = await MongoMemoryServer.create();
                const uri = cached.server.getUri();
                console.log('[MongoDB] In-Memory Server Ready:', uri);
                MONGODB_URI = uri;
            } else {
                MONGODB_URI = cached.server.getUri();
            }
        } else {
            throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
        }
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false, // Disable Mongoose buffering
        };

        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
            return mongoose;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export default dbConnect;
