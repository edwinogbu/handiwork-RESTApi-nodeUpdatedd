const serviceCategoriesService = require('./ServiceCategoriesService');

const serviceCategoriesController = {};

serviceCategoriesController.createServiceCategory = async (req, res, next) => {
    try {
        const { serviceType, subCategory } = req.body;
        const categoryId = await serviceCategoriesService.createServiceCategory(serviceType, subCategory);
        res.status(201).json({ id: categoryId, serviceType, subCategory });
    } catch (error) {
        next(error);
    }
};

serviceCategoriesController.getServiceCategoryId = async (req, res, next) => {
    try {
        const { serviceType, subCategory } = req.params;
        const categoryId = await serviceCategoriesService.getServiceCategoryId(serviceType, subCategory);
        res.status(200).json({ id: categoryId, serviceType, subCategory });
    } catch (error) {
        next(error);
    }
};

serviceCategoriesController.getAllServiceCategories = async (req, res, next) => {
    try {
        const categories = await serviceCategoriesService.getAllServiceCategories();
        res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

serviceCategoriesController.updateServiceCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const { serviceType, subCategory } = req.body;
        await serviceCategoriesService.updateServiceCategory(categoryId, serviceType, subCategory);
        res.status(200).json({ id: categoryId, serviceType, subCategory });
    } catch (error) {
        next(error);
    }
};

serviceCategoriesController.deleteServiceCategory = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        await serviceCategoriesService.deleteServiceCategory(categoryId);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

module.exports = serviceCategoriesController;


// const { serviceCategoriesService } = require('./ServiceCategoriesService');

// const serviceCategoriesController = {};

// serviceCategoriesController.createServiceCategory = async (req, res) => {
//     try {
//         const { serviceType, subCategory } = req.body;
//         const categoryId = await serviceCategoriesService.createServiceCategory(serviceType, subCategory);
//         res.status(201).json({ id: categoryId, serviceType, subCategory });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// serviceCategoriesController.getServiceCategoryById = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         const category = await serviceCategoriesService.getServiceCategoryById(categoryId);
//         if (!category) {
//             res.status(404).json({ error: 'Service category not found' });
//         } else {
//             res.status(200).json(category);
//         }
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// serviceCategoriesController.getAllServiceCategories = async (req, res) => {
//     try {
//         const serviceCategories = await serviceCategoriesService.getAllServiceCategories();
//         res.status(200).json(serviceCategories);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// serviceCategoriesController.updateServiceCategory = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         const { serviceType, subCategory } = req.body;
//         const updatedCategory = await serviceCategoriesService.updateServiceCategory(categoryId, serviceType, subCategory);
//         res.status(200).json(updatedCategory);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// serviceCategoriesController.deleteServiceCategory = async (req, res) => {
//     try {
//         const categoryId = req.params.id;
//         await serviceCategoriesService.deleteServiceCategory(categoryId);
//         res.status(200).json({ message: 'Service category deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// module.exports = serviceCategoriesController;
