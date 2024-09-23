const express = require('express');
const userToken = require('./../middleware/userToken');
const customerController = require('../controllers/customerController');
const uploadMiddleware = require('../middleware/uploadMiddleware');


const router = express.Router();

router.post('/create', uploadMiddleware, customerController.createCustomer);

// router.post('/create', customerController.createCustomer);
router.get('/view/:id',  customerController.getCustomerById);
router.get('/customers', customerController.getAllCustomers);
router.put('/update/:id',  uploadMiddleware, customerController.updateCustomer);
router.put('/updateCustomerWithImage/:id',  uploadMiddleware, customerController.updateCustomerWithImage);

router.patch('/updateCustomerRecord/:customerId', customerController.patchedUpdateCustomer);
// router.put('/update/:id', customerController.updateCustomer);
router.delete('/delete/:id', userToken, customerController.deleteCustomer);

// Route to update only the image of a skill provider
router.put('/customer-image/:id', uploadMiddleware, customerController.updateCustomerOnlyImage);


module.exports = router;




// const express = require('express');
// const customerController = require('./../services/customerService');

// const router = express.Router();

// // Route to create a new customer
// router.post('/create', customerController.createCustomer);

// // Route to get a customer by ID
// router.get('/view/:id', customerController.getCustomerById);

// // Route to update a customer
// router.put('/update/:id', customerController.updateCustomer);

// // Route to delete a customer
// router.delete('/delete/:id', customerController.deleteCustomer);

// module.exports = router;