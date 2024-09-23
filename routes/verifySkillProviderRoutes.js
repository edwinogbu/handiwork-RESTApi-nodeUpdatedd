const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifySkillProviderController = require('../controllers/VerifySkillProviderController');
const userToken = require('./../middleware/userToken');


// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Uploads will be stored in the 'uploads' directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique filename
        cb(null, uniqueSuffix + '-' + file.originalname); // Filename format: <timestamp>-<originalname>
    }
});

// File filter to accept only DOC, PDF, TXT, and specified image file formats
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'application/msword', // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
        'application/pdf', // PDF
        'text/plain', // TXT
        'image/jpeg', // JPG
        'image/png', // PNG
        'image/gif', // GIF
        'image/webp', // WEBP
        'image/tiff', // TIFF
        'image/vnd.adobe.photoshop', // PSD
        'image/x-raw', // RAW
        'image/bmp', // BMP
        'image/heif', // HEIF
        'image/x-indesign', // INDD
        'image/jp2', // JPEG 2000
        'image/svg+xml', // SVG
        'application/postscript', // AI
        'application/eps', // EPS
        'application/octet-stream' // PDF
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only DOC, PDF, TXT, JPG, PNG, GIF, WEBP, TIFF, PSD, RAW, BMP, HEIF, INDD, JPEG 2000, SVG, AI, EPS, and PDF files are allowed'), false);
    }
};

// Multer upload instance for handling file uploads
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Middleware function to handle file uploads
const uploadMiddleware = upload.single('cacImage');

// Routes for verified skill providers
router.post('/create',  uploadMiddleware, verifySkillProviderController.createVerifySkillProvider);
router.get('/view/:id', verifySkillProviderController.getVerifySkillProviderById);
router.get('/allVerifiedProviders/',  verifySkillProviderController.getAllVerifySkillProviders);
router.put('/update/:id',  uploadMiddleware, verifySkillProviderController.updateVerifySkillProvider);
router.delete('/delete/:id',userToken, verifySkillProviderController.deleteVerifySkillProvider);


// Route to get skill provider details by ID
router.get('/verify-skill-details/:id', verifySkillProviderController.getVerifySkillProviderDetailsById);
// Route to update skill provider details
router.put('/updateSkillAndVerify/:id',  uploadMiddleware, verifySkillProviderController.updateSkillProviderDetails);
// router.put('/updateSocials/:id', verifySkillProviderController.addSocialMedia);

router.get('/verify/:id', uploadMiddleware, verifySkillProviderController.checkVerificationStatus);


// Route to update the CAC image path
router.put('/updateCacImage/:id', uploadMiddleware, verifySkillProviderController.updateCACImage);

// Route to view all CAC uploaded images
router.get('/viewCacImage/cac', verifySkillProviderController.viewAllCAC);

// Route to delete a CAC image
router.delete('/deleteCacImage/:id', verifySkillProviderController.deleteCAC);

// Route to create a new entry in verify_skill_providers table with CAC image file
router.post('/createCacImage',  uploadMiddleware, verifySkillProviderController.createSkillProviderCAC);

// Route to create a new entry in verify_skill_providers table with CAC image file
router.put('/change-verify-status/:id', verifySkillProviderController.toggleVerificationStatus);


router.put('/change-verifyStatus/:providerId', verifySkillProviderController.toggleVerificationStatusWithproviderId);

// This endpoint offers a way to dynamically modify verification statuses for skill providers based on their unique providerId, providing a straightforward means to manage verification processes.
router.put('/verification-status/:providerId', verifySkillProviderController.toggleVerificationStatusWithproviderId);


// Route to handle GET request for unverified skill providers
router.get('/unverified-skill-providers', verifySkillProviderController.getUnverifiedSkillProviders);

// Route to get skill providers with their verification details
router.get('/skillProviders-verificationDetails', verifySkillProviderController.getSkillProvidersWithVerificationDetails);


router.get('/verify-skillProvider-details/:providerId', verifySkillProviderController.getVerifiedSkillDetails);

// where the is verified is pending
router.get('/verifySkillProvider-details', verifySkillProviderController.getAllVerifiedSkillProviders);

// where the is verified is accepted
router.get('/allVerifiedSkillProvidersWithDetails', verifySkillProviderController.getAllVerifiedSkillProvidersWithDetails);
// http://localhost:5000/api/verify-providers/allVerifiedSkillProvidersWithDetails
// https://handiworks.cosmossound.com.ng/api/verify-providers/allVerifiedSkillProvidersWithDetails

module.exports = router;


// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const verifySkillProviderController = require('../controllers/VerifySkillProviderController');

// // Multer storage configuration
// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, 'uploads/'); // Uploads will be stored in the 'uploads' directory
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); // Generate a unique filename
//         cb(null, uniqueSuffix + '-' + file.originalname); // Filename format: <timestamp>-<originalname>
//     }
// });

// // File filter to accept only image files
// const fileFilter = (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//         cb(null, true);
//     } else {
//         cb(new Error('Only image files are allowed'), false);
//     }
// };

// // Multer upload instance for handling image uploads
// const upload = multer({ storage: storage, fileFilter: fileFilter });

// // Middleware function to handle image uploads
// const uploadMiddleware = upload.single('cacImage');

// // Routes for verified skill providers
// router.post('/create', uploadMiddleware, verifySkillProviderController.createVerifySkillProvider);
// router.get('/view/:id', verifySkillProviderController.getVerifySkillProviderById);
// router.get('/allVerifiedProviders/', verifySkillProviderController.getAllVerifySkillProviders);
// router.put('/update/:id', uploadMiddleware, verifySkillProviderController.updateVerifySkillProvider);
// router.delete('/delete/:id', verifySkillProviderController.deleteVerifySkillProvider);

// module.exports = router;
