// Implement connection pooling
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
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
            maxPoolSize: 10,
            maxIdleTimeMS: 60000,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 60000,
            family: 4,
            retryWrites: true,
            retryReads: true
        };

        // Add retry logic with exponential backoff
        let retries = 5;
        let retryDelay = 1000; // Start with 1 second delay

        const connectWithRetry = async () => {
            try {
                return await mongoose.connect(MONGODB_URI, opts);
            } catch (err) {
                if (retries === 0) {
                    console.error('MongoDB connection failed after multiple attempts:', err.message);
                    throw err;
                }

                console.log(`MongoDB connection attempt failed. Retrying in ${retryDelay / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));

                retries -= 1;
                retryDelay *= 2; // Exponential backoff
                return connectWithRetry();
            }
        };

        cached.promise = connectWithRetry().then(mongoose => mongoose);
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB connection successful!');
        return cached.conn;
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.log('Please ensure your IP address is whitelisted in MongoDB Atlas');

        // Reset connection promise so the next request tries to connect again
        cached.promise = null;
        throw err;
    }
}

export default connectionToDB;