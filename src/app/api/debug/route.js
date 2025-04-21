import User from "../../../../models/User";
import connectionToDB from "../../../../lib/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectionToDB();
        const users = await User.find({}, { password: 0 }); // Exclude password
        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}