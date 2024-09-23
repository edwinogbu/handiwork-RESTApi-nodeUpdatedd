const express = require('express');
const router = express.Router();
const skillTypeController = require('./../controllers/skillTypeController');

// Route to create a new service with categories
router.post('/service/create', skillTypeController.createServiceWithCategories);

// Route to delete a service with its categories by ID
router.delete('/service/delete:id', skillTypeController.deleteServiceWithCategories);

// Route to update a service by ID
router.put('/service/update/:id', skillTypeController.updateService);

// Route to update categories for a service by ID
router.put('/service/updateCategories/:id', skillTypeController.updateCategoriesForService);

// Route to get a service with its categories by ID
router.get('/service/servicewithcategories/:id', skillTypeController.getServiceWithCategoriesById);

// Route to get all services with their categories
router.get('/services/allServiceWithcategories', skillTypeController.getAllServicesWithCategories);

// Route to get categories for a service by ID
router.get('/service/getCategories/:id', skillTypeController.getCategoriesForService);

module.exports = router;
