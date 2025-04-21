// DATABASE CONNECTION 

import mongoose from "mongoose";


const connectionToDB = async () => {
    try {

        await mongoose.connect(process.env.MongoURL)
        console.log("connected to db")
    } catch (error) {
        console.log(error)
    }
}

export default connectionToDB