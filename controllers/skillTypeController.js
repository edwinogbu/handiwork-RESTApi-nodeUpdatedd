const skillTypeService = require('./../services/skillTypeService');

const skillTypeController = {};


// Controller method to create a new service with subcategories
async function createServiceWithCategories(req, res) {
    const { serviceType, subCategory } = req.body;
    try {
        if (!serviceType || !Array.isArray(subCategory) || subCategory.length === 0) {
            return res.status(400).json({ error: "ServiceType and subCategory are required" });
        }
        const newService = await skillTypeService.createServiceWithCategories(serviceType, subCategory);
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


// Controller method to delete a service with its categories by ID
async function deleteServiceWithCategories(req, res) {
    const { id } = req.params;
    try {
        const deletedService = await skillTypeService.deleteServiceWithCategories(parseInt(id));
        res.json(deletedService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller method to update a service by ID
async function updateService(req, res) {
    const { id } = req.params;
    const { serviceType } = req.body;
    try {
        const updatedService = await skillTypeService.updateService(parseInt(id), serviceType);
        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller method to update categories for a service
async function updateCategoriesForService(req, res) {
    const { id } = req.params;
    const { categories } = req.body;
    try {
        const updatedCategories = await skillTypeService.updateCategoriesForService(parseInt(id), categories);
        res.json(updatedCategories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller method to get a service with its categories by ID
async function getServiceWithCategoriesById(req, res) {
    const { id } = req.params;
    try {
        const service = await skillTypeService.getServiceWithCategoriesById(parseInt(id));
        if (!service) {
            return res.status(404).json({ error: 'Service not found' });
        }
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller method to get all services with their categories
async function getAllServicesWithCategories(req, res) {
    try {
        const services = await skillTypeService.getAllServicesWithCategories();
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controller method to get categories for a service by ID
async function getCategoriesForService(req, res) {
    const { id } = req.params;
    try {
        const categories = await skillTypeService.getCategoriesForService(parseInt(id));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createServiceWithCategories,
    deleteServiceWithCategories,
    updateService,
    updateCategoriesForService,
    getServiceWithCategoriesById,
    getAllServicesWithCategories,
    getCategoriesForService,
};


// const skillTypeService = require('./skillTypeService');

// const skillTypeController = {};

// // Controller method to create a new service with categories
// async function createServiceWithCategories(req, res) {
//     const { serviceType, categories } = req.body;
//     try {
//         const newService = await skillTypeService.createServiceWithCategories(serviceType, categories);
//         res.status(201).json(newService);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to delete a service with its categories by ID
//     async function deleteServiceWithCategories(req, res) {
//     const { id } = req.params;
//     try {
//         const deletedService = await skillTypeService.deleteServiceWithCategories(parseInt(id));
//         res.json(deletedService);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to update a service by ID
//     async function updateService(req, res) {

//     const { id } = req.params;
//     const { serviceType } = req.body;
//     try {
//         const updatedService = await skillTypeService.updateService(parseInt(id), serviceType);
//         res.json(updatedService);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to update categories for a service
// async function updateCategoriesForService(req, res) {

//     const { id } = req.params;
//     const { categories } = req.body;
//     try {
//         const updatedCategories = await skillTypeService.updateCategoriesForService(parseInt(id), categories);
//         res.json(updatedCategories);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to get a service with its categories by ID
//     async function getServiceWithCategoriesById(req, res) {

//     const { id } = req.params;
//     try {
//         const service = await skillTypeService.getServiceWithCategoriesById(parseInt(id));
//         if (!service) {
//             return res.status(404).json({ error: 'Service not found' });
//         }
//         res.json(service);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to get all services with their categories
//     async function getAllServicesWithCategories(req, res) {

//     try {
//         const services = await skillTypeService.getAllServicesWithCategories();
//         res.json(services);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// // Controller method to get categories for a service by ID
//     async function getCategoriesForService(req, res) {

//     const { id } = req.params;
//     try {
//         const categories = await skillTypeService.getCategoriesForService(parseInt(id));
//         res.json(categories);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = {
//     createServiceWithCategories,
//     deleteServiceWithCategories,
//     updateService,
//     updateCategoriesForService,
//     getServiceWithCategoriesById,
//     getAllServicesWithCategories,
//     getCategoriesForService,
// };

// const skillTypeService = require('../services/skillTypeService');

// // Success and Error Messages
// const successMessages = {
//     createService: 'Service created successfully',
//     createSubcategory: 'Subcategory created successfully',
//     getAllServices: 'All services retrieved successfully',
//     getServiceById: 'Service retrieved successfully'
// };

// const errorMessages = {
//     notFound: 'Service not found',
//     serverError: 'Internal server error'
// };

// // Function to create a new service
// async function createService(req, res) {
//     try {
//         const { serviceType, providerId } = req.body;
//         const newService = await skillTypeService.createService({ serviceType, providerId });
        
//         res.status(201).json({ success: true, message: successMessages.createService, service: newService });
//     } catch (error) {
//         res.status(500).json({ success: false, error: errorMessages.serverError });
//     }
// }

// // Function to create a new subcategory for a service
// async function createSubcategory(req, res) {
//     try {
//         const { serviceId } = req.params;
//         const { subcategory } = req.body;
//         const newSubcategory = await skillTypeService.createSubcategory(serviceId, subcategory);
        
//         res.status(201).json({ success: true, message: successMessages.createSubcategory, subcategory: newSubcategory });
//     } catch (error) {
//         res.status(500).json({ success: false, error: errorMessages.serverError });
//     }
// }

// // Function to get all services
// async function getAllServices(req, res) {
//     try {
//         const services = await skillTypeService.getAllServices();
//         res.status(200).json({ success: true, message: successMessages.getAllServices, services });
//     } catch (error) {
//         res.status(500).json({ success: false, error: errorMessages.serverError });
//     }
// }

// // Function to get service by ID
// async function getServiceById(req, res) {
//     try {
//         const { id } = req.params;
//         const service = await skillTypeService.getServiceById(id);
//         if (!service) {
//             res.status(404).json({ success: false, error: errorMessages.notFound });
//             return;
//         }
//         res.status(200).json({ success: true, message: successMessages.getServiceById, service });
//     } catch (error) {
//         res.status(500).json({ success: false, error: errorMessages.serverError });
//     }
// }

// module.exports = {
//     createService,
//     createSubcategory,
//     getAllServices,
//     getServiceById
// };
