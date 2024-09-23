// const customerService = require('./customerService');

// const customerController = {
//     createCustomer: async (req, res) => {
//         try {
//             const { fullName, email, password, phone, address } = req.body;
//             const customerId = await customerService.createCustomer({ fullName, email, password, phone, address });
//             res.status(201).json({ customerId });
//         } catch (error) {
//             console.error('Error creating customer:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     },

//     getCustomerById: async (req, res) => {
//         try {
//             const customerId = parseInt(req.params.id);
//             const customer = await customerService.getCustomerById(customerId);
//             if (customer) {
//                 res.json(customer);
//             } else {
//                 res.status(404).json({ error: 'Customer not found' });
//             }
//         } catch (error) {
//             console.error('Error getting customer by ID:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     },

//     updateCustomer: async (req, res) => {
//         try {
//             const customerId = parseInt(req.params.id);
//             const { fullName, email, phone, address } = req.body;
//             const success = await customerService.updateCustomer(customerId, { fullName, email, phone, address });
//             if (success) {
//                 res.json({ success: true });
//             } else {
//                 res.status(404).json({ error: 'Customer not found' });
//             }
//         } catch (error) {
//             console.error('Error updating customer:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     },

//     deleteCustomer: async (req, res) => {
//         try {
//             const customerId = parseInt(req.params.id);
//             const success = await customerService.deleteCustomer(customerId);
//             if (success) {
//                 res.json({ success: true });
//             } else {
//                 res.status(404).json({ error: 'Customer not found' });
//             }
//         } catch (error) {
//             console.error('Error deleting customer:', error);
//             res.status(500).json({ error: 'Internal Server Error' });
//         }
//     }
// };

// module.exports = customerController;



const customerService = require('../services/customerService');
const walletAndTransactionsService = require('../services/walletAndTransactionsService');

const fs = require('fs');

// async function createCustomer(req, res) {
//     try {
//         const { firstName, lastName, email, password, phone, address  } = req.body;
//         // const imagePath = req.file ? req.file.path : null; // Check if an image file is uploaded
        
//         // Call the service layer function to create the customer with or without an image path
//         const newCustomer = await customerService.createCustomer({firstName, lastName, email, password, phone, address  });
        
//         // Return success response with the newly created customer data
//         res.status(201).json({ success: true, customer: newCustomer });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }



