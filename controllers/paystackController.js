const paystackService = require('../services/paystackService'); // Import the Paystack service 

// Controller to initiate a transaction
const initiateTransaction = async (req, res) => {
    const { customerId, amount } = req.body; // Now expecting customerId

    if (!customerId || !amount) {
        return res.status(400).json({
            success: false,
            message: 'Customer ID and amount are required.'
        });
    }

    try {
        const transactionData = await paystackService.initiateTransaction(customerId, amount);
        res.status(200).json({
            success: true,
            data: transactionData,
            message: 'Transaction initiated successfully.'
        });
    } catch (error) {
        if (error.message.includes('Customer not found')) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found.'
            });
        }
        if (error.message.includes('Failed to initiate transaction')) {
            return res.status(400).json({
                success: false,
                message: 'Failed to initiate transaction.'
            });
        }
        res.status(500).json({
            success: false,
            message: `Database Error: ${error.message}`
        });
    }
};

// Controller to verify a transaction
const verifyTransaction = async (req, res) => {
    const { reference } = req.params;

    if (!reference) {
        return res.status(400).json({
            success: false,
            message: 'Transaction reference is required.'
        });
    }

    try {
        const transactionDetails = await paystackService.verifyTransaction(reference);
        res.status(200).json({
            success: true,
            data: transactionDetails,
            message: 'Transaction verified successfully.'
        });
    } catch (error) {
        if (error.message.includes('Transaction not found')) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found or verification failed.'
            });
        }
        res.status(500).json({
            success: false,
            message: `Paystack Verification Error: ${error.message}`
        });
    }
};

// Controller to handle payment callback
const handlePaymentCallback = async (req, res) => {
    const transactionData = req.body;

    if (!transactionData) {
        return res.status(400).json({
            success: false,
            message: 'Transaction data is required.'
        });
    }

    try {
        const result = await paystackService.handlePaymentCallback(transactionData);
        res.status(200).json({
            success: true,
            data: result,
            message: 'Payment processed successfully.'
        });
    } catch (error) {
        if (error.message.includes('Payment was not successful')) {
            return res.status(400).json({
                success: false,
                message: 'Payment was not successful.'
            });
        }
        res.status(500).json({
            success: false,
            message: `Payment Processing Error: ${error.message}`
        });
    }
};



// Export the controllers
module.exports = {
    initiateTransaction,
    verifyTransaction,
    handlePaymentCallback,
};


// const paystackService = require('../services/paystackService'); // Import the Paystack service

// // Controller to initiate a transaction
// const initiateTransaction = async (req, res) => {
//     const { customerId, amount } = req.body; // Now expecting customerId

//     try {
//         const transactionData = await paystackService.initiateTransaction(customerId, amount);
//         res.status(200).json({ success: true, data: transactionData });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Controller to verify a transaction
// const verifyTransaction = async (req, res) => {
//     const { reference } = req.params;

//     try {
//         const transactionDetails = await paystackService.verifyTransaction(reference);
//         res.status(200).json({ success: true, data: transactionDetails });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Controller to handle payment callback
// const handlePaymentCallback = async (req, res) => {
//     const transactionData = req.body;

//     try {
//         const result = await paystackService.handlePaymentCallback(transactionData);
//         res.status(200).json({ success: true, data: result });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Export the controllers
// module.exports = {
//     initiateTransaction,
//     verifyTransaction,
//     handlePaymentCallback,
// };


// const paystackService = require('../services/paystackService'); // Import the Paystack service

// // Controller to initiate a transaction
// const initiateTransaction = async (req, res) => {
//     const { amount, email, fullName } = req.body;

//     try {
//         const transactionData = await paystackService.initiateTransaction(amount, email, fullName);
//         res.status(200).json({ success: true, data: transactionData });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Controller to verify a transaction
// const verifyTransaction = async (req, res) => {
//     const { reference } = req.params;

//     try {
//         const transactionDetails = await paystackService.verifyTransaction(reference);
//         res.status(200).json({ success: true, data: transactionDetails });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Controller to handle payment callback
// const handlePaymentCallback = async (req, res) => {
//     const transactionData = req.body;

//     try {
//         const result = await paystackService.handlePaymentCallback(transactionData);
//         res.status(200).json({ success: true, data: result });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// // Export the controllers
// module.exports = {
//     initiateTransaction,
//     verifyTransaction,
//     handlePaymentCallback,
// };
