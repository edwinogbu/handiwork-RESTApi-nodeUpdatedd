const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const multer = require('multer');
const fs = require('fs');

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
const uploadMiddleware = upload.single('certificate_file_path');


// Route to create a new certificate
// http://localhost:5000/api/certificates
router.post('/certificates',  uploadMiddleware, certificateController.createCertificate);

// Route to get a certificate by ID
// http://localhost:5000/api/certificates/1
router.get('/certificates/:id', certificateController.getCertificateById);

// Route to find a certificate by its number
router.get('/certificates/number/:certificateNumber', certificateController.findCertificateByNumber);
// http://localhost:5000/api/certificates/number/10002345

module.exports = router;