async function createCustomer(req, res) {
    try {
        const { firstName, lastName, email, password, phone, address } = req.body;

        // Create the customer
        const newCustomer = await customerService.createCustomer({ firstName, lastName, email, password, phone, address });

        // Create a wallet for the new customer
        const wallet = await walletAndTransactionsService.createAccount({
            wallet_type: 'customer',
            customerId: newCustomer.id,
            skillProviderId: null
        });

        // Return success response with the newly created customer and wallet data
        res.status(201).json({ success: true, customer: newCustomer, wallet });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function getCustomerById(req, res) {
    try {
        const customerId = req.params.id;
        const customer = await customerService.getCustomerById(customerId);
        if (!customer) {
            res.status(404).json({ success: false, error: 'Customer not found' });
            return;
        }
        res.status(200).json({ success: true, customer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getAllCustomers(req, res) {
    try {
        const customers = await customerService.getAllCustomers();
        res.status(200).json({ success: true, customers });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateCustomerWithImage(req, res) {
    try {
        const customerId = req.params.id;
        const { fullName, email, password, phone, address  } = req.body;
        
        // Check if a file is uploaded
        // if (!req.file) {
        //     return res.status(400).json({ success: false, error: 'No image uploaded' });
        // }

        // const imagePath = req.file.path; // Assuming you're storing the image path in req.file.path
        
        // Update customer information including the image path
        const updatedCustomer = await customerService.updateCustomerWithImage(customerId, { fullName, email, password, phone, address  });

        res.status(200).json({ success: true, customer: updatedCustomer });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}



async function patchedUpdateCustomer(req, res) {
    try {
        const customerId = req.params.customerId;
        const updateCustomerFields = req.body;

        const updatedCustomer = await customerService.patchedUpdateCustomer(customerId, updateCustomerFields);

        res.status(200).json({
            status: 'success',
            data: {
                customer: updatedCustomer,
            },
        });
    } catch (error) {
        console.error('Error updating customer:', error);
        res.status(500).json({
            status: 'error',
            message: error.message,
        });
    }
}



async function deleteCustomer(req, res) {
    try {
        const customerId = req.params.id;
        await customerService.deleteCustomer(customerId);
        res.status(200).json({ success: true, message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


async function updateCustomer(req, res) {
    try {
        const customerId = req.params.id;
        const { firstName, lastName, email, phone, address } = req.body;

        // Check if the customer exists
        const customerExists = await customerService.customerExists(customerId);
        if (!customerExists) {
            return res.status(404).json({ success: false, error: 'Customer not found' });
        }

        // Update customer information
        const updatedCustomer = await customerService.updateCustomer(customerId, { firstName, lastName, email, phone, address });

        // Return the updated customer data
        res.status(200).json({ success: true, customer: updatedCustomer });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function updateCustomerOnlyImage(req, res) {
    try {
        const customerId = req.params.id;
        const imagePath = req.file ? req.file.path : null;

        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        // Call the service layer function to update only the image of the skill provider
        const updatedCustomer = await customerService.updateCustomerOnlyImage(customerId, imagePath);

        res.status(200).json({ success: true, customer: updatedCustomer });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


// async function patchedUpdateCustomer(req, res) {
//     try {
//         const customerId = req.params.customerId;
//         const updateCustomerFields = req.body;

//         // Update customer data
//         const updatedCustomer = await customerService.patchedUpdateCustomer(customerId, updateCustomerFields);

//         res.status(200).json({
//             status: 'success',
//             data: {
//                 customer: updatedCustomer,
//             },
//         });
//     } catch (error) {
//         console.error('Error updating customer:', error);
//         res.status(500).json({
//             status: 'error',
//             message: error.message,
//         });
//     }
// }



module.exports = {
    createCustomer,
    getCustomerById,
    getAllCustomers,
    updateCustomerWithImage,
    deleteCustomer,
    updateCustomer,
    updateCustomerOnlyImage,
    patchedUpdateCustomer
};



// const customerService = require('../services/customerService');
// const fs = require('fs');


// async function createCustomer(req, res) {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street } = req.body;
//         const imagePath = req.file ? req.file.path : null; // Check if an image file is uploaded
        
//         // Call the service layer function to create the customer with or without an image path
//         const newCustomer = await customerService.createCustomer({ firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, imagePath });
        
//         // Return success response with the newly created customer data
//         res.status(201).json({ success: true, customer: newCustomer });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }


// async function getCustomerById(req, res) {
//     try {
//         const customerId = req.params.id;
//         const customer = await customerService.getCustomerById(customerId);
//         if (!customer) {
//             res.status(404).json({ success: false, error: 'Customer not found' });
//             return;
//         }
//         res.status(200).json({ success: true, customer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllCustomers(req, res) {
//     try {
//         const customers = await customerService.getAllCustomers();
//         res.status(200).json({ success: true, customers });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }




// async function updateCustomerWithImage(req, res) {
//     try {
//         const customerId = req.params.id;
//         const { firstName, lastName, email, password, phone, address, stateOfResidence, city, street } = req.body;
        
//         // Check if a file is uploaded
//         if (!req.file) {
//             return res.status(400).json({ success: false, error: 'No image uploaded' });
//         }

//         const imagePath = req.file.path; // Assuming you're storing the image path in req.file.path
        
//         // Update customer information including the image path
//         const updatedCustomer = await customerService.updateCustomerWithImage(customerId, { firstName, lastName, email, password, phone, secondPhone, address,  stateOfResidence, city, street, imagePath });

//         res.status(200).json({ success: true, customer: updatedCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }




// async function deleteCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         await customerService.deleteCustomer(customerId);
//         res.status(200).json({ success: true, message: 'Customer deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createCustomer,
//     getCustomerById,
//     getAllCustomers,
//     updateCustomerWithImage,
//     deleteCustomer
// };




// const customerService = require('../services/customerService');

// async function createCustomer(req, res) {
//     try {
//         const { firstName, lastName, email, password, phone, address } = req.body;
//         const newCustomer = await customerService.createCustomer({ firstName, lastName, email, password, phone, address });
//         res.status(201).json({ success: true, customer: newCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCustomerById(req, res) {
//     try {
//         const customerId = req.params.id;
//         const customer = await customerService.getCustomerById(customerId);
//         if (!customer) {
//             res.status(404).json({ success: false, error: 'Customer not found' });
//             return;
//         }
//         res.status(200).json({ success: true, customer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllCustomers(req, res) {
//     try {
//         const customers = await customerService.getAllCustomers();
//         res.status(200).json({ success: true, customers });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         const updates = req.body;
//         const updatedCustomer = await customerService.updateCustomer(customerId, updates);
//         res.status(200).json({ success: true, customer: updatedCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         await customerService.deleteCustomer(customerId);
//         res.status(200).json({ success: true, message: 'Customer deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createCustomer,
//     getCustomerById,
//     getAllCustomers,
//     updateCustomer,
//     deleteCustomer
// };




// const CustomerService = require('../services/customerService');

// // Controller function to handle creating a new customer
// exports.createCustomer = async (req, res, next) => {
//     try {
//         const { firstName, lastName, email, phone, address, userId } = req.body;
//         const customerData = { firstName, lastName, email, phone, address, userId };
//         const customer = await CustomerService.createCustomer(customerData);
//         res.status(201).json({ success: true, data: customer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle getting a customer by ID
// exports.getCustomerById = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const customer = await CustomerService.getCustomerById(id);
//         if (!customer) {
//             res.status(404).json({ success: false, message: 'Customer not found' });
//             return;
//         }
//         res.status(200).json({ success: true, data: customer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle updating a customer
// exports.updateCustomer = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
//         const updatedCustomer = await CustomerService.updateCustomer(id, updates);
//         res.status(200).json({ success: true, data: updatedCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle deleting a customer
// exports.deleteCustomer = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         await CustomerService.deleteCustomer(id);
//         res.status(200).json({ success: true, message: 'Customer deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };



// const customerService = require('../services/customerService');

// async function createCustomer(req, res) {
//     try {
//         const { firstName, lastName, email, password, phone, address } = req.body;
//         const imagePath = req.file.path; // Assuming you're storing the image path in req.file.path
//         const newCustomer = await customerService.createCustomer({ firstName, lastName, email, password, phone, address, imagePath });
//         res.status(201).json({ success: true, customer: newCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCustomerById(req, res) {
//     try {
//         const customerId = req.params.id;
//         const customer = await customerService.getCustomerById(customerId);
//         if (!customer) {
//             res.status(404).json({ success: false, error: 'Customer not found' });
//             return;
//         }
//         res.status(200).json({ success: true, customer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllCustomers(req, res) {
//     try {
//         const customers = await customerService.getAllCustomers();
//         res.status(200).json({ success: true, customers });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         const updates = req.body;
//         const updatedCustomer = await customerService.updateCustomer(customerId, updates);
//         res.status(200).json({ success: true, customer: updatedCustomer });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteCustomer(req, res) {
//     try {
//         const customerId = req.params.id;
//         await customerService.deleteCustomer(customerId);
//         res.status(200).json({ success: true, message: 'Customer deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createCustomer,
//     getCustomerById,
//     getAllCustomers,
//     updateCustomer,
//     deleteCustomer
// };

