const walletAndTransactionsService = require('../services/walletAndTransactionsService');


// Get Balance
async function getBalance(req, res) {
    try {
        const { walletId } = req.params;
        const balance = await walletAndTransactionsService.getBalance(walletId);
        res.json({ success: true, message: 'Balance retrieved successfully', balance });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve balance: ' + error.message });
    }
}

// Get Wallet Owner Name
async function getWalletOwnerName(req, res) {
    try {
        const { walletId } = req.params;
        const ownerName = await walletAndTransactionsService.getWalletOwnerName(walletId);
        res.json({ success: true, message: 'Owner name retrieved successfully', ownerName });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve owner name: ' + error.message });
    }
}



// Create Wallet Account
async function createWallet(req, res) {
    try {
        const walletData = req.body;
        const result = await walletAndTransactionsService.createAccount(walletData);
        res.json({ success: true, message: 'Wallet account created successfully', walletId: result.id });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to create wallet account: ' + error.message });
    }
}

// Credit Account
async function creditAccount(req, res) {
    try {
        const { phone, amount, description } = req.body;
        const result = await walletAndTransactionsService.creditAccount(phone, amount, description);
        res.json({ success: true, message: 'Account credited successfully', transaction: result.transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to credit account: ' + error.message });
    }
}



// Get wallet details by wallet ID and filter by wallet type
async function getWalletDetails(req, res) {
    try {
        const { walletId } = req.params;

        // Validate input
        if (!walletId) {
            return res.status(400).json({ message: 'Wallet ID is required' });
        }

        // Call the service method to get wallet details
        const walletDetails = await walletAndTransactionsService.getWalletDetailsById(walletId);

        // Return a successful response with wallet details
        res.status(200).json(walletDetails);
    } catch (error) {
        // Handle errors and send error response
        res.status(500).json({
            message: 'Failed to retrieve wallet details',
            error: error.message,
        });
    }
};

// Transfer Funds
async function transferToAccount(req, res) {
    try {
        const { senderPhone, recipientPhone, amount, description } = req.body;
        const result = await walletAndTransactionsService.transferToAccount(senderPhone, recipientPhone, amount, description);
        res.json({ success: true, message: 'Funds transferred successfully', transaction: result.transaction });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to transfer funds: ' + error.message });
    }
}

// Get Transactions for Customer
async function getTransactionsForCustomer(req, res) {
    try {
        const { customerId } = req.params;
        const transactions = await walletAndTransactionsService.getTransactionsForCustomer(customerId);
        res.json({ success: true, message: 'Customer transactions retrieved successfully', transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve customer transactions: ' + error.message });
    }
}

// Get Transactions for Skill Provider
async function getTransactionsForSkillProvider(req, res) {
    try {
        const { skillProviderId } = req.params;
        const transactions = await walletAndTransactionsService.getTransactionsForSkillProvider(skillProviderId);
        res.json({ success: true, message: 'Skill provider transactions retrieved successfully', transactions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to retrieve skill provider transactions: ' + error.message });
    }
}


// Controller function to get wallet details by customerId or skillProviderId
const getWalletDetailsByCustomerOrSkillProviderId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID parameter
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID parameter is required. Please provide a valid customerId or skillProviderId.',
            });
        }

        // Retrieve wallet details
        const walletDetails = await walletAndTransactionsService.getWalletDetailsByCustomerOrSkillProviderId(id);

        // Check if wallet details were found
        if (!walletDetails) {
            return res.status(404).json({
                success: false,
                message: `No wallet found for the provided ID: ${id}. Please check the ID and try again.`,
            });
        }

        // Determine if the wallet belongs to a customer or skill provider
        const walletType = walletDetails.wallet_type;
        if (walletType === 'customer') {
            return res.status(200).json({
                success: true,
                message: `Customer wallet details retrieved successfully for customerId: ${id}.`,
                data: {
                    walletId: walletDetails.id,
                    balance: walletDetails.balance,
                    customerDetails: {
                        firstName: walletDetails.firstName,
                        lastName: walletDetails.lastName,
                        email: walletDetails.email,
                        phone: walletDetails.phone,
                    }
                }
            });
        } else if (walletType === 'skill_provider') {
            return res.status(200).json({
                success: true,
                message: `Skill provider wallet details retrieved successfully for skillProviderId: ${id}.`,
                data: {
                    walletId: walletDetails.id,
                    balance: walletDetails.balance,
                    skillProviderDetails: {
                        firstName: walletDetails.firstName,
                        lastName: walletDetails.lastName,
                        email: walletDetails.email,
                        phone: walletDetails.phone,
                    }
                }
            });
        } else {
            return res.status(400).json({
                success: false,
                message: `Invalid wallet type for the provided ID: ${id}. The wallet type must be either 'customer' or 'skill_provider'.`,
            });
        }

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred while retrieving wallet details. Please try again later.',
            error: error.message,
        });
    }
};

