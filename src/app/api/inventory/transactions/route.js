import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { InventoryTransaction } from '../../../../../models/Inventory';
import { withAuth } from '../../../../../middleware/authMiddleware';

// Get transaction history for organization
export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            const url = new URL(req.url);
            const itemId = url.searchParams.get('itemId');
            const startDate = url.searchParams.get('startDate');
            const endDate = url.searchParams.get('endDate');

            // Build query
            const query = { organization: decoded.userId };

            // Add item filter if provided
            if (itemId) {
                query.item = itemId;
            }

            // Add date range filter if provided
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) {
                    query.createdAt.$gte = new Date(startDate);
                }
                if (endDate) {
                    query.createdAt.$lte = new Date(endDate);
                }
            }

            // Fetch transactions with populated item details
            const transactions = await InventoryTransaction.find(query)
                .populate('item', 'name category itemId')
                .populate('performedBy', 'email organizationName')
                .sort({ createdAt: -1 })
                .lean();

            return NextResponse.json({
                success: true,
                transactions
            });
        } catch (error) {
            console.error('Error fetching inventory transactions:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch inventory transactions' },
                { status: 500 }
            );
        }
    });
}