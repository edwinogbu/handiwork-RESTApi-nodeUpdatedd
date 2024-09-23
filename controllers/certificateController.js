// const certificateService = require('../services/certificateService');

// async function createCertificate(req, res) {
//     try {
//         const { student_name, course, certificate_number, issued_date } = req.body;

//         // Check if an image file is uploaded
//         const certificate_file_path = req.file ? req.file.path : null;

//         // If no image file is uploaded, return an error response
//         if (!certificate_file_path) {
//             return res.status(400).json({ success: false, error: 'Certificate image file is required.' });
//         }

//         // Call the service to add a new certificate
//         const result = await certificateService.addCertificate({
//             student_name,
//             course,
//             certificate_number,
//             certificate_file_path,
//             issued_date
//         });

//         // Handle service response
//         if (!result.success) {
//             return res.status(500).json({ success: false, error: result.message });
//         }

//         res.status(201).json({ success: true, message: 'Certificate created successfully', certificateId: result.certificateId });
//     } catch (error) {
//         res.status(500).json({ success: false, error: `Internal server error: ${error.message}` });
//     }
// }

// async function getCertificateById(req, res) {
//     try {
//         const certificateId = req.params.id;
//         const result = await certificateService.getCertificateById(certificateId);

//         if (!result.success) {
//             return res.status(404).json({ success: false, error: 'Certificate not found.' });
//         }

//         res.status(200).json({ success: true, certificate: result.certificate });
//     } catch (error) {
//         res.status(500).json({ success: false, error: `Internal server error: ${error.message}` });
//     }
// }

// async function findCertificateByNumber(req, res) {
//     try {
//         const certificateNumber = req.params.certificateNumber;
//         const result = await certificateService.findCertificateByNumber(certificateNumber);

//         if (!result.success) {
//             return res.status(404).json({ success: false, error: 'Certificate not found.' });
//         }

//         res.status(200).json({ success: true, certificate: result.certificate });
//     } catch (error) {
//         res.status(500).json({ success: false, error: `Internal server error: ${error.message}` });
//     }
// }

// module.exports = {
//     createCertificate,
//     getCertificateById,
//     findCertificateByNumber
// };


const certificateService = require('../services/certificateService');

// async function createCertificate(req, res) {
//     try {
//         const { student_name, course, certificate_number, certificate_file_path, issued_date } = req.body;
        
//         const result = await certificateService.addCertificate({
//             student_name,
//             course,
//             certificate_number,
//             certificate_file_path,
//             issued_date
//         });

//         if (!result.success) {
//             return res.status(500).json({ success: false, error: result.message });
//         }

//         res.status(201).json({ success: true, message: result.message, certificateId: result.certificateId });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

async function createCertificate(req, res) {
    try {
        const { student_name, course, certificate_number, issued_date } = req.body;

        // Check if an image file is uploaded
        const certificate_file_path = req.file ? req.file.path : null;

        // If no image file is uploaded, return an error response
        if (!certificate_file_path) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }


        // Call the service layer function to create the verifySkillProvider with or without an image path
        const newCertificate = await certificateService.addCertificate({ student_name, course, certificate_number, certificate_file_path, issued_date  });
        
        if (!newCertificate.success) {
            return res.status(500).json({ success: false, error: result.message });
        }

        res.status(201).json({ success: true, message: newCertificate.message, certificateId: newCertificate.certificateId });
        // Return success response with the newly created newCertificate data
        res.status(201).json({ success: true, certificate: newCertificate });

    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function getCertificateById(req, res) {
    try {
        const certificateId = req.params.id;
        const result = await certificateService.getCertificateById(certificateId);

        if (!result.success) {
            return res.status(404).json({ success: false, error: result.message });
        }

        res.status(200).json({ success: true, certificate: result.certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function findCertificateByNumber(req, res) {
    try {
        const certificateNumber = req.params.certificateNumber;
        const result = await certificateService.findCertificateByNumber(certificateNumber);

        if (!result.success) {
            return res.status(404).json({ success: false, error: result.message });
        }

        res.status(200).json({ success: true, certificate: result.certificate });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    createCertificate,
    getCertificateById,
    findCertificateByNumber
};
