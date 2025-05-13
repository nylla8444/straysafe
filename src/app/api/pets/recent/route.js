import { NextResponse } from 'next/server';
import Pet from '../../../../../models/Pet';
import '../../../../../models/User';
import connectionToDB from '../../../../../lib/mongoose';

export async function GET() {
    try {
        await connectionToDB();

        // Fetch only available and rehabilitating pets, sort by newest first, limit to 4
        const pets = await Pet.find({
            status: { $in: ['available', 'rehabilitating'] }
        })
            .sort({ createdAt: -1 })
            .limit(4)
            .populate('organization', 'organizationName profileImage')
            .lean();

        return NextResponse.json({
            success: true,
            pets
        });
    } catch (error) {
        console.error('Error fetching recent pets:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch recent pets'
        }, { status: 500 });
    }
}