const customerReviewService = require('../services/customerReviewService');
const customerService = require('../services/customerService');

async function createCustomerReview(req, res) {
    try {
        const { customerId, rating, comment } = req.body;

        // Check if the customer exists
        const customerExists = await customerService.customerExists(customerId);
        if (!customerExists) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Create a new customer review
        const newReview = await customerReviewService.createCustomerReview({ customerId, rating, comment });

        // Return success response with the newly created review data
        res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCustomerReviews(req, res) {
    try {
        const customerId = req.params.customerId;

        // Check if the customer exists
        const customerExists = await customerService.customerExists(customerId);
        if (!customerExists) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Get all reviews for a customer
        const reviews = await customerReviewService.getCustomerReviewsByCustomerId(customerId);

        // Return success response with the reviews data
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateCustomerReview(req, res) {
    try {
        const reviewId = req.params.reviewId;
        const { rating, comment } = req.body;

        // Update customer review
        const updatedReview = await customerReviewService.updateCustomerReview(reviewId, { rating, comment });

        // Return success response with the updated review data
        res.status(200).json({ success: true, review: updatedReview });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteCustomerReview(req, res) {
    try {
        const reviewId = req.params.reviewId;

        // Delete customer review
        await customerReviewService.deleteCustomerReview(reviewId);

        // Return success response
        res.status(200).json({ success: true, message: 'Customer review deleted successfully' });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCustomerDetailsAndReviews(req, res) {
    try {
        const customerId = req.params.customerId;

        // Fetch customer details and reviews
        const result = await customerReviewService.customerDetailsAndReviews(customerId);

        // Return success response with combined data
        res.status(200).json({ success: true, customerDetailsAndReviews: result });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    createCustomerReview,
    getCustomerReviews,
    updateCustomerReview,
    deleteCustomerReview,
    getCustomerDetailsAndReviews,
};


// const customerReviewService = require('../services/customerReviewService');
// const customerService = require('../services/customerService');

// async function createCustomerReview(req, res) {
//     try {
//         const { customerId, rating, comment } = req.body;

//         // Check if the customer exists
//         const customerExists = await customerService.customerExists(customerId);
//         if (!customerExists) {
//             return res.status(404).json({ success: false, error: 'Customer not found' });
//         }

//         // Create a new customer review
//         const newReview = await customerReviewService.createCustomerReview({ customerId, rating, comment });

//         // Return success response with the newly created review data
//         res.status(201).json({ success: true, review: newReview });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCustomerReviews(req, res) {
//     try {
//         const customerId = req.params.customerId;

//         // Check if the customer exists
//         const customerExists = await customerService.customerExists(customerId);
//         if (!customerExists) {
//             return res.status(404).json({ success: false, error: 'Customer not found' });
//         }

//         // Get all reviews for a customer
//         const reviews = await customerReviewService.getCustomerReviewsByCustomerId(customerId);

//         // Return success response with the reviews data
//         res.status(200).json({ success: true, reviews });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateCustomerReview(req, res) {
//     try {
//         const reviewId = req.params.reviewId;
//         const { rating, comment } = req.body;

//         // Update customer review
//         const updatedReview = await customerReviewService.updateCustomerReview(reviewId, { rating, comment });

//         // Return success response with the updated review data
//         res.status(200).json({ success: true, review: updatedReview });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteCustomerReview(req, res) {
//     try {
//         const reviewId = req.params.reviewId;

//         // Delete customer review
//         await customerReviewService.deleteCustomerReview(reviewId);

//         // Return success response
//         res.status(200).json({ success: true, message: 'Customer review deleted successfully' });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCustomerDetailsAndReviews(req, res) {
//     try {
//         const customerId = req.params.customerId;

//         // Fetch customer details and reviews
//         const result = await customerReviewService.customerDetailsAndReviews(customerId);

//         // Return success response with combined data
//         res.status(200).json({ success: true, customerDetailsAndReviews: result });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createCustomerReview,
//     getCustomerReviews,
//     updateCustomerReview,
//     deleteCustomerReview,
//     getCustomerDetailsAndReviews,
// };


// const customerReviewService = require('../services/customerReviewService');
// const customerService = require('../services/customerService');

// async function createCustomerReview(req, res) {
//     try {
//         const { customerId, rating, comment } = req.body;

//         // Check if the customer exists
//         const customerExists = await customerService.customerExists(customerId);
//         if (!customerExists) {
//             return res.status(404).json({ success: false, error: 'Customer not found' });
//         }

//         // Create a new customer review
//         const newReview = await customerReviewService.createCustomerReview({ customerId, rating, comment });

//         // Return success response with the newly created review data
//         res.status(201).json({ success: true, review: newReview });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCustomerReviews(req, res) {
//     try {
//         const customerId = req.params.customerId;
        
//         // Check if the customer exists
//         const customerExists = await customerService.customerExists(customerId);
//         if (!customerExists) {
//             return res.status(404).json({ success: false, error: 'Customer not found' });
//         }

//         // Get all reviews for a customer
//         const reviews = await customerReviewService.getCustomerReviewsByCustomerId(customerId);

//         // Return success response with the reviews data
//         res.status(200).json({ success: true, reviews });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateCustomerReview(req, res) {
//     try {
//         const reviewId = req.params.reviewId;
//         const { rating, comment } = req.body;

//         // Update customer review
//         const updatedReview = await customerReviewService.updateCustomerReview(reviewId, { rating, comment });

//         // Return success response with the updated review data
//         res.status(200).json({ success: true, review: updatedReview });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteCustomerReview(req, res) {
//     try {
//         const reviewId = req.params.reviewId;

//         // Delete customer review
//         await customerReviewService.deleteCustomerReview(reviewId);

//         // Return success response
//         res.status(200).json({ success: true, message: 'Customer review deleted successfully' });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createCustomerReview,
//     getCustomerReviews,
//     updateCustomerReview,
//     deleteCustomerReview
// };
