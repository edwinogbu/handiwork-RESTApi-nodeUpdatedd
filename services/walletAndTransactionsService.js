// const mysql = require('mysql');
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

// // Create Wallets table if it doesn't exist
// const createWalletsTableQuery = `
//     CREATE TABLE IF NOT EXISTS wallets (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         wallet_type ENUM('customer', 'skill_provider') NOT NULL,
//         customerId INT,
//         skillProviderId INT,
//         balance DECIMAL(15, 2) DEFAULT 0.00,
//         account_number VARCHAR(20) UNIQUE,
//         merchant_fee DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Create Transactions table if it doesn't exist
// const createTransactionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS transactions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         sender_customer_id INT, 
//         recipient_skill_provider_id INT,  
//         transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         description TEXT,
//         transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//         fee DECIMAL(15, 2) DEFAULT 0.00,
//         metadata JSON,
//         transaction_hash VARCHAR(255),
//         confirmations INT DEFAULT 0,
//         transaction_fee_currency VARCHAR(10),
//         transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         status_message TEXT,
//         transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//         merchant_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Wallets table
// async function createWalletsTable() {
//     try {
//         await query(createWalletsTableQuery);
//         console.log('Wallets table created successfully');
//     } catch (error) {
//         console.error('Error creating Wallets table:', error);
//     }
// }

// // Function to create Transactions table
// async function createTransactionsTable() {
//     try {
//         await query(createTransactionsTableQuery);
//         console.log('Transactions table created successfully');
//     } catch (error) {
//         console.error('Error creating Transactions table:', error);
//     }
// }

// // Execute table creation and alteration queries
// (async () => {
//     await createWalletsTable();
//     await createTransactionsTable();
// })();

// // Function to generate a unique 10-digit account number
// const generateUniqueAccountNumber = async (walletType) => {
//     const prefix = walletType === 'customer' ? '7' : '9';
//     const length = 10 - prefix.length;
//     const randomNumber = Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
//     const accountNumber = prefix + randomNumber;

//     // Ensure uniqueness
//     const checkAccountQuery = 'SELECT COUNT(*) as count FROM wallets WHERE account_number = ?';
//     const result = await query(checkAccountQuery, [accountNumber]);

//     if (result[0].count > 0) {
//         return generateUniqueAccountNumber(walletType);
//     }

//     return accountNumber;
// };

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Wallets and Transactions
// const walletAndTransactionsService = {};

// // Create Account
// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;
//         const accountNumber = await generateUniqueAccountNumber(wallet_type);

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId, account_number)
//             VALUES (?, ?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId, accountNumber]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId, accountNumber };
//     } catch (error) {
//         throw error;
//     }
// };

// // Get Wallet Balance
// walletAndTransactionsService.getBalance = async (walletId) => {
//     try {
//         const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
//         const result = await query(selectQuery, [walletId]);
//         if (result.length === 0) {
//             throw new Error('Wallet not found');
//         }
//         return result[0].balance;
//     } catch (error) {
//         throw error;
//     }
// };

// // Get Wallet Owner Name
// walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
//     try {
//         const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         if (wallet[0].wallet_type === 'customer') {
//             const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
//             const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
//             return `${customer[0].firstName} ${customer[0].lastName}`;
//         } else {
//             const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
//             const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
//             return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// // Credit Account
// walletAndTransactionsService.creditAccount = async (walletId, amount, description) => {
//     try {
//         const merchantFee = 100 + (amount * 0.05); // 100 + 5% of the amount

//         // Update balance and apply merchant fee
//         const updateBalanceQuery = `
//             UPDATE wallets 
//             SET balance = balance + ?, merchant_fee = ?
//             WHERE id = ?
//         `;
//         await query(updateBalanceQuery, [amount - merchantFee, merchantFee, walletId]);

//         // Record transaction with merchant fee
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions 
//             (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category, merchant_fee_amount)
//             VALUES (?, ?, 'credit', ?, ?, 'completed', 'credit', ?)
//         `;
//         const result = await query(insertTransactionQuery, [wallet[0].customerId, walletId, amount, description, merchantFee]);

//         // Retrieve the inserted transaction details
//         const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
//         const transaction = await query(selectTransactionQuery, [result.insertId]);

//         return {
//             message: 'Account credited successfully',
//             transaction: transaction[0] // Include details of the inserted transaction
//         };
//     } catch (error) {
//         throw error;
//     }
// };

// // Debit Account
// walletAndTransactionsService.debitAccount = async (walletId, amount, description) => {
//     try {
//         const balance = await walletAndTransactionsService.getBalance(walletId);
//         if (balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance - ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions 
//             (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'debit', ?, ?, 'completed', 'debit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account debited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// // Transfer to Account
// walletAndTransactionsService.transferToAccount = async (senderAccountNumber, recipientAccountNumber, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const senderWalletQuery = 'SELECT id, balance FROM wallets WHERE account_number = ?';
//         const senderWallet = await query(senderWalletQuery, [senderAccountNumber]);

//         if (senderWallet.length === 0) {
//             throw new Error('Sender wallet not found');
//         }

//         if (senderWallet[0].balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Get recipient wallet ID
//         const recipientWalletQuery = 'SELECT id FROM wallets WHERE account_number = ?';
//         const recipientWallet = await query(recipientWalletQuery, [recipientAccountNumber]);

//         if (recipientWallet.length === 0) {
//             throw new Error('Recipient wallet not found');
//         }

//         const recipientWalletId = recipientWallet[0].id;
//         const merchantFee = 100 + (amount * 0.05); // 100 + 5% of the amount

//         // Update sender balance
//         await walletAndTransactionsService.debitAccount(senderWallet[0].id, amount, description);

//         // Update recipient balance and apply merchant fee
//         await walletAndTransactionsService.creditAccount(recipientWalletId, amount, description);

//         // Record transaction for sender
//         const insertSenderTransactionQuery = `
//             INSERT INTO transactions 
//             (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category, merchant_fee_amount)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer', ?)
//         `;
//         await query(insertSenderTransactionQuery, [senderWallet[0].customerId, recipientWalletId, amount, description, merchantFee]);

//         // Record transaction for recipient
//         const insertRecipientTransactionQuery = `
//             INSERT INTO transactions 
//             (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category, merchant_fee_amount)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer', ?)
//         `;
//         await query(insertRecipientTransactionQuery, [recipientAccountNumber, senderWallet[0].customerId, amount, description, merchantFee]);

