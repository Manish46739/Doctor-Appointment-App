import React from 'react';
import { XCircle } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <XCircle size={64} className="text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
      <p className="text-lg text-gray-700">It looks like you cancelled the payment. Please try again if needed.</p>
    </div>
  );
};

export default PaymentCancel;
