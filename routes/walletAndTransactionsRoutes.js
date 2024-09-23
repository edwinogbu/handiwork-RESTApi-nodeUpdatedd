// const express = require('express');
// const router = express.Router();

// const walletAndTransactionsController = require('../controllers/walletAndTransactionsController');

// // Route to get balance of a wallet
// router.get('/balance/:walletId', walletAndTransactionsController.getBalance);

// // Route to get wallet owner's name
// router.get('/walletOwner/:walletId', walletAndTransactionsController.getWalletOwnerName);

// // Route to create a new wallet
// router.post('/creatWallet', walletAndTransactionsController.createAccount);

// // Route to credit an account
// router.post('/credit', walletAndTransactionsController.creditAccount);

// // Route to debit an account
// router.post('/debit', walletAndTransactionsController.debitAccount);

// // Route to transfer amount between accounts
// router.post('/transfer', walletAndTransactionsController.transferToAccount);

// // Route to get transactions for a customer
// router.get('/customerTransactions/:customerId', walletAndTransactionsController.getTransactionsForCustomer);

// // Route to get transactions for a skill provider
// router.get('/skillProviderTransactions/:skillProviderId', walletAndTransactionsController.getTransactionsForSkillProvider);

// module.exports = router;




// const express = require('express');
// const router = express.Router();
// const walletAndTransactionsController = require('../controllers/walletAndTransactionsController');

// // Create Wallet
// router.post('/creatWallet', walletAndTransactionsController.createWallet);

// // Credit Wallet
// router.post('/credit/:walletId', walletAndTransactionsController.creditWallet);
// // router.post('/:walletId/credit', walletAndTransactionsController.creditWallet);

// // Debit Wallet
// router.post('/debit', walletAndTransactionsController.debitWallet);

// // Transfer to Account
// router.post('/transfer', walletAndTransactionsController.transferToAccount);

// // Get Balance
// router.get('/balance/:id', walletAndTransactionsController.getBalance);

// // Get Wallet Owner Name
// router.get('/walletOwner/:id', walletAndTransactionsController.getWalletOwnerName);

// // Get Transactions for Customer
// router.get('/customerTransactions/:id', walletAndTransactionsController.getTransactionsForCustomer);

// // Get Transactions for Skill Provider
// router.get('/skill-providers/:id/transactions', walletAndTransactionsController.getTransactionsForSkillProvider);


// router.get('/transactions/customer/:customerId/skill-provider/:skillProviderId', walletAndTransactionsController.getTransactionsBetweenCustomerAndSkillProvider);

// router.get('/transactions', walletAndTransactionsController.getAllTransactions);


// module.exports = router;




const express = require('express');
const router = express.Router();
const walletAndTransactionsController = require('../controllers/walletAndTransactionsController');

// Create Wallet
router.post('/creatWallet', walletAndTransactionsController.createWallet);
// https://server.handiwork.com.ng/api/wallet/creatWallet

// Get Wallet Balance by Wallet ID
router.get('/balance/:walletId', walletAndTransactionsController.getBalance);
router.get('/walletDetails/:walletId', walletAndTransactionsController.getWalletDetails);
// Get Wallet Balance by Wallet ID
// https://server.handiwork.com.ng/api/wallet/balance/:walletId

// Get Wallet Owner Name by Wallet ID
router.get('/walletOwner/:walletId', walletAndTransactionsController.getWalletOwnerName);
// Get Wallet Owner Name by Wallet ID
// https://server.handiwork.com.ng/api/wallet/walletOwner/:walletId

// Credit Account by Phone Number
router.post('/credit', walletAndTransactionsController.creditAccount);
// Credit customer wallet using customer Account phone number by Phone Number
// https://server.handiwork.com.ng/api/wallet/credit


// Transfer Funds Between Accounts
router.post('/transfer', walletAndTransactionsController.transferToAccount);

https://server.handiwork.com.ng/api/wallet/transfer

// Get Transactions for a Customer by Customer ID
router.get('/customerTransactions/:customerId', walletAndTransactionsController.getTransactionsForCustomer);

// Get Transactions for a Skill Provider by Skill Provider ID
router.get('/skillProviderTransactions/:skillProviderId', walletAndTransactionsController.getTransactionsForSkillProvider);

module.exports = router;