//         return { message: 'Transfer successful' };
//     } catch (error) {
//         throw error;
//     }
// };

// // Get Transactions for Customer
// walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.sender_customer_id = ?
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for customer: ' + error.message);
//     }
// };

// // Get Transactions for Skill Provider
// walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.recipient_skill_provider_id = ?
//             AND t.transaction_type = 'credit'
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for skill provider: ' + error.message);
//     }
// };

// module.exports = walletAndTransactionsService;


// const mysql = require('mysql');
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

// // Create Wallets table if it doesn't exist
// const createWalletsTableQuery = `
//     CREATE TABLE IF NOT EXISTS wallets (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         wallet_type ENUM('customer', 'skill_provider') NOT NULL,
//         customerId INT,
//         skillProviderId INT,
//         balance DECIMAL(15, 2) DEFAULT 0.00,
//         merchant_fee DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Create Transactions table if it doesn't exist
// const createTransactionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS transactions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         sender_customer_id INT, 
//         recipient_skill_provider_id INT,  
//         transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         description TEXT,
//         transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//         fee DECIMAL(15, 2) DEFAULT 0.00,
//         metadata JSON,
//         transaction_hash VARCHAR(255),
//         confirmations INT DEFAULT 0,
//         transaction_fee_currency VARCHAR(10),
//         transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         status_message TEXT,
//         transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//         merchant_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Wallets table
// async function createWalletsTable() {
//     try {
//         await query(createWalletsTableQuery);
//         console.log('Wallets table created successfully');
//     } catch (error) {
//         console.error('Error creating Wallets table:', error);
//     }
// }

// // Execute table creation and alteration queries
// (async () => {
//     await createWalletsTable();
//     await query(createTransactionsTableQuery);
//     console.log('Tables created successfully');
// })();

// // CRUD operations for Wallets and Transactions
// const walletAndTransactionsService = {};

// // Get balance for a wallet
// walletAndTransactionsService.getBalance = async (walletId) => {
//     try {
//         const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
//         const result = await query(selectQuery, [walletId]);
//         if (result.length === 0) {
//             throw new Error('Wallet not found');
//         }
//         return result[0].balance;
//     } catch (error) {
//         throw error;
//     }
// };

// // Get wallet owner name
// walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
//     try {
//         const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         if (wallet[0].wallet_type === 'customer') {
//             const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
//             const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
//             return `${customer[0].firstName} ${customer[0].lastName}`;
//         } else {
//             const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
//             const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
//             return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// // Create a new wallet account
// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId)
//             VALUES (?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId };
//     } catch (error) {
//         throw error;
//     }
// };

// // Credit account
// walletAndTransactionsService.creditAccount = async (walletId, amount, description) => {
//     try {
//         // Calculate merchant fee
//         const merchantFee = 100 + (amount * 0.2);
//         const netAmount = amount - merchantFee;

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
//         await query(updateBalanceQuery, [netAmount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
//             VALUES (?, ?, 'credit', ?, ?, 'completed', ?, 'credit')
//         `;
//         const result = await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description, merchantFee]);

//         // Retrieve the inserted transaction details
//         const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
//         const transaction = await query(selectTransactionQuery, [result.insertId]);

//         return {
//             message: 'Account credited successfully',
//             transaction: transaction[0] // Include details of the inserted transaction
//         };
//     } catch (error) {
//         throw error;
//     }
// };

// // Debit account
// walletAndTransactionsService.debitAccount = async (walletId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const balance = await walletAndTransactionsService.getBalance(walletId);
//         if (balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance - ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'debit', ?, ?, 'completed', 'debit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account debited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// // Transfer funds between accounts
// walletAndTransactionsService.transferToAccount = async (senderWalletId, recipientSkillProviderId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const senderBalance = await walletAndTransactionsService.getBalance(senderWalletId);
//         if (senderBalance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Calculate merchant fee for skill provider
//         const merchantFee = 100 + (amount * 0.05);
//         const netAmount = amount - merchantFee;

//         // Get recipient wallet information
//         const recipientWalletQuery = 'SELECT id FROM wallets WHERE skillProviderId = ?';
//         const recipientWallet = await query(recipientWalletQuery, [recipientSkillProviderId]);

//         if (recipientWallet.length === 0) {
//             throw new Error('Recipient wallet not found');
//         }

//         // Update balances
//         await query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, senderWalletId]);
//         await query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [netAmount, recipientWallet[0].id]);

//         // Record transactions
//         const insertSenderTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, fee, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', ?, 'transfer')
//         `;
//         await query(insertSenderTransactionQuery, [senderWalletId, recipientSkillProviderId, amount, description, merchantFee]);

//         const insertRecipientTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
//         `;
//         await query(insertRecipientTransactionQuery, [senderWalletId, recipientSkillProviderId, netAmount, description]);

//         return { message: 'Transfer completed successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// // Get transactions for a customer
// walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
//     try {
//         const selectQuery = `
//             SELECT 
//                 t.id AS transaction_id,
//                 CONCAT(sp.firstName, ' ', sp.lastName) AS receiver_name,
//                 t.amount,
//                 t.description,
//                 t.transaction_date,
//                 t.transaction_status,
//                 t.fee AS transaction_fee,
//                 t.merchant_fee_amount AS merchant_fee
//             FROM transactions t
//             LEFT JOIN skill_providers sp ON t.recipient_skill_provider_id = sp.id
//             WHERE t.sender_customer_id = ?
//             ORDER BY t.transaction_date DESC
//         `;
//         const transactions = await query(selectQuery, [customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for customer: ' + error.message);
//     }
// };

// // Get transactions for a skill provider
// walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
//     try {
//         const selectQuery = `
//             SELECT 
//                 t.id AS transaction_id,
//                 CONCAT(c.firstName, ' ', c.lastName) AS sender_name,
//                 t.amount,
//                 t.description,
//                 t.transaction_date,
//                 t.transaction_status,
//                 t.fee AS transaction_fee,
//                 t.merchant_fee_amount AS merchant_fee
//             FROM transactions t
//             LEFT JOIN customers c ON t.sender_customer_id = c.id
//             WHERE t.recipient_skill_provider_id = ?
//             ORDER BY t.transaction_date DESC
//         `;
//         const transactions = await query(selectQuery, [skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for skill provider: ' + error.message);
//     }
// };

