// DATABASE CONNECTION 

import mongoose from "mongoose";

export default async function connectionToDB() {
    try {
        if (mongoose.connection.readyState >= 1) return;

        await mongoose.connect(process.env.MongoURL, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000
        });
        console.log("Connected to database");
        return true;
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error; // Propagate error to caller
    }
}