// const creditCustomerWalletAccount = async (req, res) => {
//     const { phone, amount, description } = req.body;

//     try {
//         const result = await walletAndTransactionsService.creditAccount(phone, amount, description);

//         if (result.success) {
//             return res.status(200).json(result); // Send success response
//         } else {
//             return res.status(400).json(result); // Send failure response with proper message
//         }
//     } catch (error) {
//         const errorMessage = `Unexpected Error: ${error.message}`;
//         logger.error(errorMessage, { phone, amount, description });
//         return res.status(500).json({ success: false, message: errorMessage });
//     }
// };

// const creditCustomerWalletAccount = async (req, res) => {
//     const { phone, amount, description } = req.body;

//     try {
//         const result = await walletAndTransactionsService.creditCustomerWalletAccount(phone, amount, description);

//         if (result.success) {
//             return res.status(200).json({
//                 success: true,
//                 message: result.message,
//                 originalAmount: result.originalAmount,
//                 merchantFee: result.merchantFee,
//                 netAmount: result.netAmount,
//                 phone: result.phone
//             }); // Send success response
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: result.message
//             }); // Send failure response with proper message
//         }
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: `Unexpected Error: ${error.message}` // Handle unexpected errors
//         });
//     }
// };

const creditCustomerWalletAccount = async (req, res) => {
    const { customerId, amount, description } = req.body;

    try {
        const result = await walletAndTransactionsService.creditCustomerWalletAccount(customerId, amount, description);

        if (result.success) {
            return res.status(200).json({
                success: true,
                message: result.message,
                originalAmount: result.originalAmount,
                merchantFee: result.merchantFee,
                netAmount: result.netAmount,
                customerId: result.customerId
            }); // Send success response
        } else {
            return res.status(400).json({
                success: false,
                message: result.message
            }); // Send failure response with proper message
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: `Unexpected Error: ${error.message}` // Handle unexpected errors
        });
    }
};


module.exports = {
    getBalance,
    getWalletOwnerName,
    createWallet,
    creditAccount,
    transferToAccount,
    getTransactionsForCustomer,
    getTransactionsForSkillProvider,
    getWalletDetails,
    getWalletDetailsByCustomerOrSkillProviderId,
    creditCustomerWalletAccount,
};



// const walletAndTransactionsService = require('../services/walletAndTransactionsService');

// // Create Wallet
// async function createWallet(req, res) {
//     try {
//         const walletData = req.body;
//         const wallet = await walletAndTransactionsService.createAccount(walletData);

//         res.status(201).json({
//             success: true,
//             message: 'Wallet created successfully',
//             wallet
//         });
//     } catch (error) {
//         console.error('Error creating wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create wallet',
//             error: error.message
//         });
//     }
// }



// async function creditWallet(req, res){
//     try {
//         const walletId = req.params.walletId;
//         const { amount, description } = req.body;

//           // Ensure amount and description are provided
//           if (amount === undefined || description === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount and description are required'
//             });
//         }

//         // Call the service to credit the wallet
//         const result = await walletAndTransactionsService.creditAccount(walletId, amount, description);