// // Get transactions between a specific customer and a specific skill provider
// walletAndTransactionsService.getTransactionsBetweenCustomerAndSkillProvider = async (customerId, skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT 
//                 t.id AS transaction_id,
//                 CONCAT(c.firstName, ' ', c.lastName) AS sender_name,
//                 CONCAT(sp.firstName, ' ', sp.lastName) AS receiver_name,
//                 t.amount,
//                 t.description,
//                 t.transaction_date,
//                 t.transaction_status,
//                 t.fee AS transaction_fee,
//                 t.merchant_fee_amount AS merchant_fee
//             FROM transactions t
//             LEFT JOIN customers c ON t.sender_customer_id = c.id
//             LEFT JOIN skill_providers sp ON t.recipient_skill_provider_id = sp.id
//             WHERE t.sender_customer_id = ?
//             AND t.recipient_skill_provider_id = ?
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId, skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions between customer and skill provider: ' + error.message);
//     }
// };


// // walletAndTransactionsService.getAllTransactions = async () => {
// //     try {
// //         const selectAllTransactionsQuery = `
// //             SELECT 
// //                 t.id AS transaction_id,
// //                 CONCAT(c.firstName, ' ', c.lastName) AS sender_name,
// //                 CONCAT(sp.firstName, ' ', sp.lastName) AS receiver_name,
// //                 t.amount,
// //                 t.description,
// //                 t.transaction_date,
// //                 t.transaction_status,
// //                 t.fee AS transaction_fee,
// //                 t.merchant_fee_amount AS merchant_fee
// //             FROM transactions t
// //             LEFT JOIN wallets w ON t.sender_customer_id = w.customerId
// //             LEFT JOIN customers c ON t.sender_customer_id = c.id
// //             LEFT JOIN skill_providers sp ON t.recipient_skill_provider_id = sp.id
// //             ORDER BY t.transaction_date DESC;
// //         `;
// //         const transactions = await query(selectAllTransactionsQuery);
// //         return transactions;
// //     } catch (error) {
// //         throw new Error('Error retrieving all transactions: ' + error.message);
// //     }
// // };

// // Get all transactions
// walletAndTransactionsService.getAllTransactions = async () => {
//     try {
//         const selectAllTransactionsQuery = `
//             SELECT * FROM transactions
//             ORDER BY transaction_date DESC
//         `;
//         const transactions = await query(selectAllTransactionsQuery);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving all transactions: ' + error.message);
//     }
// };

// module.exports = walletAndTransactionsService;









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

// Create Wallets table if it doesn't exist
const createWalletsTableQuery = `
    CREATE TABLE IF NOT EXISTS wallets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        wallet_type ENUM('customer', 'skill_provider') NOT NULL,
        customerId INT,
        skillProviderId INT,
        balance DECIMAL(15, 2) DEFAULT 0.00,
        merchant_fee DECIMAL(15, 2) DEFAULT 0.00,
        FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
    )
`;

// Create Transactions table if it doesn't exist
// const createTransactionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS transactions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         sender_customer_id INT, 
//         recipient_skill_provider_id INT,  
//         transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         description TEXT,
//         transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//         customer_transaction_approval ENUM('imcomplete', 'completed') DEFAULT 'pending',
//         fee DECIMAL(15, 2) DEFAULT 0.00,
//         metadata JSON,
//         transaction_hash VARCHAR(255),
//         confirmations INT DEFAULT 0,
//         transaction_fee_currency VARCHAR(10),
//         transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         status_message TEXT,
//         transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//         merchant_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

const createTransactionsTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_customer_id INT, 
    recipient_skill_provider_id INT,  
    transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    customer_transaction_approval ENUM('incomplete', 'completed') DEFAULT 'incomplete',
    fee DECIMAL(15, 2) DEFAULT 0.00,
    metadata JSON,
    transaction_hash VARCHAR(255),
    confirmations INT DEFAULT 0,
    transaction_fee_currency VARCHAR(10),
    transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    status_message TEXT,
    transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
    merchant_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
    FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
);

`

// Alter Wallets table to add nullable reference column
const alterWalletsTableQuery = `
    ALTER TABLE wallets
    ADD COLUMN reference VARCHAR(255) NULL,
    ADD UNIQUE KEY reference (reference);
