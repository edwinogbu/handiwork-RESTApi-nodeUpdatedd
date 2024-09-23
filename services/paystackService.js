const axios = require('axios');
const mysql = require('mysql');
const dotenv = require('dotenv');
const walletAndTransactionsService = require('../services/walletAndTransactionsService'); // Import your wallet service

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

// Create Payments table if it doesn't exist
const createPaymentsTableQuery = `CREATE TABLE IF NOT EXISTS payments (
    id INT NOT NULL AUTO_INCREMENT,
    reference VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    email VARCHAR(255),
    full_name VARCHAR(255),
    status VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    customerId INT,
    PRIMARY KEY (id),
    UNIQUE KEY reference (reference),
    FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
)`;

// Function to create Payments table
async function createPaymentsTable() {
    try {
        await query(createPaymentsTableQuery);
        console.log('Payments table created successfully');
    } catch (error) {
        console.error('Error creating Payments table:', error);
    }
}

// Execute table creation queries
(async () => {
    await createPaymentsTable();
    console.log('Tables created successfully');
})();

const paystackService = {};



// Function to get customer details from the database
paystackService.getCustomerDetails = async (customerId) => {
    const sql = `SELECT firstName, lastName, email, phone FROM customers WHERE id = ?`;
    
    try {
        const results = await query(sql, [customerId]);
        if (results.length > 0) {
            const customer = results[0];
            return {
                full_name: `${customer.firstName} ${customer.lastName}`,
                first_name: customer.firstName,
                last_name: customer.lastName,
                email: customer.email,
                phone: customer.phone,
            }; // Return the customer details needed for the Paystack transaction
        } else {  
            
            throw new Error('Customer not found');
        }
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};



// Function to initiate a Paystack transaction
paystackService.initiateTransaction = async (customerId, amount) => {
    try {
        // Fetch customer details
        const customer = await paystackService.getCustomerDetails(customerId);

        const response = await axios.post('https://api.paystack.co/transaction/initialize', {
            amount: amount * 100, // Convert to kobo
            email: customer.email,
            full_name: customer.full_name,
            first_name: customer.first_name,
            last_name: customer.last_name,
            // Optionally include phone if required by Paystack
            phone: customer.phone,
        }, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data.status) {
            // Save the transaction in the database
            await paystackService.recordTransaction({
                reference: response.data.data.reference,
                amount,
                email: customer.email,
                full_name: customer.full_name,
                first_name: customer.first_name,
                last_name: customer.last_name,
                status: 'pending',
                customerId, // Add customerId for future reference
            });

            return response.data.data; // Return the payment link and other details
        } else {
            throw new Error('Failed to initiate transaction');
        }
    } catch (error) {
        throw new Error(`Paystack Transaction Error: ${error.response.data.message || error.message}`);
    }
};

// Function to verify a Paystack transaction
paystackService.verifyTransaction = async (reference) => {
    try {
        const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            },
        });

        if (response.data.status) {
            return response.data.data; // Return transaction details
        } else {
            throw new Error('Transaction not found or verification failed');
        }
    } catch (error) {
        throw new Error(`Paystack Verification Error: ${error.response.data.message || error.message}`);
    }
};

// Function to handle the callback from Paystack after payment
paystackService.handlePaymentCallback = async (transactionData) => {
    const { status, amount, reference, customerId } = transactionData;

    if (status === 'success') {
        // Fetch customer details from the database
        const customer = await paystackService.getCustomerDetails(customerId);
        
        // Update the transaction status in the database
        await paystackService.updateTransactionStatus(reference, 'success');

        const amountInNaira = amount / 100; // Convert kobo back to Naira

        // Credit the customer's wallet
        await walletAndTransactionsService.creditCustomerWalletAccount(customerId, amountInNaira, `Payment for transaction ${reference}`);
        
        return {
            message: 'Payment processed successfully',
            transactionReference: reference,
        };
    } else {
        // Update the transaction status in the database
        await paystackService.updateTransactionStatus(reference, 'failed');
        throw new Error('Payment was not successful');
    }
};

// Function to record a transaction in the database
paystackService.recordTransaction = async (transactionData) => {
    const { reference, amount, email, full_name, status, customerId } = transactionData;
    const sql = `INSERT INTO payments (reference, amount, email, full_name, status, customerId) VALUES (?, ?, ?, ?, ?, ?)`;
    
    try {
        await query(sql, [reference, amount, email, full_name, status, customerId]);
    } catch (error) {
        throw new Error(`Database Error: ${error.message}`);
    }
};

// Function to update transaction status in the database
paystackService.updateTransactionStatus = async (reference, status) => {
    const sql = `UPDATE payments SET status = ? WHERE reference = ?`;
    
    try {
        await query(sql, [status, reference]);
    } catch (error) {
        throw new Error(`Database Update Error: ${error.message}`);
    }
};

