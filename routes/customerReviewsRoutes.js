const express = require('express');
const router = express.Router();
const customerReviewController = require('../controllers/customerReviewController');

// POST /api/customer-reviews/create-review
router.post('/create-review', customerReviewController.createCustomerReview);

// GET /api/customer-reviews/view/:customerId
router.get('/view/:customerId', customerReviewController.getCustomerReviews);

// PUT /api/customer-reviews/update-reviews/:reviewId
router.put('/update-reviews/:reviewId', customerReviewController.updateCustomerReview);

// DELETE /api/customer-reviews/delete-reviews/:reviewId
router.delete('/delete-reviews/:reviewId', customerReviewController.deleteCustomerReview);

// GET /api/customer-reviews/details-and-reviews/:customerId
router.get('/details-and-reviews/:customerId', customerReviewController.getCustomerDetailsAndReviews);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const customerReviewController = require('../controllers/customerReviewController');

// // POST /api/customer-reviews
// router.post('/create-review', customerReviewController.createCustomerReview);

// // GET /api/customers/:customerId/reviews
// router.get('/view/:customerId', customerReviewController.getCustomerReviews);

// // PUT /api/customer-reviews/:reviewId
// router.put('/update-reviews/:reviewId', customerReviewController.updateCustomerReview);

// // DELETE /api/customer-reviews/:reviewId
// router.delete('/delete-reviews/:reviewId', customerReviewController.deleteCustomerReview);

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const customerReviewController = require('../controllers/customerReviewController');

// router.post('/create-customerReview', customerReviewController.createCustomerReview);
// router.get('/get-customerReviews', customerReviewController.getCustomerReviews);
// router.post('/update-customerReview/:id', customerReviewController.updateCustomerReview);
// router.put('/delete-customerReview/:id', customerReviewController.deleteCustomerReview);


// module.exports = router;
