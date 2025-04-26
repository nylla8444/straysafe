import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import Pet from '../../../../../models/Pet';
import { withAuth } from '../../../../../middleware/authMiddleware';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get query parameters
            const { searchParams } = new URL(request.url);
            const status = searchParams.get('status');
            const specie = searchParams.get('specie');

            // Build query filters - using userId from decoded token
            const filters = { organization: decoded.userId };
            if (status) filters.status = status;
            if (specie) filters.specie = specie;

            const pets = await Pet.find(filters).sort({ createdAt: -1 });

            return NextResponse.json({
                success: true,
                pets
            });

        } catch (error) {
            console.error('Error fetching organization pets:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to fetch pets'
            }, { status: 500 });
        }
    });
}