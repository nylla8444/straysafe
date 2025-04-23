// Add this to your existing OrganizationVerificationCard component where you show organization details

import { useState, useEffect } from 'react';
import axios from 'axios';
import VerificationHistoryList from '../verification/VerificationHistoryList'; // Import the component we created

// Inside your component:
const [showHistory, setShowHistory] = useState(false);
const [history, setHistory] = useState([]);
const [loadingHistory, setLoadingHistory] = useState(false);

const fetchVerificationHistory = async (orgId) => {
    try {
        setLoadingHistory(true);
        const response = await axios.get(`/api/admin/organizations/${orgId}/history`, {
            withCredentials: true
        });
        setHistory(response.data.history);
    } catch (error) {
        console.error("Error fetching history:", error);
    } finally {
        setLoadingHistory(false);
    }
};

// Add this button near the verification actions:
<button
    onClick={() => {
        setShowHistory(!showHistory);
        if (!showHistory && history.length === 0) {
            fetchVerificationHistory(organization._id);
        }
    }}
    className="px-3 py-1 bg-gray-100 text-gray-800 rounded hover:bg-gray-200 text-sm ml-2"
>
    {showHistory ? 'Hide History' : 'View History'}
</button>

// And add this below the actions section:
{
    showHistory && (
        <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Verification History</h4>
            {loadingHistory ? (
                <p className="text-sm text-gray-500">Loading history...</p>
            ) : (
                <VerificationHistoryList history={history} />
            )}
        </div>
    )
}