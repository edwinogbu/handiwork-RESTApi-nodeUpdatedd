const skillProviderTypesService = require('../services/skillProviderTypesService');

async function createSkillType(req, res) {
    try {
        const { serviceType, subCategory, providerId } = req.body;
        const newSkillType = await skillProviderTypesService.createSkillType({ serviceType, subCategory, providerId });
        res.status(201).json(newSkillType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSkillTypeById(req, res) {
    try {
        const { id } = req.params;
        const skillType = await skillProviderTypesService.getSkillTypeById(id);
        if (!skillType) {
            res.status(404).json({ error: 'Skill type not found' });
        } else {
            res.status(200).json(skillType);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getAllSkillTypes(req, res) {
    try {
        const skillTypes = await skillProviderTypesService.getAllSkillTypes();
        res.status(200).json(skillTypes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function updateSkillType(req, res) {
    try {
        const { id } = req.params;
        const { serviceType, subCategory, providerId } = req.body;
        const updatedSkillType = await skillProviderTypesService.updateSkillType(id, { serviceType, subCategory, providerId });
        res.status(200).json(updatedSkillType);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function deleteSkillType(req, res) {
    try {
        const { id } = req.params;
        await skillProviderTypesService.deleteSkillType(id);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createSkillType,
    getSkillTypeById,
    getAllSkillTypes,
    updateSkillType,
    deleteSkillType
};


// async function createSkillProviderType(req, res) {
//     try {
//         const { serviceType, subCategory, providerId } = req.body;

//         // Call the service layer function to create the skill provider type
//         const newSkillProviderType = await skillProviderTypesService.createSkillProviderType({ serviceType, subCategory, providerId });

//         // Return success response with the newly created skill provider type data
//         res.status(201).json({ success: true, skillProviderType: newSkillProviderType });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getSkillProviderTypeById(req, res) {
//     try {
//         const skillProviderTypeId = req.params.id;
//         const skillProviderType = await skillProviderTypesService.getSkillProviderTypeById(skillProviderTypeId);
//         if (!skillProviderType) {
//             res.status(404).json({ success: false, error: 'Skill provider type not found' });
//             return;
//         }
//         res.status(200).json({ success: true, skillProviderType });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllSkillProviderTypes(req, res) {
//     try {
//         const skillProviderTypes = await skillProviderTypesService.getAllSkillProviderTypes();
//         res.status(200).json({ success: true, skillProviderTypes });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateSkillProviderType(req, res) {
//     try {
//         const skillProviderTypeId = req.params.id;
//         const { serviceType, subCategory, providerId } = req.body;

//         // Update skill provider type information
//         const updatedSkillProviderType = await skillProviderTypesService.updateSkillProviderType(skillProviderTypeId, { serviceType, subCategory, providerId });

//         res.status(200).json({ success: true, skillProviderType: updatedSkillProviderType });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteSkillProviderType(req, res) {
//     try {
//         const skillProviderTypeId = req.params.id;
//         await skillProviderTypesService.deleteSkillProviderType(skillProviderTypeId);
//         res.status(200).json({ success: true, message: 'Skill provider type deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }


// // async function getSkillProvidersByServiceType(req, res) {
// //     try {
// //         const serviceType = req.params.serviceType;
// //         const skillProviders = await skillProviderTypesService.getSkillProvidersByServiceType(serviceType);
// //         res.status(200).json(skillProviders);
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }


// async function getSkillProvidersByServiceType(req, res) {
//     try {
//         const serviceType = req.params.serviceType;
//         const skillProviders = await skillProviderTypesService.getSkillProvidersByServiceType(serviceType);
        
//         // Check if skill providers data is empty
//         if (skillProviders.length === 0) {
//             return res.status(404).json({ success: false, error: 'No skill providers found for the specified service type' });
//         }

//         // Send success response with skill providers data
//         res.status(200).json({ success: true, data: skillProviders });
//     } catch (error) {
//         // Handle internal server error
//         console.error('Error fetching skill providers by service type:', error);
//         res.status(500).json({ success: false, error: 'Internal server error' });
//     }
// }


// module.exports = {
//     createSkillProviderType,
//     getSkillProviderTypeById,
//     getAllSkillProviderTypes,
//     updateSkillProviderType,
//     deleteSkillProviderType,
//     getSkillProvidersByServiceType
// };


// const skillProviderTypesService = require('../services/skillProviderTypesService');

// async function createSkillProviderType(req, res) {
//     try {
//         const { serviceType, subCategory, providerId } = req.body;
        
//         // Call the service layer function to create the skill provider type
//         const newType = await skillProviderTypesService.createSkillProviderType({ serviceType, subCategory, providerId });
        
//         // Return success response with the newly created skill provider type data
//         res.status(201).json({ success: true, type: newType });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllSkillProviderTypes(req, res) {
//     try {
//         const types = await skillProviderTypesService.getAllSkillProviderTypes();
//         res.status(200).json({ success: true, types });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getSkillProviderTypeById(req, res) {
//     try {
//         const typeId = req.params.id;
//         const type = await skillProviderTypesService.getSkillProviderTypeById(typeId);
//         if (!type) {
//             res.status(404).json({ success: false, error: 'Skill Provider Type not found' });
//             return;
//         }
//         res.status(200).json({ success: true, type });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateSkillProviderType(req, res) {
//     try {
//         const typeId = req.params.id;
//         const { serviceType, subCategory, providerId } = req.body;
        
//         // Update skill provider type information
//         const updatedType = await skillProviderTypesService.updateSkillProviderType(typeId, { serviceType, subCategory, providerId });
        
//         res.status(200).json({ success: true, type: updatedType });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteSkillProviderType(req, res) {
//     try {
//         const typeId = req.params.id;
//         await skillProviderTypesService.deleteSkillProviderType(typeId);
//         res.status(200).json({ success: true, message: 'Skill Provider Type deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createSkillProviderType,
//     getAllSkillProviderTypes,
//     getSkillProviderTypeById,
//     updateSkillProviderType,
//     deleteSkillProviderType
// };
