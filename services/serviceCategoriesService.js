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

customerReviewService.getCustomerReview = async (reviewId) => {
    try {
        const selectQuery = 'SELECT * FROM customer_reviews WHERE id = ?';
        const review = await query(selectQuery, [reviewId]);
        if (review.length === 0) {
            throw new Error('Customer review not found');
        }
        return review[0];
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
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, args, (err, rows) => {
//             if (err) reject(err);
//             else resolve(rows);
//         });
//     });
// }

// // Create ServiceCategories table if it doesn't exist
// async function createServiceCategoriesTable() {
//     const createServiceCategoriesTableQuery = `
//         CREATE TABLE IF NOT EXISTS service_categories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             subCategory VARCHAR(255) NOT NULL,
//             UNIQUE KEY(serviceType, subCategory)
//         );
//     `;
//     try {
//         await query(createServiceCategoriesTableQuery);
//         console.log('ServiceCategories table created successfully');
//     } catch (error) {
//         console.error('Error creating ServiceCategories table:', error);
//         throw error;
//     }
// }


// // createServiceCategoriesTable();

// const serviceCategoriesService = {};

// serviceCategoriesService.createServiceCategory = async (serviceType, subCategory) => {
//     try {
//         const insertCategoryQuery = 'INSERT INTO service_categories (serviceType, subCategory) VALUES (?, ?)';
//         const insertCategoryResult = await query(insertCategoryQuery, [serviceType, subCategory]);
//         return insertCategoryResult.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getServiceCategoryId = async (serviceType, subCategory) => {
//     try {
//         const categoryQuery = 'SELECT id FROM service_categories WHERE serviceType = ? AND subCategory = ?';
//         const categoryResult = await query(categoryQuery, [serviceType, subCategory]);
//         if (categoryResult.length > 0) {
//             return categoryResult[0].id;
//         } else {
//             throw new Error('Service category not found');
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getAllServiceCategories = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM service_categories';
//         const serviceCategories = await query(selectAllQuery);
//         return serviceCategories;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.updateServiceCategory = async (categoryId, newServiceType, newSubCategory) => {
//     try {
//         const updateCategoryQuery = 'UPDATE service_categories SET serviceType = ?, subCategory = ? WHERE id = ?';
//         await query(updateCategoryQuery, [newServiceType, newSubCategory, categoryId]);
//         return categoryId;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.deleteServiceCategory = async (categoryId) => {
//     try {
//         const deleteCategoryQuery = 'DELETE FROM service_categories WHERE id = ?';
//         await query(deleteCategoryQuery, [categoryId]);
//         return categoryId;
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = serviceCategoriesService;


// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, args, (err, rows) => {
//             if (err) reject(err);
//             else resolve(rows);
//         });
//     });
// }

// const serviceCategoriesService = {};

// // Create ServiceCategories table if it doesn't exist
// async function createServiceCategoriesTable() {
//     const createServiceCategoriesTableQuery = `
//         CREATE TABLE IF NOT EXISTS service_categories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             subCategory VARCHAR(255) NOT NULL,
//             UNIQUE KEY(serviceType, subCategory)
//         );
//     `;
//     try {
//         await query(createServiceCategoriesTableQuery);
//         console.log('ServiceCategories table created successfully');
//     } catch (error) {
//         console.error('Error creating ServiceCategories table:', error);
//         throw error;
//     }
// }

// serviceCategoriesService.createServiceCategory = async (serviceType, subCategory) => {
//     try {
//         const insertCategoryQuery = 'INSERT INTO service_categories (serviceType, subCategory) VALUES (?, ?)';
//         const insertCategoryResult = await query(insertCategoryQuery, [serviceType, subCategory]);
//         return insertCategoryResult.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getServiceCategoryById = async (categoryId) => {
//     try {
//         const selectQuery = 'SELECT * FROM service_categories WHERE id = ?';
//         const category = await query(selectQuery, [categoryId]);
//         return category[0];
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getAllServiceCategories = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM service_categories';
//         const serviceCategories = await query(selectAllQuery);
//         return serviceCategories;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.updateServiceCategory = async (categoryId, newServiceType, newSubCategory) => {
//     try {
//         const updateQuery = 'UPDATE service_categories SET serviceType = ?, subCategory = ? WHERE id = ?';
//         await query(updateQuery, [newServiceType, newSubCategory, categoryId]);
//         return { id: categoryId, serviceType: newServiceType, subCategory: newSubCategory };
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.deleteServiceCategory = async (categoryId) => {
//     try {
//         const deleteQuery = 'DELETE FROM service_categories WHERE id = ?';
//         await query(deleteQuery, [categoryId]);
//         return { id: categoryId };
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = { serviceCategoriesService, createServiceCategoriesTable };


// const mysql = require('mysql');
// const dotenv = require('dotenv');

// dotenv.config();

// const connection = mysql.createPool({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
// });

// // Helper function to execute SQL queries
// function query(sql, args) {
//     return new Promise((resolve, reject) => {
//         connection.query(sql, args, (err, rows) => {
//             if (err) reject(err);
//             else resolve(rows);
//         });
//     });
// }

// const serviceCategoriesService = {};

// // Create ServiceCategories table if it doesn't exist
// async function createServiceCategoriesTable() {
//     const createServiceCategoriesTableQuery = `
//         CREATE TABLE IF NOT EXISTS service_categories (
//             id INT AUTO_INCREMENT PRIMARY KEY,
//             serviceType VARCHAR(255) NOT NULL,
//             subCategory VARCHAR(255) NOT NULL,
//             UNIQUE KEY(serviceType, subCategory)
//         );
//     `;
//     try {
//         await query(createServiceCategoriesTableQuery);
//         console.log('ServiceCategories table created successfully');
//     } catch (error) {
//         console.error('Error creating ServiceCategories table:', error);
//         throw error;
//     }
// }

// serviceCategoriesService.createServiceCategory = async (serviceType, subCategory) => {
//     try {
//         const insertCategoryQuery = 'INSERT INTO service_categories (serviceType, subCategory) VALUES (?, ?)';
//         const insertCategoryResult = await query(insertCategoryQuery, [serviceType, subCategory]);
//         return insertCategoryResult.insertId;
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getServiceCategoryId = async (serviceType, subCategory) => {
//     try {
//         const categoryQuery = 'SELECT id FROM service_categories WHERE serviceType = ? AND subCategory = ?';
//         const categoryResult = await query(categoryQuery, [serviceType, subCategory]);
//         if (categoryResult.length > 0) {
//             return categoryResult[0].id;
//         } else {
//             throw new Error('Service category not found');
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// serviceCategoriesService.getAllServiceCategories = async () => {
//     try {
//         const selectAllQuery = 'SELECT * FROM service_categories';
//         const serviceCategories = await query(selectAllQuery);
//         return serviceCategories;
//     } catch (error) {
//         throw error;
//     }
// };

// module.exports = { serviceCategoriesService, createServiceCategoriesTable };