`;

// Function to create Wallets table
async function createWalletsTable() {
    try {
        await query(createWalletsTableQuery);
        console.log('Wallets table created successfully');
    } catch (error) {
        console.error('Error creating Wallets table:', error);
    }
}


// Function to alter Wallets table
async function alterWalletsTable() {
    try {
        await query(alterWalletsTableQuery);
        console.log('Wallets table altered successfully');
    } catch (error) {
        console.error('Error altering Wallets table:', error);
    }
}


// Execute table creation and alteration queries
(async () => {
    await createWalletsTable();
    // await alterWalletsTable();
    await query(createTransactionsTableQuery);
    console.log('Tables created successfully');
})();

// CRUD operations for Wallets and Transactions
const walletAndTransactionsService = {};



// Function to fetch wallet by phone number
async function getWalletByPhoneNumber(phone, walletType) {
    const selectWalletQuery = `
        SELECT w.id, w.customerId, w.skillProviderId
        FROM wallets w
        JOIN ${walletType === 'customer' ? 'customers' : 'skill_providers'} p ON w.${walletType}Id = p.id
        WHERE p.phone = ? AND w.wallet_type = ?
    `;
    const result = await query(selectWalletQuery, [phone, walletType]);

    if (result.length === 0) {
        throw new Error('Wallet not found for the provided phone number');
    }

    return result[0];
}


// Get balance for a wallet
walletAndTransactionsService.getBalance = async (walletId) => {
    try {
        const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
        const result = await query(selectQuery, [walletId]);
        if (result.length === 0) {
            throw new Error('Wallet not found');
        }
        return result[0].balance;
    } catch (error) {
        throw error;
    }
};

// Get wallet owner name
walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
    try {
        const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
        const wallet = await query(selectWalletQuery, [walletId]);

        if (wallet.length === 0) {
            throw new Error('Wallet not found');
        }

        if (wallet[0].wallet_type === 'customer') {
            const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
            const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
            return `${customer[0].firstName} ${customer[0].lastName}`;
        } else {
            const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
            const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
            return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
        }
    } catch (error) {
        throw error;
    }
};


// Create a new wallet account
// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId)
//             VALUES (?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId };
//     } catch (error) {
//         throw error;
//     }
// };

// Create a new wallet account with a balance of 0.00
walletAndTransactionsService.createAccount = async (walletData) => {
    try {
        const { wallet_type, customerId, skillProviderId } = walletData;

        const insertWalletQuery = `
            INSERT INTO wallets (wallet_type, customerId, skillProviderId, balance)
            VALUES (?, ?, ?, ?)
        `;
        const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId, 0.00]);

        if (!walletResult.insertId) {
            throw new Error('Failed to create wallet');
        }

        return { id: walletResult.insertId };
    } catch (error) {
        throw error;
    }
};

// Method to get wallet details by wallet ID and filter by wallet type
walletAndTransactionsService.getWalletDetailsById = async (walletId) => {
    try {
        const selectWalletQuery = `
            SELECT id, wallet_type, customerId, skillProviderId, balance 
            FROM wallets 
            WHERE id = ?
        `;
        const wallet = await query(selectWalletQuery, [walletId]);

        if (wallet.length === 0) {
            throw new Error('Wallet not found');
        }

        const walletDetails = wallet[0];

        if (walletDetails.wallet_type === 'customer') {
            const selectCustomerQuery = `
                SELECT w.id, w.balance, c.firstName, c.lastName, c.email, c.phone 
                FROM wallets w 
                JOIN customers c ON w.customerId = c.id 
                WHERE w.id = ?
            `;
            const customerDetails = await query(selectCustomerQuery, [walletId]);
            return customerDetails[0];
        } else if (walletDetails.wallet_type === 'skill_provider') {
            const selectSkillProviderQuery = `
                SELECT w.id, w.balance, sp.firstName, sp.lastName, sp.email, sp.phone 
                FROM wallets w 
                JOIN skill_providers sp ON w.skillProviderId = sp.id 
                WHERE w.id = ?
            `;
            const skillProviderDetails = await query(selectSkillProviderQuery, [walletId]);
            return skillProviderDetails[0];
        } else {
            throw new Error('Invalid wallet type');
        }
    } catch (error) {
        throw error;
    }
};



// Function to get wallet details by customerId or skillProviderId
walletAndTransactionsService.getWalletDetailsByCustomerOrSkillProviderId = async (id) => {
    try {
        // Query to check if a wallet exists for the provided ID
        const walletExistsQuery = `
            SELECT id, wallet_type, customerId, skillProviderId
            FROM wallets
            WHERE customerId = ? OR skillProviderId = ?
        `;
        const walletRows = await query(walletExistsQuery, [id, id]);

        if (walletRows.length === 0) {
            return {
                status: 'error',
                message: 'No wallet found for the provided ID'
            };
        }

        const wallet = walletRows[0];

        // If wallet exists, determine the type and fetch additional details
        if (wallet.wallet_type === 'customer') {
            const customerWalletQuery = `
                SELECT w.id AS walletId, w.balance, c.firstName, c.lastName, c.email, c.phone 
                FROM wallets w
                JOIN customers c ON w.customerId = c.id 
                WHERE w.customerId = ?
            `;
            const customerWalletDetails = await query(customerWalletQuery, [id]);

            return {
                status: 'success',
                message: 'Customer wallet details retrieved successfully',
                data: customerWalletDetails[0]
            };
        } else if (wallet.wallet_type === 'skill_provider') {
            const skillProviderWalletQuery = `
                SELECT w.id AS walletId, w.balance, sp.firstName, sp.lastName, sp.email, sp.phone 
                FROM wallets w
                JOIN skill_providers sp ON w.skillProviderId = sp.id 
                WHERE w.skillProviderId = ?
            `;
            const skillProviderWalletDetails = await query(skillProviderWalletQuery, [id]);

            return {
                status: 'success',
                message: 'Skill provider wallet details retrieved successfully',
                data: skillProviderWalletDetails[0]
            };
        }

        // If wallet type is neither 'customer' nor 'skill_provider'
        return {
            status: 'error',
            message: 'Invalid wallet type found'
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Error retrieving wallet details: ${error.message}`
        };
    }
};


// Helper function to get wallet by phone number and type (customer or skill_provider)
walletAndTransactionsService.getWalletByPhone = async (phone, walletType) => {
    let selectWalletQuery;
    if (walletType === 'customer') {
        selectWalletQuery = `
            SELECT w.id, w.customerId 
            FROM wallets w 
            JOIN customers c ON w.customerId = c.id 
            WHERE c.phone = ? AND w.wallet_type = 'customer'
        `;
    } else if (walletType === 'skill_provider') {
        selectWalletQuery = `
            SELECT w.id, w.skillProviderId 
            FROM wallets w 
            JOIN skill_providers sp ON w.skillProviderId = sp.id 
            WHERE sp.phone = ? AND w.wallet_type = 'skill_provider'
        `;
    } else {
        throw new Error('Invalid wallet type');
    }

    const wallet = await query(selectWalletQuery, [phone]);
    if (wallet.length === 0) {
        throw new Error(`Wallet not found for ${walletType} with phone ${phone}`);
    }

    return wallet[0];
};

// Credit account using phone number
walletAndTransactionsService.creditAccount = async (phone, amount, description) => {
    const wallet = await walletAndTransactionsService.getWalletByPhone(phone, 'customer');

    const merchantFee = 100 + (amount * 0.2);
    const netAmount = amount - merchantFee;

    const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
    await query(updateBalanceQuery, [netAmount, wallet.id]);

    const insertTransactionQuery = `
        INSERT INTO transactions (sender_customer_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
        VALUES (?, 'credit', ?, ?, 'completed', ?, 'credit')
    `;
    const result = await query(insertTransactionQuery, [wallet.customerId, amount, description, merchantFee]);

    const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
    const transaction = await query(selectTransactionQuery, [result.insertId]);

    return {
        message: 'Account credited successfully',
        transaction: transaction[0]
    };
};




// walletAndTransactionsService.creditCustomerWalletAccount = async (phone, amount, description) => {
//     // Calculate the merchant fee and net amount
//     const merchantFee = 100 + (amount * 0.2); // Fixed 100 plus 0.2% of the amount
//     const netAmount = amount - merchantFee;

