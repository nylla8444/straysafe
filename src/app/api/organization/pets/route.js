import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectionToDB from '../../../../../lib/mongoose';
import Pet from '../../../../../models/Pet';

export async function GET(request) {
    try {
        const tokenCookie = request.cookies.get('token');
        
        if (!tokenCookie || !tokenCookie.value) {
            return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
        }
        
        const decoded = jwt.verify(tokenCookie.value, process.env.JWT_SECRET);
        
        if (!decoded.userId) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }
        
        await connectionToDB();
        
        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const specie = searchParams.get('specie');
        
        // Build query filters
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
}