const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

// Create a pool of MySQL connections
const pool = mysql.createPool({
    connectionLimit: process.env.CONNECTION_LIMIT,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

// Helper function to execute SQL queries
function query(sql, args) {
    return new Promise((resolve, reject) => {
        // Get a connection from the pool
        pool.getConnection((err, connection) => {
            if (err) {
                return reject(err);
            }

            // Execute the query using the acquired connection
            connection.query(sql, args, (err, rows) => {
                // Release the connection back to the pool
                connection.release();

                if (err) {
                    return reject(err);
                }

                resolve(rows);
            });
        });
    });
}

// SQL query to create customer_reviews table
const createCustomerReviewsTableQuery = `
    CREATE TABLE IF NOT EXISTS customer_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customerId INT NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
    )
`;

// Function to create customer_reviews table
async function createCustomerReviewsTable() {
    try {
        await query(createCustomerReviewsTableQuery);
        console.log('Customer Reviews Table created successfully');
    } catch (error) {
        console.error('Error creating Customer Reviews table:', error);
    }
}

// Immediately-invoked function to create the table when this module is loaded
(async () => {
    await createCustomerReviewsTable();
})();

const customerReviewService = {};

customerReviewService.createCustomerReview = async (reviewData) => {
    try {
        const { customerId, rating, comment } = reviewData;
        const insertReviewQuery = `
            INSERT INTO customer_reviews (customerId, rating, comment)
            VALUES (?, ?, ?)
        `;
        const reviewResult = await query(insertReviewQuery, [customerId, rating, comment]);
        if (!reviewResult.insertId) throw new Error('Failed to insert customer review');
        return { id: reviewResult.insertId, ...reviewData };
    } catch (error) {
        throw error;
    }
};

customerReviewService.getCustomerReviewsByCustomerId = async (customerId) => {
    try {
        const selectQuery = 'SELECT * FROM customer_reviews WHERE customerId = ?';
        const reviews = await query(selectQuery, [customerId]);
        return reviews;
    } catch (error) {
        throw error;
    }
};

customerReviewService.updateCustomerReview = async (reviewId, updatedReviewData) => {
    try {
        const { rating, comment } = updatedReviewData;
        const updateReviewQuery = `
            UPDATE customer_reviews
            SET rating = ?, comment = ?
            WHERE id = ?
        `;
        await query(updateReviewQuery, [rating, comment, reviewId]);
        return { id: reviewId, ...updatedReviewData };
    } catch (error) {
        throw error;
    }
};

customerReviewService.deleteCustomerReview = async (reviewId) => {
    try {
        const deleteReviewQuery = 'DELETE FROM customer_reviews WHERE id = ?';
        await query(deleteReviewQuery, [reviewId]);
        return { message: 'Customer review deleted successfully' };
    } catch (error) {
        throw error;
    }
};

customerReviewService.getCustomerDetails = async (customerId) => {
    try {
        const selectQuery = 'SELECT * FROM customers WHERE id = ?';
        const customerDetails = await query(selectQuery, [customerId]);
        if (customerDetails.length === 0) {
            throw new Error('Customer not found');
        }
        return customerDetails[0];
    } catch (error) {
        throw error;
    }
};

customerReviewService.getCustomerReviewsByCustomerId = async (customerId) => {
    try {
        const selectQuery = 'SELECT * FROM customer_reviews WHERE customerId = ?';
        const reviews = await query(selectQuery, [customerId]);
        return reviews;
    } catch (error) {
        throw error;
    }
};

customerReviewService.customerDetailsAndReviews = async (customerId) => {
    try {
        const customerDetails = await customerReviewService.getCustomerDetails(customerId);
        const customerReviews = await customerReviewService.getCustomerReviewsByCustomerId(customerId);
        return { customerDetails, customerReviews };
    } catch (error) {
        throw error;
    }
};


module.exports = customerReviewService;



// const mysql = require('mysql');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
// const dotenv = require('dotenv');

// dotenv.config();

// // Create a pool of MySQL connections
// const pool = mysql.createPool({
//     connectionLimit: process.env.CONNECTION_LIMIT,
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         // Get a connection from the pool
//         pool.getConnection((err, connection) => {
//             if (err) {
//                 return reject(err);
//             }

//             // Execute the query using the acquired connection
//             connection.query(sql, args, (err, rows) => {
//                 // Release the connection back to the pool
//                 connection.release();

//                 if (err) {
//                     return reject(err);
//                 }

//                 resolve(rows);
//             });
//         });
//     });
// }

// const createCustomerReviewsTableQuery = `
//     CREATE TABLE IF NOT EXISTS customer_reviews (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         customerId INT NOT NULL,
//         rating INT NOT NULL,
//         comment TEXT,
//         createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Users table
// async function createCustomerReviewsTable() {
//     try {
//         await query(createCustomerReviewsTableQuery);
//         console.log('Customer Reviews Table  created successfully');
//     } catch (error) {
//         console.error('Error creating Users table:', error);
//     }
// }

// (async () => {
//     await createCustomerReviewsTable();
  
//     console.log('Customer Reviews Table created successfully');
// })();



// const customerReviewService = {};

// customerReviewService.createCustomerReview = async (reviewData) => {
//     try {
//         const { customerId, rating, comment } = reviewData;
//         const insertReviewQuery = `
//             INSERT INTO customer_reviews (customerId, rating, comment)
//             VALUES (?, ?, ?)
//         `;
//         const reviewResult = await query(insertReviewQuery, [customerId, rating, comment]);
//         if (!reviewResult.insertId) throw new Error('Failed to insert customer review');
//         return { id: reviewResult.insertId, ...reviewData };
//     } catch (error) {
//         throw error;
//     }
// };

// customerReviewService.getCustomerReviewsByCustomerId = async (customerId) => {
//     try {
//         const selectQuery = 'SELECT * FROM customer_reviews WHERE customerId = ?';
//         const reviews = await query(selectQuery, [customerId]);
//         return reviews;
//     } catch (error) {
//         throw error;
//     }
// };

// customerReviewService.updateCustomerReview = async (reviewId, updatedReviewData) => {
//     try {
//         const { rating, comment } = updatedReviewData;
//         const updateReviewQuery = `
//             UPDATE customer_reviews
//             SET rating = ?, comment = ?
//             WHERE id = ?
//         `;
//         await query(updateReviewQuery, [rating, comment, reviewId]);
//         return { id: reviewId, ...updatedReviewData };
//     } catch (error) {
//         throw error;
//     }
// };

// customerReviewService.deleteCustomerReview = async (reviewId) => {
//     try {
//         const deleteReviewQuery = 'DELETE FROM customer_reviews WHERE id = ?';
//         await query(deleteReviewQuery, [reviewId]);
//         return { message: 'Customer review deleted successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = customerReviewService;