//     const findWalletSql = `SELECT * FROM wallets WHERE phone = ?`;
//     const creditWalletSql = `UPDATE wallets SET balance = balance + ? WHERE phone = ?`;
//     const recordTransactionSql = `INSERT INTO transactions (phone, amount, type, description) VALUES (?, ?, 'credit', ?)`;

//     try {
//         // Check if wallet exists
//         const wallet = await query(findWalletSql, [phone]);
//         if (!wallet.length) {
//             return { success: false, message: 'Wallet not found' }; // Error message for wallet not found
//         }

//         // Update wallet balance with the net amount after merchant fee deduction
//         await query(creditWalletSql, [netAmount, phone]);

//         // Record the credit transaction with the original amount and mention the fee deduction in the description
//         await query(recordTransactionSql, [phone, netAmount, description + ` (Merchant Fee: ${merchantFee})`]);

//         return {
//             success: true,
//             message: 'Wallet credited successfully',
//             originalAmount: amount,
//             merchantFee,
//             netAmount,
//             phone
//         };
//     } catch (error) {
//         return { success: false, message: `Credit Wallet Error: ${error.message}` }; // Return error message
//     }
// };


walletAndTransactionsService.creditCustomerWalletAccount = async (customerId, amount, description) => {
    // Calculate the merchant fee and net amount
    const merchantFee = 100 + (amount * 0.2); // Fixed 100 plus 0.2% of the amount
    const netAmount = amount - merchantFee;

    const findWalletSql = `SELECT * FROM wallets WHERE customerId = ?`;
    const creditWalletSql = `UPDATE wallets SET balance = balance + ? WHERE customerId = ?`;
    const recordTransactionSql = `INSERT INTO transactions (customerId, amount, type, description) VALUES (?, ?, 'credit', ?)`;

    try {
        // Check if wallet exists
        const wallet = await query(findWalletSql, [customerId]);
        if (!wallet.length) {
            return { success: false, message: 'Wallet not found' }; // Error message for wallet not found
        }

        // Update wallet balance with the net amount after merchant fee deduction
        await query(creditWalletSql, [netAmount, customerId]);

        // Record the credit transaction with the original amount and mention the fee deduction in the description
        await query(recordTransactionSql, [customerId, netAmount, description + ` (Merchant Fee: ${merchantFee})`]);

        return {
            success: true,
            message: 'Wallet credited successfully',
            originalAmount: amount,
            merchantFee,
            netAmount,
            customerId
        };
    } catch (error) {
        return { success: false, message: `Credit Wallet Error: ${error.message}` }; // Return error message
    }
};



// Transfer funds between accounts using phone numbers
walletAndTransactionsService.transferToAccount = async (senderPhone, recipientPhone, amount, description) => {
    const senderWallet = await walletAndTransactionsService.getWalletByPhone(senderPhone, 'customer');
    const recipientWallet = await walletAndTransactionsService.getWalletByPhone(recipientPhone, 'skill_provider');

    const senderBalance = await walletAndTransactionsService.getBalance(senderWallet.id);
    if (senderBalance < amount) {
        throw new Error('Insufficient balance');
    }

    const merchantFee = 100 + (amount * 0.05);
    const netAmount = amount - merchantFee;

    await query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, senderWallet.id]);
    await query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [netAmount, recipientWallet.id]);

    const insertSenderTransactionQuery = `
        INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, fee, transaction_category)
        VALUES (?, ?, 'transfer', ?, ?, 'completed', ?, 'transfer')
    `;
    await query(insertSenderTransactionQuery, [senderWallet.customerId, recipientWallet.skillProviderId, amount, description, merchantFee]);

    const insertRecipientTransactionQuery = `
        INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
        VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
    `;
    const recipientTransactionResult = await query(insertRecipientTransactionQuery, [senderWallet.customerId, recipientWallet.skillProviderId, netAmount, description]);

    const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
    const transaction = await query(selectTransactionQuery, [recipientTransactionResult.insertId]);

    return {
        message: 'Transfer completed successfully',
        transaction: transaction[0]
    };
};

// Get wallet balance by wallet ID
walletAndTransactionsService.getBalance = async (walletId) => {
    const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
    const result = await query(selectQuery, [walletId]);
    if (result.length === 0) {
        throw new Error('Wallet not found');
    }
    return result[0].balance;
};

// Get transactions for a customer by customer ID
walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
    const selectQuery = `
        SELECT 
            t.id AS transaction_id,
            CONCAT(sp.firstName, ' ', sp.lastName) AS receiver_name,
            t.amount,
            t.description,
            t.transaction_date,
            t.transaction_status,
            t.fee AS transaction_fee,
            t.merchant_fee_amount AS merchant_fee
        FROM transactions t
        LEFT JOIN skill_providers sp ON t.recipient_skill_provider_id = sp.id
        WHERE t.sender_customer_id = ?
        ORDER BY t.transaction_date DESC
    `;
    const transactions = await query(selectQuery, [customerId]);
    return transactions;
};

// Get transactions for a skill provider by skill provider ID
walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
    const selectQuery = `
        SELECT 
            t.id AS transaction_id,
            CONCAT(c.firstName, ' ', c.lastName) AS sender_name,
            t.amount,
            t.description,
            t.transaction_date,
            t.transaction_status,
            t.fee AS transaction_fee,
            t.merchant_fee_amount AS merchant_fee
        FROM transactions t
        LEFT JOIN customers c ON t.sender_customer_id = c.id
        WHERE t.recipient_skill_provider_id = ?
        ORDER BY t.transaction_date DESC
    `;
    const transactions = await query(selectQuery, [skillProviderId]);
    return transactions;
};

// Credit account using Paystack
// walletAndTransactionsService.creditAccount = async (phone, amount, description) => {
//     // Get wallet details
//     const wallet = await walletAndTransactionsService.getWalletByPhone(phone, 'customer');
    
//     // Initiate Paystack transaction
//     const email = 'customer@example.com'; // Replace with actual customer email
//     const paystackResponse = await initiateTransaction(amount, email);
//     const paymentLink = paystackResponse.data.authorization_url;

//     return {
//         message: 'Payment initiated successfully',
//         paymentLink
//     };
// };

