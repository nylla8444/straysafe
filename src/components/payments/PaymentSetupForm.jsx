import { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function PaymentSetupForm({ applicationId, petDetails, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [qrImage, setQrImage] = useState(null);
    const [instructions, setInstructions] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setQrImage(file);

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
            if (!qrImage) {
                setError('Please upload a QR code image');
                setLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('applicationId', applicationId);
            formData.append('qrImage', qrImage);
            formData.append('paymentInstructions', instructions);

            const response = await axios.post('/api/payments/setup', formData);

            if (response.data.success) {
                onSuccess(response.data.payment);
            }
        } catch (err) {
            console.error('Failed to setup payment:', err);
            setError(err.response?.data?.error || 'Failed to setup payment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Payment for Adoption</h2>

            {petDetails && (
                <div className="mb-6 flex items-center">
                    <div className="w-16 h-16 relative rounded-md overflow-hidden mr-3">
                        {petDetails.img_arr?.length > 0 ? (
                            <Image
                                src={petDetails.img_arr[0]}
                                alt={petDetails.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="bg-gray-200 w-full h-full flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-medium">{petDetails.name}</h3>
                        <p className="text-sm text-gray-500">{petDetails.breed}</p>
                        <p className="text-sm font-medium">Adoption Fee: ₱{petDetails.adoptionFee || '0'}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment QR Code
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        {imagePreview ? (
                            <div className="space-y-1 text-center">
                                <img src={imagePreview} alt="QR Preview" className="mx-auto h-32 w-32 object-contain" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                        <span>Change QR Code</span>
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
                                        <span>Upload QR code</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Payment Instructions (Optional)
                    </label>
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows="3"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
                        placeholder="Add details like payment reference, bank name, etc."
                    ></textarea>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !qrImage}
                        className={`px-4 py-2 rounded-md text-white font-medium ${loading || !qrImage ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? 'Setting up...' : 'Set Up Payment'}
                    </button>
                </div>
            </form>
        </div>
    );
}