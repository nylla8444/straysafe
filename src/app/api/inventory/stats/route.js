import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import { Inventory } from '../../../../../models/Inventory';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Convert string ID to ObjectId
            const organizationId = new ObjectId(String(decoded.userId));

            // Basic inventory summary
            const [summary] = await Inventory.aggregate([
                { $match: { organization: organizationId } },
                {
                    $group: {
                        _id: null,
                        totalItems: { $sum: 1 },
                        totalValue: { $sum: { $multiply: ["$quantity", "$cost"] } },
                        lowStockCount: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "low_stock"] }, 1, 0]
                            }
                        },
                        outOfStockCount: {
                            $sum: {
                                $cond: [{ $eq: ["$status", "out_of_stock"] }, 1, 0]
                            }
                        }
                    }
                }
            ]);

            // Category distribution
            const categoryDistribution = await Inventory.aggregate([
                { $match: { organization: organizationId } },
                {
                    $group: {
                        _id: "$category",
                        count: { $sum: 1 },
                        value: { $sum: { $multiply: ["$quantity", "$cost"] } }
                    }
                },
                {
                    $project: {
                        category: "$_id",
                        count: 1,
                        value: 1,
                        _id: 0
                    }
                }
            ]);

            // Status distribution
            const statusDistribution = await Inventory.aggregate([
                { $match: { organization: organizationId } },
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        status: "$_id",
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return NextResponse.json({
                success: true,
                summary: summary || { totalItems: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 },
                categoryDistribution,
                statusDistribution
            });
        } catch (error) {
            console.error('Error fetching inventory statistics:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch inventory statistics' },
                { status: 500 }
            );
        }
    });
}