// Verify and complete transaction
walletAndTransactionsService.completeTransaction = async (reference) => {
    // Verify Paystack transaction
    const verificationResponse = await verifyTransaction(reference);
    const transactionData = verificationResponse.data;

    if (transactionData.status === 'success') {
        const wallet = await walletAndTransactionsService.getWalletByPhoneNumber(transactionData.email, 'customer');

        // Calculate fees and net amount
        const amount = transactionData.amount / 100; // Convert kobo to currency
        const merchantFee = 100 + (amount * 0.2);
        const netAmount = amount - merchantFee;

        // Update wallet balance
        const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
        await query(updateBalanceQuery, [netAmount, wallet.id]);

        // Record transaction
        const insertTransactionQuery = `
            INSERT INTO transactions (sender_customer_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
            VALUES (?, 'credit', ?, ?, 'completed', ?, 'credit')
        `;
        await query(insertTransactionQuery, [wallet.customerId, amount, description, merchantFee]);

        return {
            message: 'Account credited successfully',
            transactionData
        };
    } else {
        throw new Error('Transaction verification failed');
    }
};


module.exports = walletAndTransactionsService;








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

// // Create Wallets table if it doesn't exist
// const createWalletsTableQuery = `
//     CREATE TABLE IF NOT EXISTS wallets (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         wallet_type ENUM('customer', 'skill_provider') NOT NULL,
//         customerId INT,
//         skillProviderId INT,
//         balance DECIMAL(15, 2) DEFAULT 0.00,
//         merchant_fee DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Create Transactions table if it doesn't exist
// const createTransactionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS transactions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         sender_customer_id INT, 
//         recipient_skill_provider_id INT,  
//         transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         description TEXT,
//         transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//         fee DECIMAL(15, 2) DEFAULT 0.00,
//         metadata JSON,
//         transaction_hash VARCHAR(255),
//         confirmations INT DEFAULT 0,
//         transaction_fee_currency VARCHAR(10),
//         transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         status_message TEXT,
//         transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//         merchant_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Wallets table
// async function createWalletsTable() {
//     try {
//         await query(createWalletsTableQuery);
//         console.log('Wallets table created successfully');
//     } catch (error) {
//         console.error('Error creating Wallets table:', error);
//     }
// }

// // Execute table creation and alteration queries
// (async () => {
//     await createWalletsTable();
//     await query(createTransactionsTableQuery);
//     console.log('Tables created successfully');
// })();

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Wallets and Transactions
// const walletAndTransactionsService = {};


// walletAndTransactionsService.getBalance = async (walletId) => {
//     try {
//         const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
//         const result = await query(selectQuery, [walletId]);
//         if (result.length === 0) {
//             throw new Error('Wallet not found');
//         }
//         return result[0].balance;
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
//     try {
//         const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         if (wallet[0].wallet_type === 'customer') {
//             const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
//             const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
//             return `${customer[0].firstName} ${customer[0].lastName}`;
//         } else {
//             const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
//             const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
//             return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId)
//             VALUES (?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.creditAccount = async (walletId, amount, description) => {
//     try {
//         // Calculate merchant fee for customer
//         const merchantFee = 100 + (amount * 0.2);
//         const netAmount = amount - merchantFee;

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
//         await query(updateBalanceQuery, [netAmount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
//             VALUES (?, ?, 'credit', ?, ?, 'completed', ?, 'credit')
//         `;
//         const result = await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description, merchantFee]);

//         // Retrieve the inserted transaction details
//         const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
//         const transaction = await query(selectTransactionQuery, [result.insertId]);

//         return {
//             message: 'Account credited successfully',
//             transaction: transaction[0] // Include details of the inserted transaction
//         };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.debitAccount = async (walletId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const balance = await walletAndTransactionsService.getBalance(walletId);
//         if (balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance - ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'debit', ?, ?, 'completed', 'debit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account debited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.transferToAccount = async (senderWalletId, recipientSkillProviderId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const senderBalance = await walletAndTransactionsService.getBalance(senderWalletId);
//         if (senderBalance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Calculate merchant fee for skill provider
//         const merchantFee = 100 + (amount * 0.05);
//         const netAmount = amount - merchantFee;

//         // Get recipient wallet information
//         const recipientWalletQuery = 'SELECT id FROM wallets WHERE skillProviderId = ?';
//         const recipientWallet = await query(recipientWalletQuery, [recipientSkillProviderId]);

//         if (recipientWallet.length === 0) {
//             throw new Error('Recipient wallet not found');
//         }

//         // Update balances
//         await query('UPDATE wallets SET balance = balance - ? WHERE id = ?', [amount, senderWalletId]);
//         await query('UPDATE wallets SET balance = balance + ? WHERE id = ?', [netAmount, recipientWallet[0].id]);

//         // Record transactions
//         const insertSenderTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', ?, 'transfer')
//         `;
//         await query(insertSenderTransactionQuery, [senderWalletId, recipientSkillProviderId, amount, description, 0]);

//         const insertRecipientTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, merchant_fee_amount, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', ?, 'transfer')
//         `;
//         await query(insertRecipientTransactionQuery, [null, recipientWallet[0].id, netAmount, description, merchantFee]);

//         return { message: 'Transfer completed successfully' };
//     } catch (error) {
//         throw error;
//     }
// };



// walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.sender_customer_id = ?
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for customer: ' + error.message);
//     }
// };



// walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.recipient_skill_provider_id = ?
//             AND t.transaction_type = 'credit'
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for skill provider: ' + error.message);
//     }
// };

// // Get all transactions
// walletAndTransactionsService.getAllTransactions = async () => {
//     try {
//         const selectAllTransactionsQuery = `
//             SELECT * FROM transactions
//             ORDER BY transaction_date DESC
//         `;
//         const transactions = await query(selectAllTransactionsQuery);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving all transactions: ' + error.message);
//     }
// };

// // Get transactions between a specific customer and skill provider
// walletAndTransactionsService.getTransactionsBetweenCustomerAndProvider = async (customerId, skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT * FROM transactions
//             WHERE sender_customer_id = ? AND recipient_skill_provider_id = ?
//             OR sender_customer_id = ? AND recipient_skill_provider_id = ?
//             ORDER BY transaction_date DESC
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId, skillProviderId, skillProviderId, customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions between customer and skill provider: ' + error.message);
//     }
// };



// module.exports = walletAndTransactionsService;


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