//         // Return response with transaction details
//         res.status(200).json({
//             success: true,
//             message: result.message,
//             transaction: {
//                 amount: result.transaction.amount,
//                 description: result.transaction.description,
//                 transaction_date: result.transaction.transaction_date
//             }
//         });
//     } catch (error) {
//         console.error('Error crediting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to credit wallet',
//             error: error.message
//         });
//     }
// };

// // Debit Wallet
// async function debitWallet(req, res) {
//     try {
//         const { walletId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.debitAccount(walletId, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Account debited successfully',
//             result
//         });
//     } catch (error) {
//         console.error('Error debiting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to debit wallet',
//             error: error.message
//         });
//     }
// }

// // Transfer to Account
// async function transferToAccount(req, res) {
//     try {
//         const { senderWalletId, recipientSkillProviderId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.transferToAccount(senderWalletId, recipientSkillProviderId, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Transfer successful',
//             result
//         });
//     } catch (error) {
//         console.error('Error transferring funds:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to transfer funds',
//             error: error.message
//         });
//     }
// }

// // Get Balance
// async function getBalance(req, res) {
//     try {
//         const walletId = req.params.id;
//         const balance = await walletAndTransactionsService.getBalance(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Balance fetched successfully',
//             balance
//         });
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch balance',
//             error: error.message
//         });
//     }
// }

// // Get Wallet Owner Name
// async function getWalletOwnerName(req, res) {
//     try {
//         const walletId = req.params.id;
//         const name = await walletAndTransactionsService.getWalletOwnerName(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Wallet owner name fetched successfully',
//             name
//         });
//     } catch (error) {
//         console.error('Error fetching wallet owner name:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch wallet owner name',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Customer
// async function getTransactionsForCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForCustomer(customerId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for customer:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Skill Provider
// async function getTransactionsForSkillProvider(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForSkillProvider(skillProviderId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for skill provider:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// async function getTransactionsBetweenCustomerAndSkillProvider  (req, res) {
//     try {
//         const { customerId, skillProviderId } = req.params;
//         const transactions = await walletAndTransactionsService.getTransactionsBetweenCustomerAndSkillProvider(customerId, skillProviderId);
//         res.status(200).json({ success: true, transactions });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }

// async function getAllTransactions(req, res){
//     try {
//         const transactions = await walletAndTransactionsService.getAllTransactions();
//         res.status(200).json({ success: true, transactions });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// }


// module.exports = {
//     createWallet,
//     creditWallet,
//     debitWallet,
//     transferToAccount,
//     getBalance,
//     getWalletOwnerName,
//     getTransactionsForCustomer,
//     getTransactionsForSkillProvider,
//     getTransactionsBetweenCustomerAndSkillProvider,
//     getAllTransactions,
// };


// const walletAndTransactionsService = require('../services/walletAndTransactionsService');

// // Create Wallet
// async function createWallet(req, res) {
//     try {
//         const walletData = req.body;
//         const wallet = await walletAndTransactionsService.createAccount(walletData);

//         res.status(201).json({
//             success: true,
//             message: 'Wallet created successfully',
//             wallet
//         });
//     } catch (error) {
//         console.error('Error creating wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create wallet',
//             error: error.message
//         });
//     }
// }

// // Credit Wallet
// async function creditWallet(req, res) {
//     try {
//         const walletId = req.params.walletId;
//         const { amount, description } = req.body;

//         // Ensure amount and description are provided
//         if (amount === undefined || description === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount and description are required'
//             });
//         }

//         // Call the service to credit the wallet
//         const result = await walletAndTransactionsService.creditAccount(walletId, amount, description);

//         // Return response with transaction details
//         res.status(200).json({
//             success: true,
//             message: result.message,
//             transaction: {
//                 amount: result.transaction.amount,
//                 description: result.transaction.description,
//                 transaction_date: result.transaction.transaction_date
//             }
//         });
//     } catch (error) {
//         console.error('Error crediting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to credit wallet',
//             error: error.message
//         });
//     }
// }

// // Debit Wallet
// async function debitWallet(req, res) {
//     try {
//         const { walletId, amount, description } = req.body;

//         // Ensure amount and description are provided
//         if (amount === undefined || description === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount and description are required'
//             });
//         }

