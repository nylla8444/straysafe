import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import PaymentStatus from './PaymentStatus';

export default function PaymentsList({ payments, userType }) {
    if (!payments || payments.length === 0) {
        return (
            <div className="text-center py-8 bg-white rounded-lg shadow">
                <div className="mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments</h3>
                <p className="text-gray-500 mb-6 px-4">You don't have any payments yet.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <ul className="divide-y divide-gray-200">
                {payments.map((payment) => (
                    <li key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <Link href={`/profile/payments/${payment._id}`} className="block p-4" aria-label={`View payment details for ${payment.petId.name}`}>
                            <div className="flex items-center space-x-4">
                                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-md overflow-hidden relative flex-shrink-0">
                                    {payment.petId.img_arr && payment.petId.img_arr.length > 0 ? (
                                        <Image
                                            src={payment.petId.img_arr[0]}
                                            alt={payment.petId.name}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="bg-gray-200 h-full w-full flex items-center justify-center">
                                            <span className="text-xs text-gray-500">No image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-grow min-w-0">
                                    <div className="flex justify-between items-start flex-wrap gap-y-1">
                                        <div className="pr-2 min-w-0">
                                            <p className="text-gray-900 font-medium truncate">{payment.petId.name}</p>
                                            <p className="text-xs sm:text-sm text-gray-500 truncate">
                                                {userType === 'adopter'
                                                    ? `${payment.organizationId.organizationName}`
                                                    : `${payment.adopterId.firstName} ${payment.adopterId.lastName}`
                                                }
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0">
                                            <PaymentStatus status={payment.status} />
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-2 gap-1">
                                        <p className="text-xs text-gray-500 order-2 sm:order-1">
                                            {format(new Date(payment.dateCreated), 'MMM d, yyyy')}
                                        </p>
                                        <div className="order-1 sm:order-2 mt-1 sm:mt-0">
                                            <p className="text-xs font-medium">
                                                <span className="text-green-600 font-medium">₱{payment.amount}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}