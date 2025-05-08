import { useState, useEffect } from 'react';
import axios from 'axios';
import PaymentsList from './PaymentsList';

export default function PaymentsSection({ userId, userType }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/payments');
        if (response.data.success) {
          setPayments(response.data.payments);
        }
      } catch (err) {
        console.error('Failed to fetch payments:', err);
        setError('Failed to load your payments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return <PaymentsList payments={payments} userType={userType} />;
}