//         const result = await walletAndTransactionsService.debitAccount(walletId, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Account debited successfully',
//             result
//         });
//     } catch (error) {
//         console.error('Error debiting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to debit wallet',
//             error: error.message
//         });
//     }
// }

// // Transfer to Account
// async function transferToAccount(req, res) {
//     try {
//         const { senderAccountNumber, recipientAccountNumber, amount, description } = req.body;

//         // Ensure amount and description are provided
//         if (amount === undefined || description === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount and description are required'
//             });
//         }

//         // Call the service to transfer funds
//         const result = await walletAndTransactionsService.transferToAccount(senderAccountNumber, recipientAccountNumber, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Transfer successful',
//             result
//         });
//     } catch (error) {
//         console.error('Error transferring funds:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to transfer funds',
//             error: error.message
//         });
//     }
// }

// // Get Balance
// async function getBalance(req, res) {
//     try {
//         const walletId = req.params.id;
//         const balance = await walletAndTransactionsService.getBalance(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Balance fetched successfully',
//             balance
//         });
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch balance',
//             error: error.message
//         });
//     }
// }

// // Get Wallet Owner Name
// async function getWalletOwnerName(req, res) {
//     try {
//         const walletId = req.params.id;
//         const name = await walletAndTransactionsService.getWalletOwnerName(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Wallet owner name fetched successfully',
//             name
//         });
//     } catch (error) {
//         console.error('Error fetching wallet owner name:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch wallet owner name',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Customer
// async function getTransactionsForCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForCustomer(customerId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for customer:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Skill Provider
// async function getTransactionsForSkillProvider(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForSkillProvider(skillProviderId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for skill provider:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// module.exports = {
//     createWallet,
//     creditWallet,
//     debitWallet,
//     transferToAccount,
//     getBalance,
//     getWalletOwnerName,
//     getTransactionsForCustomer,
//     getTransactionsForSkillProvider
// };


// const walletAndTransactionsService = require('../services/walletAndTransactionsService');

// // Create Wallet
// async function createWallet(req, res) {
//     try {
//         const walletData = req.body;
//         const wallet = await walletAndTransactionsService.createAccount(walletData);

//         res.status(201).json({
//             success: true,
//             message: 'Wallet created successfully',
//             wallet
//         });
//     } catch (error) {
//         console.error('Error creating wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to create wallet',
//             error: error.message
//         });
//     }
// }

// // Credit Wallet
// // async function creditWallet(req, res) {
// //     try {
// //         const { walletId, amount, description } = req.body;
// //         const result = await walletAndTransactionsService.creditAccount(walletId, amount, description);

// //         res.status(200).json({
// //             success: true,
// //             message: 'Account credited successfully',
// //             result
// //         });
// //     } catch (error) {
// //         console.error('Error crediting wallet:', error);
// //         res.status(500).json({
// //             success: false,
// //             message: 'Failed to credit wallet',
// //             error: error.message
// //         });
// //     }
// // }



// async function creditWallet(req, res){
//     try {
//         const walletId = req.params.walletId;
//         const { amount, description } = req.body;

//           // Ensure amount and description are provided
//           if (amount === undefined || description === undefined) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Amount and description are required'
//             });
//         }

//         // Call the service to credit the wallet
//         const result = await walletAndTransactionsService.creditAccount(walletId, amount, description);

//         // Return response with transaction details
//         res.status(200).json({
//             success: true,
//             message: result.message,
//             transaction: {
//                 amount: result.transaction.amount,
//                 description: result.transaction.description,
//                 transaction_date: result.transaction.transaction_date
//             }
//         });
//     } catch (error) {
//         console.error('Error crediting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to credit wallet',
//             error: error.message
//         });
//     }
// };

// // Debit Wallet
// async function debitWallet(req, res) {
//     try {
//         const { walletId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.debitAccount(walletId, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Account debited successfully',
//             result
//         });
//     } catch (error) {
//         console.error('Error debiting wallet:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to debit wallet',
//             error: error.message
//         });
//     }
// }

