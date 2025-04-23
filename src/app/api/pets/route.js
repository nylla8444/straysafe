import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectionToDB from '../../../../lib/mongoose';
import User from '../../../../models/User';
import Pet from '../../../../models/Pet';

// Get all pets (with optional filters)
export async function GET(request) {
    try {
        await connectionToDB();
        
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const specie = searchParams.get('specie');
        const organizationId = searchParams.get('organization');
        
        const filters = {};
        if (status) filters.status = status;
        if (specie) filters.specie = specie;
        if (organizationId) filters.organization = organizationId;
        
        const pets = await Pet.find(filters)
            .populate('organization', 'organizationName location profileImage')
            .sort({ createdAt: -1 });
            
        return NextResponse.json({ 
            success: true,
            pets
        });
    } catch (error) {
        console.error('Error fetching pets:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch pets' 
        }, { status: 500 });
    }
}

// Create new pet
export async function POST(request) {
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
        
        const organization = await User.findById(decoded.userId);
        
        if (!organization || organization.userType !== 'organization') {
            return NextResponse.json({ error: 'Only organizations can post pets' }, { status: 403 });
        }
        
        if (!organization.isVerified) {
            return NextResponse.json({ error: 'Organization must be verified to post pets' }, { status: 403 });
        }
        
        const petData = await request.json();
        
        // Add organization ID to the pet data
        petData.organization = organization._id;
        
        // Validate minimum images
        if (!petData.img_arr || petData.img_arr.length < 1) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }
        
        const newPet = new Pet(petData);
        await newPet.save();
        
        return NextResponse.json({
            success: true,
            message: 'Pet created successfully',
            pet: newPet
        }, { status: 201 });
        
    } catch (error) {
        console.error('Error creating pet:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to create pet' 
        }, { status: 500 });
    }
}