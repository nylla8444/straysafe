import { NextResponse } from 'next/server';
import connectionToDB from '../../../../lib/mongoose';
import { Inventory, InventoryTransaction } from '../../../../models/Inventory';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get all inventory items for the organization
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Get inventory items for this organization
            const items = await Inventory.find({ organization: decoded.userId })
                .sort({ updatedAt: -1 })
                .lean();

            return NextResponse.json({
                success: true,
                items
            });
        } catch (error) {
            console.error('Error fetching inventory:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch inventory items' },
                { status: 500 }
            );
        }
    });
}

// Create a new inventory item
export async function POST(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            const data = await req.json();
            await connectionToDB();

            // Create new inventory item with organization ID
            const newItem = new Inventory({
                ...data,
                organization: decoded.userId
            });

            // Save the item
            const savedItem = await newItem.save();

            // Create a transaction record for this addition
            const transaction = new InventoryTransaction({
                item: savedItem._id,
                transactionType: 'add',
                quantity: savedItem.quantity,
                previousQuantity: 0,
                newQuantity: savedItem.quantity,
                reason: 'Initial inventory addition',
                performedBy: decoded.userId,
                organization: decoded.userId
            });

            await transaction.save();

            return NextResponse.json({
                success: true,
                message: 'Item added successfully',
                item: savedItem
            });
        } catch (error) {
            console.error('Error adding inventory item:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to add inventory item' },
                { status: 500 }
            );
        }
    });
}