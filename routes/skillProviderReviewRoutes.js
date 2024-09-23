const express = require('express');
const router = express.Router();
const skillProviderReviewController = require('../controllers/skillProviderReviewController');

// POST /api/skill-provider-reviews/create-review
router.post('/create-review', skillProviderReviewController.createSkillProviderReview);
// http://localhost:5000/api/skill-provider-reviews/create-review
// https://handiworks.cosmossound.com.ng/api/skill-provider-reviews/create-review
// {
//     "skillProviderId": 1,
//     "customerId": 1,
//     "rating": 5,
//     "comment": "Working Excellent service!"
//   }
  

// GET /api/skill-providers/:skillProviderId/reviews
router.get('/view/:skillProviderId', skillProviderReviewController.getSkillProviderReviews);

// PUT /api/skill-provider-reviews/:reviewId
router.put('/update-reviews/:reviewId', skillProviderReviewController.updateSkillProviderReview);

// DELETE /api/skill-provider-reviews/:reviewId
router.delete('/delete-reviews/:reviewId', skillProviderReviewController.deleteSkillProviderReview);

// GET /api/skill-providers/:skillProviderId/details-reviews
// http://localhost:5000/api/skill-provider-reviews/details/1
// https://handiworks.cosmossound.com.ng/api/skill-provider-reviews/details/skillProviderId
router.get('/details/:skillProviderId', skillProviderReviewController.getSkillProviderDetailsAndReviews);

// GET /api/skill-providers/averageRating/:skillProviderId
// http://localhost:5000/api/skill-provider-reviews/averageRating/1
// https://handiworks.cosmossound.com.ng/api/skill-provider-reviews/averageRating/skillProviderId
router.get('/averageRating/:skillProviderId', skillProviderReviewController.calculateAverageRating);

module.exports = router;
