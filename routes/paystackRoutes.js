const express = require('express');
const router = express.Router();
const paystackController = require('../controllers/paystackController'); // Import the Paystack controller

// Route to initiate a Paystack transaction
router.post('/transaction/initiate', paystackController.initiateTransaction);
// http://localhost:5000/api/paystack/transaction/initiate
// {
//     "customerId": 7,  // customer ID
//     "amount": 2000    // Amount in Naira (50.00)
// }



// Route to verify a Paystack transaction
router.get('/transaction/verify/:reference', paystackController.verifyTransaction);
// http://localhost:5000/api/paystack/transaction/verify/kgahtsgz5r


// Route to handle Paystack payment callback
router.post('/transaction/callback', paystackController.handlePaymentCallback);
// http://localhost:5000/api/paystack/transaction/callback

// Export the routes
module.exports = router;
