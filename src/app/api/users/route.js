import connectionToDB from "../../../../lib/mongoose";

import User from "../../../../models/User";

import { NextResponse } from "next/server";


// TODO: this is where you POST and GET request for X
// this case is for users \users


export async function GET() {
    try {
        await connectionToDB()
        const users = await User.find({})
        return NextResponse.json(users, { status: 200 })
    } catch (error) {
        return NextResponse.json({ message: error }, { status: 500 })
    }
}