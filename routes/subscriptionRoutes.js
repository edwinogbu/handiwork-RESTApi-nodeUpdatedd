const express = require('express');
const router = express.Router();
const subscriptionController = require('./../controllers/subscriptionController');

// Route to get all courses
router.get('/courses', subscriptionController.getCourses);

// Route to register a new subscriber
router.post('/register', subscriptionController.registerSubscriber);

// Route to get all subscribers
router.get('/subscribers', subscriptionController.getSubscribers);

//route to findPromoterByVoucherNumber
router.get('/promotion/verify/:voucherNumber', subscriptionController.findPromoterByVoucherNumber);

// Route to register a new promotion
router.post('/promotions/register', subscriptionController.registerPromotion);
// http://localhost:5000/api/subscription/promotions/register
// https://server.handiwork.com.ng/api/subscription/promotions/register

// {
//     "firstName": "promise",
//     "lastName": "edet",
//     "email": "edet@gmail.com",
//     "phoneNumber": "09062618405",
//     "instagramHandle": "@promiseedet",
//     "instagramUrl": "https://instagram.com/edetpromise"  
//   }
  

// Route to get all promotions
router.get('/promotions', subscriptionController.getPromotions);

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const subscriptionController = require('./../controllers/subscriptionController');

// // Route to get all courses
// router.get('/courses', subscriptionController.getCourses);

// // Route to register a new subscriber
// router.post('/register', subscriptionController.registerSubscriber);

// module.exports = router;
