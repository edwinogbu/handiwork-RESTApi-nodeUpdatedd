const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to execute SQL queries
function query(sql, args) {
    return new Promise((resolve, reject) => {
        connection.query(sql, args, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function createCertificatesTable() {
    const createCertificatesTableQuery = `
        CREATE TABLE IF NOT EXISTS certificates (
            id INT PRIMARY KEY AUTO_INCREMENT,
            student_name VARCHAR(255) NOT NULL,
            course VARCHAR(255) NOT NULL,
            certificate_number VARCHAR(255) NOT NULL UNIQUE,
            certificate_file_path VARCHAR(255), 
            issued_date DATE
        );
    `;
    try {
        await query(createCertificatesTableQuery);
        console.log('Certificates table created successfully');
    } catch (error) {
        console.error('Error creating Certificates table:', error);
        throw error;
    }
}

createCertificatesTable(); // Immediately create the table on module load

const certificateService = {};

certificateService.certificateExist = async(certificateId)=>{
    try {
        const selectQuery =`SELECT COUNT(*) AS COUNT FROM certificates WHERE id= 1`;
        const result = await query(selectQuery, [certificateId]);
        const count = result[0].count;
        return count > 0;
    } catch (error) {
        throw error
    }

}
certificateService.addCertificate = async (certificateData) => {
    const insertCertificateQuery = `
        INSERT INTO certificates (student_name, course, certificate_number, certificate_file_path, issued_date)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
        certificateData.student_name,
        certificateData.course,
        certificateData.certificate_number,
        certificateData.certificate_file_path || '', // Ensure it is not null
        certificateData.issued_date,
    ];

    try {
        const result = await query(insertCertificateQuery, values);
        return {
            success: true,
            message: 'Certificate added successfully',
            certificateId: result.insertId,
        };
    } catch (error) {
        console.error('Error adding certificate:', error);
        return { success: false, message: 'Error adding certificate', error: error.message };
    }
};




// Function to get a certificate by ID
certificateService.getCertificateById = async (id) => {
    try {
        const getCertificateQuery = `SELECT * FROM certificates WHERE id = ?`;
        const rows = await query(getCertificateQuery, [id]);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Certificate not found',
            };
        }

        return {
            success: true,
            certificate: rows[0],
        };
    } catch (error) {
        console.error('Error retrieving certificate:', error);
        return {
            success: false,
            message: 'Error retrieving certificate',
            error: error.message,
        };
    }
};

// Function to find a certificate by its certificate number
certificateService.findCertificateByNumber = async (certificateNumber) => {
    try {
        const findCertificateQuery = `SELECT * FROM certificates WHERE certificate_number = ?`;
        const rows = await query(findCertificateQuery, [certificateNumber]);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'Certificate not found',
            };
        }

        return {
            success: true,
            certificate: rows[0],
        };
    } catch (error) {
        console.error('Error finding certificate:', error);
        return {
            success: false,
            message: 'Error finding certificate',
            error: error.message,
        };
    }
};


certificateService.updateCertificate = async ()=>{
    try {
        updateQuery = `UPDATE certificates SET student_name = ?, course = ?, certificate_number = ?, certificate_file_path = ?`
        
    } catch (error) {
        throw error
    }
}
module.exports = certificateService;
