const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool of MySQL connections
const pool = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT || 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to execute SQL queries
function query(sql, args) {
    return new Promise((resolve, reject) => {
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            connection.query(sql, args, (err, rows) => {
                connection.release();

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            });
        });
    });
}

// Table creation SQL statements
const createCoursesTable = `
    CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        overview TEXT NOT NULL,
        duration VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
`;

const createSubscribersTable = `
   CREATE TABLE IF NOT EXISTS subscribers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNumber VARCHAR(20) NOT NULL,
    preferredCourse VARCHAR(255) NOT NULL,
    voucherNumber VARCHAR(50) NOT NULL,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createPromotionsTable = `
   CREATE TABLE IF NOT EXISTS promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phoneNumber VARCHAR(20) NOT NULL,
    instagramHandle VARCHAR(255) NOT NULL,
    instagramUrl VARCHAR(255) NOT NULL,
    voucherNumber VARCHAR(50) NOT NULL,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

// Function to create tables
async function createTables() {
    try {
        await query(createCoursesTable);
        await query(createSubscribersTable);
        await query(createPromotionsTable);
        console.log('All tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
        throw error;
    }
}

createTables();

const subscriptionService = {};

// Utility function to generate a 6-digit unique voucher number
function generateVoucherNumber() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


// Get all courses and format them
subscriptionService.getCourses = async () => {
    try {
        const selectQuery = 'SELECT * FROM courses';
        const rows = await query(selectQuery);

        // Format the course data
        const courses = rows.map(course => ({
            id: course.id, // Include the course ID
            name: course.name,
            price: course.price.toFixed(2), // Format price to two decimal places
            overview: course.overview,
            duration: course.duration
        }));

        return courses;
    } catch (error) {
        throw new Error(`Error retrieving courses: ${error.message}`);
    }
};


// Register a new promotion
subscriptionService.registerPromotion = async (firstName, lastName, email, phoneNumber, instagramHandle, instagramUrl) => {
    try {
        // Generate a unique 6-digit voucher number
        const voucherNumber = generateVoucherNumber();

        // Insert the new promotion into the database
        const insertQuery = `
            INSERT INTO promotions (firstName, lastName, email, phoneNumber, instagramHandle, instagramUrl, voucherNumber)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await query(insertQuery, [firstName, lastName, email, phoneNumber, instagramHandle, instagramUrl, voucherNumber]);

        return {
            message: 'Promotion registered successfully',
            firstName,
            lastName,
            email,
            phoneNumber,
            instagramHandle,
            instagramUrl,
            voucherNumber
        };
    } catch (error) {
        throw new Error(`Error registering promotion: ${error.message}`);
    }
};

// Get all promotions
subscriptionService.getPromotions = async () => {
    try {
        const selectQuery = 'SELECT * FROM promotions';
        const promotions = await query(selectQuery);
        return promotions;
    } catch (error) {
        throw new Error(`Error retrieving promotions: ${error.message}`);
    }
};


// Function to find a certificate by its certificate number
subscriptionService.findPromoterByVoucherNumber = async (voucherNumber) => {
    try {
        const findVoucherNumberQuery = `SELECT * FROM promotions WHERE voucherNumber = ?`;
        const rows = await query(findVoucherNumberQuery, [voucherNumber]);

        if (rows.length === 0) {
            return {
                success: false,
                message: 'voucher Number not found',
            };
        }

        return {
            success: true,
            promoter: rows[0],
        };
    } catch (error) {
        console.error('Error finding voucherNumber:', error);
        return {
            success: false,
            message: 'Error finding voucherNumber',
            error: error.message,
        };
    }
};



// Register a new subscriber
subscriptionService.registerSubscriber = async (firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber) => {
    try {
        const insertQuery = `
            INSERT INTO subscribers (firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        await query(insertQuery, [firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber]);

        return {
            message: 'Subscriber registered successfully',
            firstName,
            lastName,
            email,
            phoneNumber,
            preferredCourse,
            voucherNumber
        };
    } catch (error) {
        throw new Error(`Error registering subscriber: ${error.message}`);
    }
};

// Get all subscribers
subscriptionService.getSubscribers = async () => {
    try {
        const selectQuery = 'SELECT * FROM subscribers';
        const subscribers = await query(selectQuery);
        return subscribers;
    } catch (error) {
        throw new Error(`Error retrieving subscribers: ${error.message}`);
    }
};


module.exports = subscriptionService;



// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// // Create a pool of MySQL connections
// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT || 10,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         pool.getConnection((err, connection) => {
//             if (err) {
//                 return reject(err);
//             }

//             connection.query(sql, args, (err, rows) => {
//                 connection.release();

//                 if (err) {
//                     return reject(err);
//                 }

//                 resolve(rows);
//             });
//         });
//     });
// }

// // Table creation SQL statements
// const createCoursesTable = `
//     CREATE TABLE IF NOT EXISTS courses (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         name VARCHAR(100) NOT NULL,
//         price DECIMAL(10, 2) NOT NULL,
//         overview TEXT NOT NULL,
//         duration VARCHAR(50) NOT NULL,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
//     );
// `;

// const createSubscribersTable = `
//    CREATE TABLE IF NOT EXISTS subscribers (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     firstName VARCHAR(50) NOT NULL,
//     lastName VARCHAR(50) NOT NULL,
//     email VARCHAR(100) NOT NULL UNIQUE,
//     phoneNumber VARCHAR(20) NOT NULL,
//     preferredCourse VARCHAR(255) NOT NULL,
//     voucherNumber VARCHAR(50) NOT NULL,
//     registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// `;
// const createPromotionsTable = `
//    CREATE TABLE IF NOT EXISTS promotions (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     firstName VARCHAR(50) NOT NULL,
//     lastName VARCHAR(50) NOT NULL,
//     email VARCHAR(100) NOT NULL UNIQUE,
//     phoneNumber VARCHAR(20) NOT NULL,
//     instagramHandle VARCHAR(255) NOT NULL,
//     instagramUrl VARCHAR(255) NOT NULL,
//     voucherNumber VARCHAR(50) NOT NULL,
//     registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// `;

// // Function to create tables
// async function createTables() {
//     try {
//         await query(createCoursesTable);
//         await query(createSubscribersTable);
//         await query(createPromotionsTable);
//         console.log('All tables created successfully');
//     } catch (error) {
//         console.error('Error creating tables:', error);
//         throw error;
//     }
// }

// createTables();

// const subscriptionService = {};

// // Get all courses and format them
// subscriptionService.getCourses = async () => {
//     try {
//         const selectQuery = 'SELECT * FROM courses';
//         const rows = await query(selectQuery);

//         // Format the course data
//         const courses = rows.map(course => ({
//             id: course.id, // Include the course ID
//             name: course.name,
//             price: course.price.toFixed(2), // Format price to two decimal places
//             overview: course.overview,
//             duration: course.duration
//         }));

//         return courses;
//     } catch (error) {
//         throw new Error(`Error retrieving courses: ${error.message}`);
//     }
// };

// // Register a new subscriber
// subscriptionService.registerSubscriber = async (firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber) => {
//     try {
//         // Insert the new subscriber into the database
//         const insertQuery = `
//             INSERT INTO subscribers (firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber)
//             VALUES (?, ?, ?, ?, ?, ?)
//         `;
//         await query(insertQuery, [firstName, lastName, email, phoneNumber, preferredCourse, voucherNumber]);

//         return {
//             message: 'Subscriber registered successfully',
//             firstName,
//             lastName,
//             email,
//             phoneNumber,
//             preferredCourse,
//             voucherNumber
//         };
//     } catch (error) {
//         throw new Error(`Error registering subscriber: ${error.message}`);
//     }
// };

// module.exports = subscriptionService;