// // Create Wallets table if it doesn't exist
// const createWalletsTableQuery = `
//     CREATE TABLE IF NOT EXISTS wallets (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         wallet_type ENUM('customer', 'skill_provider') NOT NULL,
//         customerId INT,
//         skillProviderId INT,
//         balance DECIMAL(15, 2) DEFAULT 0.00,
//         FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Create Transactions table if it doesn't exist
// const createTransactionsTableQuery = `
//     CREATE TABLE IF NOT EXISTS transactions (
//         id INT AUTO_INCREMENT PRIMARY KEY,
//         sender_customer_id INT, 
//         recipient_skill_provider_id INT,  
//         transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//         amount DECIMAL(15, 2) NOT NULL,
//         description TEXT,
//         transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//         fee DECIMAL(15, 2) DEFAULT 0.00,
//         metadata JSON,
//         transaction_hash VARCHAR(255),
//         confirmations INT DEFAULT 0,
//         transaction_fee_currency VARCHAR(10),
//         transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//         transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//         completed_at TIMESTAMP NULL,
//         status_message TEXT,
//         transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//         FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//         FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
//     )
// `;

// // Function to create Wallets table
// async function createWalletsTable() {
//     try {
//         await query(createWalletsTableQuery);
//         console.log('Wallets table created successfully');
//     } catch (error) {
//         console.error('Error creating Wallets table:', error);
//     }
// }

// // Execute table creation and alteration queries
// (async () => {
//     await createWalletsTable();
//     await query(createTransactionsTableQuery);
//     console.log('Tables created successfully');
// })();

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Wallets and Transactions
// const walletAndTransactionsService = {};

// walletAndTransactionsService.getBalance = async (walletId) => {
//     try {
//         const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
//         const result = await query(selectQuery, [walletId]);
//         if (result.length === 0) {
//             throw new Error('Wallet not found');
//         }
//         return result[0].balance;
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
//     try {
//         const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         if (wallet[0].wallet_type === 'customer') {
//             const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
//             const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
//             return `${customer[0].firstName} ${customer[0].lastName}`;
//         } else {
//             const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
//             const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
//             return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
//         }
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId)
//             VALUES (?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId };
//     } catch (error) {
//         throw error;
//     }
// };


// walletAndTransactionsService.creditAccount = async (walletId, amount, description) => {
//     try {
//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'credit', ?, ?, 'completed', 'credit')
//         `;
//         const result = await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         // Retrieve the inserted transaction details
//         const selectTransactionQuery = 'SELECT * FROM transactions WHERE id = ?';
//         const transaction = await query(selectTransactionQuery, [result.insertId]);

//         return {
//             message: 'Account credited successfully',
//             transaction: transaction[0] // Include details of the inserted transaction
//         };
//     } catch (error) {
//         throw error;
//     }
// };


// walletAndTransactionsService.debitAccount = async (walletId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const balance = await walletAndTransactionsService.getBalance(walletId);
//         if (balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance - ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'debit', ?, ?, 'completed', 'debit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account debited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.transferToAccount = async (senderWalletId, recipientSkillProviderId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const senderBalance = await walletAndTransactionsService.getBalance(senderWalletId);
//         if (senderBalance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Get recipient wallet ID from skill provider ID
//         const selectRecipientWalletQuery = 'SELECT id FROM wallets WHERE skillProviderId = ?';
//         const recipientWallet = await query(selectRecipientWalletQuery, [recipientSkillProviderId]);

//         if (recipientWallet.length === 0) {
//             throw new Error('Recipient wallet not found');
//         }

//         const recipientWalletId = recipientWallet[0].id;

//         // Update sender balance
//         await walletAndTransactionsService.debitAccount(senderWalletId, amount, description);

//         // Update recipient balance
//         await walletAndTransactionsService.creditAccount(recipientWalletId, amount, description);

//         // Record transaction for sender
//         const selectSenderWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const senderWallet = await query(selectSenderWalletQuery, [senderWalletId]);

//         const insertSenderTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
//         `;
//         await query(insertSenderTransactionQuery, [senderWallet[0].customerId, recipientSkillProviderId, amount, description]);

//         // Record transaction for recipient
//         const insertRecipientTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
//         `;
//         await query(insertRecipientTransactionQuery, [recipientSkillProviderId, senderWallet[0].customerId, amount, description]);

//         return { message: 'Transfer successful' };
//     } catch (error) {
//         throw error;
//     }
// };



// walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.sender_customer_id = ?
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for customer: ' + error.message);
//     }
// };



// walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, CONCAT(c.firstName, ' ', c.lastName) AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_customer_id = w.customerId
//             JOIN customers c ON w.customerId = c.id
//             WHERE t.recipient_skill_provider_id = ?
//             AND t.transaction_type = 'credit'
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for skill provider: ' + error.message);
//     }
// };

// module.exports = walletAndTransactionsService;


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

// // Create Customers table if it doesn't exist
// const createWalletsTableQuery = `
//     CREATE TABLE IF NOT EXISTS wallets (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     wallet_type ENUM('customer', 'skill_provider') NOT NULL,
//     customerId INT,
//     skillProviderId INT,
//     balance DECIMAL(15, 2) DEFAULT 0.00,
//     FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE,
//     FOREIGN KEY (skillProviderId) REFERENCES skill_providers(id) ON DELETE CASCADE
// )

// `;

// // Create Users table if it doesn't exist
// const createTransactionsTableQuery = `
//    CREATE TABLE IF NOT EXISTS transactions (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     sender_customer_id INT, 
//     recipient_skill_provider_id INT,  
//     transaction_type ENUM('credit', 'debit', 'transfer') NOT NULL,
//     amount DECIMAL(15, 2) NOT NULL,
//     description TEXT,
//     transaction_status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
//     fee DECIMAL(15, 2) DEFAULT 0.00,
//     metadata JSON,
//     transaction_hash VARCHAR(255),
//     confirmations INT DEFAULT 0,
//     transaction_fee_currency VARCHAR(10),
//     transaction_fee_amount DECIMAL(15, 2) DEFAULT 0.00,
//     transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     completed_at TIMESTAMP NULL,
//     status_message TEXT,
//     transaction_category ENUM('transfer', 'payment', 'refund') NOT NULL,
//     FOREIGN KEY (sender_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
//     FOREIGN KEY (recipient_skill_provider_id) REFERENCES skill_providers(id) ON DELETE CASCADE
// )
// `;


