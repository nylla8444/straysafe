import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function PaymentSubmissionForm({ payment, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [transactionId, setTransactionId] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!proofImage) {
        setError('Please upload proof of payment');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('paymentId', payment._id);
      formData.append('proofImage', proofImage);
      formData.append('transactionId', transactionId);

      const response = await axios.post('/api/payments/submit', formData);
      
      if (response.data.success) {
        onSuccess(response.data.payment);
      }
    } catch (err) {
      console.error('Failed to submit payment proof:', err);
      setError(err.response?.data?.error || 'Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Submit Payment Proof</h2>
      
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-2">Payment Instructions</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Please make your payment using the QR code below:</p>
            <div className="flex justify-center">
              <div className="w-48 h-48 relative">
                <Image 
                  src={payment.qrImage} 
                  alt="Payment QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
          
          {payment.paymentInstructions && (
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {payment.paymentInstructions}
            </div>
          )}
          
          <div className="mt-4 text-center">
            <p className="font-medium">Amount to pay: ₱{payment.amount}</p>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Transaction ID/Reference Number (Optional)
          </label>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
            placeholder="Enter transaction reference"
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Proof Screenshot/Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {imagePreview ? (
              <div className="space-y-1 text-center">
                <img src={imagePreview} alt="Proof Preview" className="mx-auto h-32 object-contain" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Change image</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload image</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !proofImage}
            className={`px-4 py-2 rounded-md text-white font-medium ${loading || !proofImage ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Submitting...' : 'Submit Payment Proof'}
          </button>
        </div>
      </form>
    </div>
  );
}