// Export the service
module.exports = paystackService;


// const axios = require('axios');
// const mysql = require('mysql');
// const dotenv = require('dotenv');
// const walletAndTransactionsService = require('../services/walletAndTransactionsService'); // Import your wallet service

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

// // Create Payments table if it doesn't exist
// const createPaymentsTableQuery = `
//     CREATE TABLE IF NOT EXISTS payments (
//         id INT NOT NULL AUTO_INCREMENT,
//         reference VARCHAR(255) NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         email VARCHAR(255),
//         full_name VARCHAR(255),
//         status VARCHAR(50),
//         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
//         customerId INT,
//         PRIMARY KEY (id),
//         UNIQUE KEY reference (reference),
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Payments table
// async function createPaymentsTable() {
//     try {
//         await query(createPaymentsTableQuery);
//         console.log('Payments table created successfully');
//     } catch (error) {
//         console.error('Error creating Payments table:', error);
//     }
// }

// // Execute table creation queries
// (async () => {
//     await createPaymentsTable();
//     console.log('Tables created successfully');
// })();

// const paystackService = {};

// // Function to get customer details from the database
// paystackService.getCustomerDetails = async (customerId) => {
//     const sql = `SELECT * FROM customers WHERE id = ?`;
    
//     try {
//         const results = await query(sql, [customerId]);
//         if (results.length > 0) {
//             return results[0]; // Return the first customer found
//         } else {
//             throw new Error('Customer not found');
//         }
//     } catch (error) {
//         throw new Error(`Database Error: ${error.message}`);
//     }
// };

// // Function to initiate a Paystack transaction
// paystackService.initiateTransaction = async (amount, email, fullName) => {
//     try {
//         const response = await axios.post('https://api.paystack.co/transaction/initialize', {
//             amount: amount * 100, // Convert to kobo
//             email: email,
//             // You can include more data here if needed
//         }, {
//             headers: {
//                 Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//                 'Content-Type': 'application/json',
//             },
//         });

//         if (response.data.status) {
//             // Save the transaction in the database
//             await paystackService.recordTransaction({
//                 reference: response.data.data.reference,
//                 amount,
//                 email,
//                 full_name: fullName,
//                 status: 'pending',
//             });

//             return response.data.data; // Return the payment link and other details
//         } else {
//             throw new Error('Failed to initiate transaction');
//         }
//     } catch (error) {
//         throw new Error(`Paystack Transaction Error: ${error.response.data.message || error.message}`);
//     }
// };

// // Function to verify a Paystack transaction
// paystackService.verifyTransaction = async (reference) => {
//     try {
//         const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
//             headers: {
//                 Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
//             },
//         });

//         if (response.data.status) {
//             return response.data.data; // Return transaction details
//         } else {
//             throw new Error('Transaction not found or verification failed');
//         }
//     } catch (error) {
//         throw new Error(`Paystack Verification Error: ${error.response.data.message || error.message}`);
//     }
// };

// // Function to handle the callback from Paystack after payment
// paystackService.handlePaymentCallback = async (transactionData) => {
//     const { status, amount, reference, customerId } = transactionData; // Ensure customerId is included in transaction data

//     if (status === 'success') {
//         // Fetch customer details from the database
//         const customer = await paystackService.getCustomerDetails(customerId);
        
//         // Update the transaction status in the database
//         await paystackService.updateTransactionStatus(reference, 'success');

//         const amountInNaira = amount / 100; // Convert kobo back to Naira

//         // Credit the customer's wallet
//         await walletAndTransactionsService.creditAccount(customer.phone, amountInNaira, `Payment for transaction ${reference}`);
        
//         return {
//             message: 'Payment processed successfully',
//             transactionReference: reference,
//         };
//     } else {
//         // Update the transaction status in the database
//         await paystackService.updateTransactionStatus(reference, 'failed');
//         throw new Error('Payment was not successful');
//     }
// };

// // Function to record a transaction in the database
// paystackService.recordTransaction = async (transactionData) => {
//     const { reference, amount, email, full_name, status } = transactionData;
//     const sql = `INSERT INTO payments (reference, amount, email, full_name, status) VALUES (?, ?, ?, ?, ?)`;
    
//     try {
//         await query(sql, [reference, amount, email, full_name, status]);
//     } catch (error) {
//         throw new Error(`Database Error: ${error.message}`);
//     }
// };

// // Function to update transaction status in the database
// paystackService.updateTransactionStatus = async (reference, status) => {
//     const sql = `UPDATE payments SET status = ? WHERE reference = ?`;
    
//     try {
//         await query(sql, [status, reference]);
//     } catch (error) {
//         throw new Error(`Database Update Error: ${error.message}`);
//     }
// };

// // Export the service
// module.exports = paystackService;


