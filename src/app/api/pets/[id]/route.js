import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectionToDB from '../../../../../lib/mongoose';
import Pet from '../../../../../models/Pet';

// Get single pet
export async function GET(request, { params }) {
    try {
        await connectionToDB();
        
        const resolvedParams = await Promise.resolve(params);
        const petId = resolvedParams.id;
        
        const pet = await Pet.findById(petId)
            .populate('organization', 'organizationName location profileImage contactNumber email');
            
        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }
        
        return NextResponse.json({
            success: true,
            pet
        });
        
    } catch (error) {
        console.error('Error fetching pet details:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to fetch pet details' 
        }, { status: 500 });
    }
}

// Update pet
export async function PUT(request, { params }) {
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
        
        const resolvedParams = await Promise.resolve(params);
        const petId = resolvedParams.id;
        
        // Find the pet
        const pet = await Pet.findById(petId);
        
        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }
        
        // Check ownership
        if (pet.organization.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Not authorized to update this pet' }, { status: 403 });
        }
        
        const updateData = await request.json();
        
        // Don't allow changing organization
        delete updateData.organization;
        delete updateData.pet_id;
        
        // Ensure at least one image remains
        if (updateData.img_arr && updateData.img_arr.length < 1) {
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 });
        }
        
        const updatedPet = await Pet.findByIdAndUpdate(
            petId,
            updateData,
            { new: true, runValidators: true }
        );
        
        return NextResponse.json({
            success: true,
            message: 'Pet updated successfully',
            pet: updatedPet
        });
        
    } catch (error) {
        console.error('Error updating pet:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Failed to update pet' 
        }, { status: 500 });
    }
}

// Delete pet
export async function DELETE(request, { params }) {
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
        
        const resolvedParams = await Promise.resolve(params);
        const petId = resolvedParams.id;
        
        // Find the pet
        const pet = await Pet.findById(petId);
        
        if (!pet) {
            return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
        }
        
        // Check ownership
        if (pet.organization.toString() !== decoded.userId) {
            return NextResponse.json({ error: 'Not authorized to delete this pet' }, { status: 403 });
        }
        
        await Pet.findByIdAndDelete(petId);
        
        return NextResponse.json({
            success: true,
            message: 'Pet deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting pet:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Failed to delete pet' 
        }, { status: 500 });
    }
}