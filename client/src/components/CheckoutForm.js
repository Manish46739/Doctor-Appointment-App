import React, { useEffect } from 'react';
import { useStripe } from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();

  const handleClick = async () => {
    const res = await fetch('/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointmentId: '1234',
        amount: 50, // $50
        userEmail: 'user@example.com',
      }),
    });

    const data = await res.json();
    const result = await stripe.redirectToCheckout({ sessionId: data.id });

    if (result.error) {
      console.error(result.error.message);
    }
  };

  return <button onClick={handleClick}>Pay $50</button>;
}

export default CheckoutForm;
