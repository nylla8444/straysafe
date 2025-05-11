import { NextResponse } from 'next/server';
import connectionToDB from '../../../../../lib/mongoose';
import CashDonation from '../../../../../models/CashDonation';
import { withAuth } from '../../../../../middleware/authMiddleware';
import { ObjectId } from 'mongodb';

export async function GET(request) {
    return withAuth(request, async (req, decoded) => {
        try {
            await connectionToDB();

            // Convert string ID to ObjectId
            const organizationId = new ObjectId(String(decoded.userId));

            // Basic summary statistics
            const [summary] = await CashDonation.aggregate([
                { $match: { organization: organizationId } },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        averageAmount: { $avg: "$amount" }
                    }
                }
            ]);

            // Monthly donation data
            const monthlyData = await CashDonation.aggregate([
                { $match: { organization: organizationId } },
                {
                    $project: {
                        month: { $dateToString: { format: "%Y-%m-01", date: "$donationDate" } },
                        amount: "$amount"
                    }
                },
                {
                    $group: {
                        _id: "$month",
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } },
                {
                    $project: {
                        month: "$_id",
                        amount: 1,
                        count: 1,
                        _id: 0
                    }
                },
                { $limit: 12 }
            ]);

            // Purpose distribution
            const purposeDistribution = await CashDonation.aggregate([
                { $match: { organization: organizationId } },
                {
                    $group: {
                        _id: "$purpose",
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        purpose: "$_id",
                        amount: 1,
                        count: 1,
                        _id: 0
                    }
                }
            ]);

            return NextResponse.json({
                success: true,
                summary: summary || { count: 0, totalAmount: 0, averageAmount: 0 },
                monthlyData,
                purposeDistribution
            });
        } catch (error) {
            console.error('Error fetching donation statistics:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to fetch donation statistics' },
                { status: 500 }
            );
        }
    });
}