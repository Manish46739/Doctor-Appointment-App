require("dotenv").config(); // ← Add this as the first line

const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { appointmentId, amount, userEmail, doctorId, userId, date, time } = req.body;

    if (!amount || !userEmail || !doctorId || !userId || !date || !time) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    console.log("Received payment request:", req.body);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Appointment with Doctor ${doctorId}`,
            },
            unit_amount: amount, // amount should be in paise (₹100 = 10000)
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/payment-success`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        appointmentId,
        doctorId,
        userId,
        date,
        time,
      },
    });

    res.status(200).json({ id: session.id });
 
  } catch (err) {
    console.error("Stripe session creation error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
  
  }
);

module.exports = router;