// // Transfer to Account
// async function transferToAccount(req, res) {
//     try {
//         const { senderWalletId, recipientSkillProviderId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.transferToAccount(senderWalletId, recipientSkillProviderId, amount, description);

//         res.status(200).json({
//             success: true,
//             message: 'Transfer successful',
//             result
//         });
//     } catch (error) {
//         console.error('Error transferring funds:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to transfer funds',
//             error: error.message
//         });
//     }
// }

// // Get Balance
// async function getBalance(req, res) {
//     try {
//         const walletId = req.params.id;
//         const balance = await walletAndTransactionsService.getBalance(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Balance fetched successfully',
//             balance
//         });
//     } catch (error) {
//         console.error('Error fetching balance:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch balance',
//             error: error.message
//         });
//     }
// }

// // Get Wallet Owner Name
// async function getWalletOwnerName(req, res) {
//     try {
//         const walletId = req.params.id;
//         const name = await walletAndTransactionsService.getWalletOwnerName(walletId);

//         res.status(200).json({
//             success: true,
//             message: 'Wallet owner name fetched successfully',
//             name
//         });
//     } catch (error) {
//         console.error('Error fetching wallet owner name:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch wallet owner name',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Customer
// async function getTransactionsForCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForCustomer(customerId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for customer:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// // Get Transactions for Skill Provider
// async function getTransactionsForSkillProvider(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         const transactions = await walletAndTransactionsService.getTransactionsForSkillProvider(skillProviderId);

//         res.status(200).json({
//             success: true,
//             message: 'Transactions fetched successfully',
//             transactions
//         });
//     } catch (error) {
//         console.error('Error fetching transactions for skill provider:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch transactions',
//             error: error.message
//         });
//     }
// }

// module.exports = {
//     createWallet,
//     creditWallet,
//     debitWallet,
//     transferToAccount,
//     getBalance,
//     getWalletOwnerName,
//     getTransactionsForCustomer,
//     getTransactionsForSkillProvider
// };


// const walletAndTransactionsService = require('../services/walletAndTransactionsService');

// // Controller function to get balance
// async function getBalance(req, res) {
//     try {
//         const walletId = req.params.walletId;
//         const balance = await walletAndTransactionsService.getBalance(walletId);
//         res.status(200).json({ success: true, balance });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to get wallet owner's name
// async function getWalletOwnerName(req, res) {
//     try {
//         const walletId = req.params.walletId;
//         const ownerName = await walletAndTransactionsService.getWalletOwnerName(walletId);
//         res.status(200).json({ success: true, ownerName });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to create a wallet
// async function createAccount(req, res) {
//     try {
//         const walletData = req.body;
//         const result = await walletAndTransactionsService.createAccount(walletData);
//         res.status(201).json({ success: true, wallet: result });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to credit an account
// async function creditAccount(req, res) {
//     try {
//         const { walletId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.creditAccount(walletId, amount, description);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to debit an account
// async function debitAccount(req, res) {
//     try {
//         const { walletId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.debitAccount(walletId, amount, description);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to transfer amount between accounts
// async function transferToAccount(req, res) {
//     try {
//         const { senderWalletId, recipientSkillProviderId, amount, description } = req.body;
//         const result = await walletAndTransactionsService.transferToAccount(senderWalletId, recipientSkillProviderId, amount, description);
//         res.status(200).json(result);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to get transactions for a customer
// async function getTransactionsForCustomer(req, res) {
//     try {
//         const customerId = req.params.customerId;
//         const transactions = await walletAndTransactionsService.getTransactionsForCustomer(customerId);
//         res.status(200).json({ success: true, transactions });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// // Controller function to get transactions for a skill provider
// async function getTransactionsForSkillProvider(req, res) {
//     try {
//         const skillProviderId = req.params.skillProviderId;
//         const transactions = await walletAndTransactionsService.getTransactionsForSkillProvider(skillProviderId);
//         res.status(200).json({ success: true, transactions });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     getBalance,
//     getWalletOwnerName,
//     createAccount,
//     creditAccount,
//     debitAccount,
//     transferToAccount,
//     getTransactionsForCustomer,
//     getTransactionsForSkillProvider
// };
