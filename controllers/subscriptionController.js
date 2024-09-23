const subscriptionService = require('./../services/subscriptionService');

const subscriptionController = {};

// Get all courses
async function getCourses(req, res) {
    try {
        const courses = await subscriptionService.getCourses();
        if (courses.length === 0) {
            return res.status(404).json({ message: 'No courses found' });
        }
        res.status(200).json(courses);
    } catch (error) {
        console.error(`Error retrieving courses: ${error.message}`);
        res.status(500).json({ message: 'An error occurred while retrieving courses', error: error.message });
    }
}

// Register a new subscriber
async function registerSubscriber(req, res) {
    const { firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !preferredCourse || !voucherNumber) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const result = await subscriptionService.registerSubscriber(firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber);
        res.status(201).json({
            message: 'Subscriber registered successfully',
            subscriberDetails: result,
            voucherDetails: {
                voucherNumber: result.voucherNumber
            }
        });
    } catch (error) {
        console.error(`Error registering subscriber: ${error.message}`);
        res.status(500).json({ message: 'An error occurred while registering the subscriber', error: error.message });
    }
}

// Get all subscribers
async function getSubscribers(req, res) {
    try {
        const subscribers = await subscriptionService.getSubscribers();
        if (subscribers.length === 0) {
            return res.status(404).json({ message: 'No subscribers found' });
        }
        res.status(200).json(subscribers);
    } catch (error) {
        console.error(`Error retrieving subscribers: ${error.message}`);
        res.status(500).json({ message: 'An error occurred while retrieving subscribers', error: error.message });
    }
}

// Register a new promotion
async function registerPromotion(req, res) {
    const { firstName, lastName, email, phoneNumber, instagramHandle, instagramUrl } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !instagramHandle || !instagramUrl) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const result = await subscriptionService.registerPromotion(firstName, lastName, email, phoneNumber, instagramHandle, instagramUrl);
        res.status(201).json({
            message: 'Promotion registered successfully',
            promotionDetails: result,
            voucherNumber: result.voucherNumber
        });
    } catch (error) {
        console.error(`Error registering promotion: ${error.message}`);
        res.status(500).json({ message: 'An error occurred while registering the promotion', error: error.message });
    }
}

// Get all promotions
async function getPromotions(req, res) {
    try {
        const promotions = await subscriptionService.getPromotions();
        if (promotions.length === 0) {
            return res.status(404).json({ message: 'No promotions found' });
        }
        res.status(200).json(promotions);
    } catch (error) {
        console.error(`Error retrieving promotions: ${error.message}`);
        res.status(500).json({ message: 'An error occurred while retrieving promotions', error: error.message });
    }
}


async function findPromoterByVoucherNumber(req, res) {
    try {
        const voucherNumber = req.params.voucherNumber;
        const result = await subscriptionService.findPromoterByVoucherNumber(voucherNumber);

        if (!result.success) {
            return res.status(404).json({ success: false, error: result.message });
        }

        res.status(200).json({ success: true, promoter: result.promoter });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


module.exports = {
    getCourses,
    registerSubscriber,
    getSubscribers,    // New method to get subscribers
    registerPromotion, // New method to register a promotion
    getPromotions,      // New method to get promotions
    findPromoterByVoucherNumber,
};


// const subscriptionService = require('./../services/subscriptionService');

// const subscriptionController = {};

// // Get all courses
// async function getCourses(req, res) {
//     try {
//         const courses = await subscriptionService.getCourses();
//         if (courses.length === 0) {
//             return res.status(404).json({ message: 'No courses found' });
//         }
//         res.status(200).json(courses);
//     } catch (error) {
//         console.error(`Error retrieving courses: ${error.message}`);
//         res.status(500).json({ message: 'An error occurred while retrieving courses', error: error.message });
//     }
// }

// // Register a new subscriber
// async function registerSubscriber(req, res) {
//     const { firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber } = req.body;

//     if (!firstName || !lastName || !email || !phoneNumber || !preferredCourse || !voucherNumber) {
//         return res.status(400).json({ message: 'All fields are required' });
//     }

//     try {
//         const result = await subscriptionService.registerSubscriber(firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber);
//         res.status(201).json({
//             message: 'Subscriber registered successfully',
//             subscriberDetails: result,
//             voucherDetails: {
//                 voucherNumber: result.voucherNumber,
//                 discountedPrice: result.discountedPrice
//             }
//         });
//     } catch (error) {
//         console.error(`Error registering subscriber: ${error.message}`);
//         res.status(500).json({ message: 'An error occurred while registering the subscriber', error: error.message });
//     }
// }

// module.exports = {
//     getCourses,
//     registerSubscriber
// };
