import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import AdoptionApplication from '../../../../models/AdoptionApplication';
import Pet from '../../../../models/Pet';
import User from '../../../../models/User';
import { withAuth } from '../../../../middleware/authMiddleware';

export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            // Get the user details for verification
            await connectionToDB();
            const user = await User.findById(decoded.userId);

            if (!user || user.userType !== 'adopter' || user.status !== 'active') {
                return NextResponse.json({
                    success: false,
                    error: 'Only active adopters can submit adoption applications'
                }, { status: 403 });
            }

            const data = await request.json();

            // Verify pet exists and is available
            const pet = await Pet.findById(data.petId);
            if (!pet) {
                return NextResponse.json({
                    success: false,
                    error: 'Pet not found'
                }, { status: 404 });
            }

            if (pet.status !== 'available') {
                return NextResponse.json({
                    success: false,
                    error: 'This pet is not available for adoption'
                }, { status: 400 });
            }

            // Enhanced check for existing applications - ensure string comparison for ObjectIds
            const existingApplication = await AdoptionApplication.findOne({
                adopterId: user._id,
                petId: pet._id,
                status: { $nin: ['rejected', 'withdrawn'] }
            });

            if (existingApplication) {
                console.log(`Duplicate adoption attempt detected - User: ${user._id}, Pet: ${pet._id}, Existing application: ${existingApplication._id} (${existingApplication.status})`);
                
                return NextResponse.json({
                    success: false,
                    error: 'You already have an active application for this pet. Check your application status in your profile.'
                }, { status: 400 });
            }

            // Create the application
            const application = new AdoptionApplication({
                adopterId: user._id,
                petId: pet._id,
                organizationId: pet.organization,
                housingStatus: data.housingStatus,
                petsAllowed: data.petsAllowed,
                petLocation: data.petLocation,
                primaryCaregiver: data.primaryCaregiver,
                otherPets: data.otherPets,
                financiallyPrepared: data.financiallyPrepared,
                emergencyPetCare: data.emergencyPetCare,
                reference: data.reference,
                termsAccepted: data.termsAccepted
            });

            await application.save();

            return NextResponse.json({
                success: true,
                message: 'Application submitted successfully',
                applicationId: application.applicationId
            });

        } catch (error) {
            console.error('Error submitting adoption application:', error);
            return NextResponse.json({
                success: false,
                error: 'Failed to submit application. Please try again.'
            }, { status: 500 });
        }
    });
}