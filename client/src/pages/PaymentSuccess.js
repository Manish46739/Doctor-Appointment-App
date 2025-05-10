import React from 'react';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center p-4">
      <CheckCircle size={64} className="text-green-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2">Payment Successful</h1>
      <p className="text-lg text-gray-700">Thank you! Your appointment has been confirmed.</p>
    </div>
  );
};

export default PaymentSuccess;