// // Function to create Users table
// async function createWalletsTable() {
//     try {
//         await query(createWalletsTableQuery);
//         console.log('create Wallets table successfully');
//     } catch (error) {
//         console.error('Error creating Users table:', error);
//     }
// }


// // Execute table creation and alteration queries
// (async () => {
//     await createWalletsTable();
//     // await alterUsersTable();
//     await query(createTransactionsTableQuery);
//     await query(createWalletsTableQuery);
//     console.log('Tables created successfully');
// })();

// // Function to sign JWT token
// const signToken = (id) => {
//     return jwt.sign({ id }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRES_IN,
//     });
// };

// // CRUD operations for Default Email
// const walletAndTransactionsService = {};



// walletAndTransactionsService.getBalance = async (walletId) => {
//     try {
//         const selectQuery = 'SELECT balance FROM wallets WHERE id = ?';
//         const result = await query(selectQuery, [walletId]);
//         if (result.length === 0) {
//             throw new Error('Wallet not found');
//         }
//         return result[0].balance;
//     } catch (error) {
//         throw error;
//     }
// };


// walletAndTransactionsService.getWalletOwnerName = async (walletId) => {
//     try {
//         const selectWalletQuery = 'SELECT wallet_type, customerId, skillProviderId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         if (wallet[0].wallet_type === 'customer') {
//             const selectCustomerQuery = 'SELECT firstName, lastName FROM customers WHERE id = ?';
//             const customer = await query(selectCustomerQuery, [wallet[0].customerId]);
//             return `${customer[0].firstName} ${customer[0].lastName}`;
//         } else {
//             const selectSkillProviderQuery = 'SELECT firstName, lastName FROM skill_providers WHERE id = ?';
//             const skillProvider = await query(selectSkillProviderQuery, [wallet[0].skillProviderId]);
//             return `${skillProvider[0].firstName} ${skillProvider[0].lastName}`;
//         }
//     } catch (error) {
//         throw error;
//     }
// };


// walletAndTransactionsService.createAccount = async (walletData) => {
//     try {
//         const { wallet_type, customerId, skillProviderId } = walletData;

//         const insertWalletQuery = `
//             INSERT INTO wallets (wallet_type, customerId, skillProviderId)
//             VALUES (?, ?, ?)
//         `;
//         const walletResult = await query(insertWalletQuery, [wallet_type, customerId, skillProviderId]);

//         if (!walletResult.insertId) {
//             throw new Error('Failed to create wallet');
//         }

//         return { id: walletResult.insertId };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.creditAccount = async (walletId, amount, description) => {
//     try {
//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance + ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'credit', ?, ?, 'completed', 'credit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account credited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.debitAccount = async (walletId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const balance = await customerService.getBalance(walletId);
//         if (balance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Update balance
//         const updateBalanceQuery = 'UPDATE wallets SET balance = balance - ? WHERE id = ?';
//         await query(updateBalanceQuery, [amount, walletId]);

//         // Record transaction
//         const selectWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const wallet = await query(selectWalletQuery, [walletId]);

//         if (wallet.length === 0) {
//             throw new Error('Wallet not found');
//         }

//         const insertTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'debit', ?, ?, 'completed', 'debit')
//         `;
//         await query(insertTransactionQuery, [wallet[0].customerId, wallet[0].skillProviderId, amount, description]);

//         return { message: 'Account debited successfully' };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.transferToAccount = async (senderWalletId, recipientSkillProviderId, amount, description) => {
//     try {
//         // Check if sufficient balance exists
//         const senderBalance = await customerService.getBalance(senderWalletId);
//         if (senderBalance < amount) {
//             throw new Error('Insufficient balance');
//         }

//         // Get recipient wallet ID from skill provider ID
//         const selectRecipientWalletQuery = 'SELECT id FROM wallets WHERE skillProviderId = ?';
//         const recipientWallet = await query(selectRecipientWalletQuery, [recipientSkillProviderId]);

//         if (recipientWallet.length === 0) {
//             throw new Error('Recipient wallet not found');
//         }

//         const recipientWalletId = recipientWallet[0].id;

//         // Update sender balance
//         await customerService.debitAccount(senderWalletId, amount, description);

//         // Update recipient balance
//         await customerService.creditAccount(recipientWalletId, amount, description);

//         // Record transaction for sender
//         const selectSenderWalletQuery = 'SELECT customerId FROM wallets WHERE id = ?';
//         const senderWallet = await query(selectSenderWalletQuery, [senderWalletId]);

//         const insertSenderTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
//         `;
//         await query(insertSenderTransactionQuery, [senderWallet[0].customerId, recipientSkillProviderId, amount, description]);

//         // Record transaction for recipient
//         const insertRecipientTransactionQuery = `
//             INSERT INTO transactions (sender_customer_id, recipient_skill_provider_id, transaction_type, amount, description, transaction_status, transaction_category)
//             VALUES (?, ?, 'transfer', ?, ?, 'completed', 'transfer')
//         `;
//         await query(insertRecipientTransactionQuery, [recipientSkillProviderId, senderWallet[0].customerId, amount, description]);

//         return { message: 'Transfer successful' };
//     } catch (error) {
//         throw error;
//     }
// };

// walletAndTransactionsService.getTransactionsForCustomer = async (customerId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, c.name AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_wallet_id = w.id
//             JOIN customers c ON w.customer_id = c.id
//             WHERE t.sender_wallet_id = ?
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [customerId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for customer: ' + error.message);
//     }
// };

// walletAndTransactionsService.getTransactionsForSkillProvider = async (skillProviderId) => {
//     try {
//         const selectTransactionsQuery = `
//             SELECT t.*, c.name AS sender_name
//             FROM transactions t
//             JOIN wallets w ON t.sender_wallet_id = w.id
//             JOIN customers c ON w.customer_id = c.id
//             WHERE t.recipient_wallet_id = ?
//             AND t.transaction_type = 'credit'
//             ORDER BY t.transaction_date DESC;
//         `;
//         const transactions = await query(selectTransactionsQuery, [skillProviderId]);
//         return transactions;
//     } catch (error) {
//         throw new Error('Error retrieving transactions for skill provider: ' + error.message);
//     }
// };

// module.exports = walletAndTransactionsService