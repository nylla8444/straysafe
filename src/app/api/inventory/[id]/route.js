import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { Inventory, InventoryTransaction } from '../../../../../models/Inventory';
import { withAuth } from '../../../../../middleware/authMiddleware';

// Get a specific inventory item
export async function GET(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            // Await params before accessing its properties
            const { id } = await params;
            await connectionToDB();

            const item = await Inventory.findOne({
                _id: id,
                organization: decoded.userId
            });

            if (!item) {
                return NextResponse.json(
                    { success: false, message: 'Item not found' },
                    { status: 404 }
                );
            }

            return NextResponse.json({ success: true, item });
        } catch (error) {
            console.error('Error fetching inventory item:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch inventory item' },
                { status: 500 }
            );
        }
    });
}

// Update an inventory item
export async function PUT(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            // Await params before accessing its properties
            const { id } = await params;
            const data = await req.json();
            await connectionToDB();

            // Find the item first to check ownership and get previous quantity
            const existingItem = await Inventory.findOne({
                _id: id,
                organization: decoded.userId
            });

            if (!existingItem) {
                return NextResponse.json(
                    { success: false, message: 'Item not found or you do not have permission' },
                    { status: 404 }
                );
            }

            const previousQuantity = existingItem.quantity;

            // Update the item
            const updatedItem = await Inventory.findByIdAndUpdate(
                id,
                { ...data, organization: decoded.userId },
                { new: true, runValidators: true }
            );

            // Create a transaction record if quantity changed
            if (previousQuantity !== updatedItem.quantity) {
                const transaction = new InventoryTransaction({
                    item: updatedItem._id,
                    transactionType: 'adjust',
                    quantity: Math.abs(updatedItem.quantity - previousQuantity),
                    previousQuantity: previousQuantity,
                    newQuantity: updatedItem.quantity,
                    reason: 'Inventory adjustment',
                    performedBy: decoded.userId,
                    organization: decoded.userId
                });

                await transaction.save();
            }

            return NextResponse.json({
                success: true,
                message: 'Item updated successfully',
                item: updatedItem
            });
        } catch (error) {
            console.error('Error updating inventory item:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to update inventory item' },
                { status: 500 }
            );
        }
    });
}

// Delete an inventory item
export async function DELETE(request, { params }) {
    return withAuth(request, async (req, decoded) => {
        try {
            // Await params before accessing its properties
            const { id } = await params;
            await connectionToDB();

            // Find the item first to check ownership
            const existingItem = await Inventory.findOne({
                _id: id,
                organization: decoded.userId
            });

            if (!existingItem) {
                return NextResponse.json(
                    { success: false, message: 'Item not found or you do not have permission' },
                    { status: 404 }
                );
            }

            // Create a transaction record before deleting
            const transaction = new InventoryTransaction({
                item: id,
                transactionType: 'remove',
                quantity: existingItem.quantity,
                previousQuantity: existingItem.quantity,
                newQuantity: 0,
                reason: 'Item removed from inventory',
                performedBy: decoded.userId,
                organization: decoded.userId
            });

            await transaction.save();

            // Delete the item
            await Inventory.findByIdAndDelete(id);

            return NextResponse.json({
                success: true,
                message: 'Item deleted successfully'
            });
        } catch (error) {
            console.error('Error deleting inventory item:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to delete inventory item' },
                { status: 500 }
            );
        }
    });
}