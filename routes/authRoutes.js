

// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');
// const cache = require('memory-cache');

// // Route to authenticate user
// router.post('/login', authController.authenticateUser, clearCacheForAllRoutes);

// // Route to register new user
// router.post('/register', authController.registerUser);

// // Route to request password reset
// router.post('/forgot-password', authController.requestPasswordReset);

// // Route to reset password
// router.post('/reset-password', authController.resetPassword);

// // Route to get all users
// router.get('/users', cacheMiddleware(), authController.getAllUsers);

// module.exports = router;

// // Middleware to handle caching
// function cacheMiddleware() {
//     return (req, res, next) => {
//         const key = req.originalUrl || req.url;
//         const cachedData = cache.get(key);
//         if (cachedData) {
//             return res.status(200).json(cachedData);
//         }
//         // If not found in cache, proceed to the route handler
//         next();
//     };
// }

// // Middleware to clear cache for all routes
// function clearCacheForAllRoutes(req, res, next) {
//     cache.clear();
//     next();
// }



const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cache = require('memory-cache');


// Route to authenticate user general purpose admin
router.post('/handiwork-admin/login', authController.AdminAuthentication);
// http://localhost:5000/api/auth/handiwork-admin/login
// https://handiworks.cosmossound.com.ng/api/auth/handiwork-admin/login
// {
//     "emailOrPhone": "props@gmail.com",
//     "password": "654321"
//   }
  

// Route to authenticate user general purpose
router.post('/login', authController.authenticateUser);
router.post('/admin/signin', authController.signInAuthentication);


// Route to authenticate customer user
router.post('/login/customer', authController.authenticateCustomer);
router.post('/customer/change-password', authController.changeCustomerPassword);


// Route to authenticate skill provider user
router.post('/login/skill-provider', authController.authenticateSkillProvider);
router.post('/skill-provider/change-password', authController.changeSkillProviderPassword);

// This is to handle any issue where the users register without email and need a password reset
router.put('/create-defaultEmail/:id', authController.createDefaultEmail);
router.get('/read-defaultEmail', authController.readDefaultEmail);
router.put('/update-defaultEmail/:id', authController.updateDefaultEmail);


// Route to register new user
router.post('/register', authController.registerUser);
router.post('/admin/registration', authController.registerUserWithEmailVerification);
router.post('/admin/signup', authController.registerUserWithOutEmailVerification);

// Route for handling email verification
router.get('/verify-email/:token', authController.handleEmailVerification);

// router.get('/verify-email/:token', authController.verifyEmail);
// change user password
router.post('/change-password', authController.changePassword);
router.post('/request-password-reset', authController.requestPasswordReset );
router.post('/reset-password', authController.resetPassword );
// http://localhost:5000/api/auth/change-password
// https://handiworks.cosmossound.com.ng/api/verify-providers/allVerifiedSkillProvidersWithDetails
// https://handiworks.cosmossound.com.ng/api/auth/change-password
// {
//     "userId": "2",
//     "currentPassword": "123456",
//     "newPassword": "654321"
//   }
  

// https://handiworks.cosmossound.com.ng/api/auth/request-password-reset
// https://handiworks.cosmossound.com.ng/api/auth/reset-password

// Route to request password reset
router.post('/forgot-password', authController.requestPasswordReset);

// Route to reset password
router.post('/reset-password', authController.resetPassword);

// Route to get all users
router.get('/users', cacheMiddleware(), authController.getAllUsers);

// Route to verify OTP
router.post('/verify-otp', authController.verifyOTP);

router.put('/admin-verify-approval/:id', authController.toggleApprovalStatusWithUserId);
router.get('/verify-emailApproval/:id', authController.changeEmailVerificationStatusById);
router.get('/view-user/:id', authController.getUserById);


// Routes
router.put('/updateUser/:id', authController.updateUser);
router.patch('/updateUserByField/:id', authController.updateUser);
router.get('/viewUser/:id', authController.viewUserById);
router.delete('/deleteUser/:id', authController.deleteUser);

module.exports = router;

// Middleware to handle caching
function cacheMiddleware() {
    return (req, res, next) => {
        const key = req.originalUrl || req.url;
        const cachedData = cache.get(key);
        if (cachedData) {
            return res.status(200).json(cachedData);
        }
        // If not found in cache, proceed to the route handler
        next();
    };
}





// const express = require('express');
// const router = express.Router();
// const authController = require('../controllers/authController');

// const userToken = require('./../middleware/userToken');
// // Route to signup
// router.post('/signup', authController.signup);

// // Route to login
// router.post('/login', authController.login);
// router.get('/users', authController.getAllUsers);

// // Add more authentication-related routes as needed

// module.exports = router;
