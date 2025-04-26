// Implement connection pooling
import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
    throw new Error('Please define the MONGODB_URL environment variable');
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectionToDB() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            maxPoolSize: 10, // Add this to increase connection pool
            maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
            serverSelectionTimeoutMS: 5000, // Fail fast if unable to connect
        };

        cached.promise = mongoose.connect(MONGODB_URL, opts)
            .then(mongoose => mongoose);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default connectionToDB;