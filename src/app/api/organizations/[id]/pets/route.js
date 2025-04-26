import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../../lib/mongoose';
import Pet from '../../../../../../models/Pet';
import { withCache } from '../../../../../../middleware/cacheMiddleware';

export async function GET(request, { params }) {
    return withCache(request, async (req) => {
        try {
            await connectionToDB();

            // Properly await params before accessing the id property
            const resolvedParams = await Promise.resolve(params);
            const organizationId = resolvedParams.id;

            // Get all pets for this organization
            const pets = await Pet.find({ organization: organizationId })
                .sort({ createdAt: -1 }); // Most recent first

            return NextResponse.json({
                success: true,
                pets
            });
        } catch (error) {
            console.error('Error fetching organization pets:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch pets for this organization'
            }, { status: 500 });
        }
    }, { duration: 30 * 1000 }); // 30 seconds cache
}