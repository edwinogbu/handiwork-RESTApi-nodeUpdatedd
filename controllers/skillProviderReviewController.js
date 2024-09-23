const skillProviderReviewService = require('../services/skillProviderReviewService');
const customerService = require('../services/customerService');

async function createSkillProviderReview(req, res) {
    try {
        const { skillProviderId, customerId, rating, comment } = req.body;

        // Check if the skill provider exists (you should have a skillProviderService or similar)
        // const skillProviderExists = await skillProviderService.skillProviderExists(skillProviderId);
        // Replace the above with appropriate logic based on your application

        // For demonstration purpose, skipping skill provider existence check assuming it exists
        // Create a new skill provider review
        const newReview = await skillProviderReviewService.createSkillProviderReview({ skillProviderId, customerId, rating, comment });

        // Return success response with the newly created review data
        res.status(201).json({ success: true, review: newReview });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getSkillProviderReviews(req, res) {
    try {
        const skillProviderId = req.params.skillProviderId;

        // Get all reviews for a skill provider
        const reviews = await skillProviderReviewService.getSkillProviderReviewsBySkillProviderId(skillProviderId);

        // Return success response with the reviews data
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateSkillProviderReview(req, res) {
    try {
        const reviewId = req.params.reviewId;
        const { rating, comment } = req.body;

        // Update skill provider review
        const updatedReview = await skillProviderReviewService.updateSkillProviderReview(reviewId, { rating, comment });

        // Return success response with the updated review data
        res.status(200).json({ success: true, review: updatedReview });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteSkillProviderReview(req, res) {
    try {
        const reviewId = req.params.reviewId;

        // Delete skill provider review
        await skillProviderReviewService.deleteSkillProviderReview(reviewId);

        // Return success response
        res.status(200).json({ success: true, message: 'Skill provider review deleted successfully' });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function getSkillProviderDetailsAndReviews(req, res) {
    try {
        const skillProviderId = req.params.skillProviderId;

        // Fetch skill provider details and customer reviews
        const result = await skillProviderReviewService.getSkillProviderDetailsAndReviews(skillProviderId);

        // Format the response data
        const formattedResponse = {
            skillProvider: {
                id: result.id,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                phone: result.phone,
                secondPhone: result.secondPhone,
                stateOfResidence: result.stateOfResidence,
                city: result.city,
                street: result.street,
                address: result.address,
                serviceType: result.serviceType,
                about: result.about,
                skills: result.skills,
                subCategory: result.subCategory,
                openingHour: result.openingHour,
                referralCode: result.referralCode,
                imagePath: result.imagePath,
                isVerified: result.isVerified,
                latitude: result.latitude,
                longitude: result.longitude
            },
            reviews: result.reviews.map(review => ({
                id: review.id,
                customerId: review.customerId,
                customerName: review.customerName,
                customerEmail: review.customerEmail,
                customerPhone: review.customerPhone,
                customerAddress: review.customerAddress,
                rating: review.rating,
                comment: review.comment,
                createdAt: review.createdAt
            }))
        };

        // Return success response with formatted data
        res.status(200).json({ success: true, skillProviderDetailsAndReviews: formattedResponse });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function calculateAverageRating(req, res) {
    try {
        const skillProviderId = req.params.skillProviderId;

        // Get all reviews for a skill provider
        const reviews = await skillProviderReviewService.calculateAverageRating(skillProviderId);

        // Return success response with the reviews data
        res.status(200).json({ success: true, reviews });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


module.exports = {
    createSkillProviderReview,
    getSkillProviderReviews,
    updateSkillProviderReview,
    deleteSkillProviderReview,
    getSkillProviderDetailsAndReviews,
    calculateAverageRating,
};
