// const skillProviderService = require('../services/skillProviderService');

// async function createSkillProvider(req, res) {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

//         // Check if an image file is uploaded
//         const imagePath = req.file ? req.file.path : null;

//         // Call the service layer function to create the skill provider with or without an image path
//         const newSkillProvider = await skillProviderService.createSkillProvider({ firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });
        
//         // Return success response with the newly created skill provider data, including the imagePath
//         res.status(201).json({ success: true, skillProvider: newSkillProvider });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllSkillProviders(req, res) {
//     try {
//         const skillProviders = await skillProviderService.getAllSkillProviders();
//         res.status(200).json({ success: true, skillProviders });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getSkillProviderById(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         const skillProvider = await skillProviderService.getSkillProviderById(skillProviderId);
//         if (!skillProvider) {
//             res.status(404).json({ success: false, error: 'Skill provider not found' });
//             return;
//         }
//         res.status(200).json({ success: true, skillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateSkillProviderProfileWithImage(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

//         // Check if an image file is uploaded
//         const imagePath = req.file ? req.file.path : null;
        
//         // Check if a file is uploaded
//         if (!req.file) {
//             return res.status(400).json({ success: false, error: 'No image uploaded' });
//         }

//         // Call the service layer function to update the skill provider profile with image
//         const updatedSkillProvider = await skillProviderService.updateSkillProviderProfileWithImage(skillProviderId, {  firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });

//         res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteSkillProvider(req, res) {
//     try {
//         const skillProviderId = req.params.id;
//         await skillProviderService.deleteSkillProvider(skillProviderId);
//         res.status(200).json({ success: true, message: 'Skill provider deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function createSkillType(req, res) {
//     try {
//         const { serviceType, subCategory } = req.body;
//         const skillTypeId = await skillProviderService.createSkillType(serviceType, subCategory);
//         res.status(201).json({ success: true, skillTypeId });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getSkillTypeById(req, res) {
//     try {
//         const typeId = req.params.id;
//         const skillType = await skillProviderService.getSkillTypeById(typeId);
//         res.status(200).json({ success: true, skillType });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getAllSkillTypes(req, res) {
//     try {
//         const skillTypes = await skillProviderService.getAllSkillTypes();
//         res.status(200).json({ success: true, skillTypes });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function updateSkillType(req, res) {
//     try {
//         const { id, serviceType, subCategory } = req.body;
//         await skillProviderService.updateSkillType(id, serviceType, subCategory);
//         res.status(200).json({ success: true, message: 'Skill type updated successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteSkillType(req, res) {
//     try {
//         const typeId = req.params.id;
//         await skillProviderService.deleteSkillType(typeId);
//         res.status(200).json({ success: true, message: 'Skill type deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createSkillProvider,
//     getAllSkillProviders,
//     getSkillProviderById,
//     updateSkillProviderProfileWithImage,
//     deleteSkillProvider,
//     createSkillType,
//     getSkillTypeById,
//     getAllSkillTypes,
//     updateSkillType,
//     deleteSkillType
// };


const skillProviderService = require('../services/skillProviderService');
const walletAndTransactionsService = require('../services/walletAndTransactionsService');



async function createSkillProvider(req, res) {
    try {
        const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

        // Check if an image file is uploaded
        const imagePath = req.file ? req.file.path : null;

        // If no image file is uploaded, return an error response
        // if (!imagePath) {
        //     return res.status(400).json({ success: false, error: 'No image uploaded' });
        // }

        // Call the service layer function to create the skill provider with or without an image path
        const newSkillProvider = await skillProviderService.createSkillProvider({ firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });
        // Create a wallet for the new customer
        const wallet = await walletAndTransactionsService.createAccount({
            wallet_type: 'skill_provider',
            customerId: null,
            skillProviderId: newSkillProvider.id
        });

        // Return success response with the newly created skill provider data, including the imagePath
        res.status(201).json({ success: true, skillProvider: newSkillProvider, wallet });
    } catch (error) {
        // Return error response if any error occurs during the process
        res.status(500).json({ success: false, error: error.message });
    }
}


async function getAllSkillProviders(req, res) {
    try {
        const skillProviders = await skillProviderService.getAllSkillProviders();
        res.status(200).json({ success: true, skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getSkillProviderById(req, res) {
    try {
        const skillProviderId = req.params.id;
        const skillProvider = await skillProviderService.getSkillProviderById(skillProviderId);
        if (!skillProvider) {
            res.status(404).json({ success: false, error: 'Skill provider not found' });
            return;
        }
        res.status(200).json({ success: true, skillProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// async function update(req, res){
//     try {
//         const { id } = req.params; // Extract skill provider ID from request parameters
//         const newData = req.body; // Extract updated data from request body

//         // Call the updateSkillProvider service function to update the skill provider
//         const updatedSkillProvider = await skillProviderService.update(id, newData);

//         // Send a success response with the updated skill provider data
//         res.status(200).json({
//             success: true,
//             message: 'Skill provider updated successfully',
//             skillProvider: updatedSkillProvider
//         });
//     } catch (error) {
//         // Handle errors
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update skill provider',
//             error: error.message
//         });
//     }
// };


async function update (req, res) {
    try {
        const { id } = req.params; // Extract skill provider ID from request parameters
        const newData = req.body; // Extract updated data from request body

        // Retrieve existing skill provider data from the database
        const existingSkillProvider = await skillProviderService.getSkillProviderById(id);

        if (!existingSkillProvider) {
            return res.status(404).json({
                success: false,
                message: 'Skill provider not found'
            });
        }

        // Merge existing data with new data, updating only the provided parameters
        const updatedSkillProviderData = { ...existingSkillProvider, ...newData };

        // Call the updateSkillProvider service function to update the skill provider
        const updatedSkillProvider = await skillProviderService.update(id, updatedSkillProviderData);

        // Extract only the desired fields for the response
        const responseSkillProviderData = {
            firstName: updatedSkillProvider.firstName,
            lastName: updatedSkillProvider.lastName,
            email: updatedSkillProvider.email,
            phone: updatedSkillProvider.phone,
            secondPhone: updatedSkillProvider.secondPhone,
            stateOfResidence: updatedSkillProvider.stateOfResidence,
            city: updatedSkillProvider.city,
            street: updatedSkillProvider.street,
            address: updatedSkillProvider.address,
            serviceType: updatedSkillProvider.serviceType,
            subCategory: updatedSkillProvider.subCategory,
            openingHour: updatedSkillProvider.openingHour,
            referralCode: updatedSkillProvider.referralCode,
            about: updatedSkillProvider.about,
            skills: updatedSkillProvider.skills
        };

        // Send a success response with the updated skill provider data
        res.status(200).json({
            success: true,
            message: 'Skill provider updated successfully',
            skillProvider: responseSkillProviderData
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: 'Failed to update skill provider',
            error: error.message
        });
    }
};


async function updateSkillProviderProfileWithImage(req, res) {
    try {
        const skillProviderId = req.params.id;
        const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

        // Check if an image file is uploaded
        const imagePath = req.file ? req.file.path : null;
        
        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        // Call the service layer function to update the skill provider profile with image
        const updatedSkillProvider = await skillProviderService.updateSkillProviderProfileWithImage(skillProviderId, {  firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });

        res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


// async function updateSkillProviderProfileWithImage(req, res) {
    
//     try {
//         const providerId = req.params.id;

//         const {  firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;
//         // Check if a file is uploaded
        
//         const imagePath = req.file.path; // Assuming you're storing the image path in req.file.path
        
//         if (!imagePath) {
//             return res.status(400).json({ success: false, error: 'No image uploaded' });
//         }
//         // Update customer information including the image path
//         const updatedSkillProvider = await skillProviderService.updateSkillProviderProfileWithImage(providerId, {  firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });

//         res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }

// };



async function patchUpdateSkillProvider(req, res) {
    try {
        const providerId = req.params.id;
        const updatedFields = req.body;

        // Check if an image file is uploaded
        const imagePath = req.file ? req.file.path : null;

        // Add imagePath to updatedFields if it exists
        if (imagePath) {
            updatedFields.imagePath = imagePath;
        }

        // Call the service layer function to update the skill provider profile with partial updates
        const updatedSkillProvider = await skillProviderService.patchUpdateSkillProvider(providerId, updatedFields);

        res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


async function patchUpdateSkillProvider(req, res) {
    try {
        const providerId = req.params.id;
        const updatedFields = req.body;

        // Check if an image file is uploaded
        const imagePath = req.file ? req.file.path : null;

        // If an image file is uploaded, include its path in the update
        if (imagePath) {
            updatedFields.imagePath = imagePath;
        }

        // Call the service layer function to perform the update dynamically
        const updatedSkillProvider = await skillProviderService.patchUpdateSkillProvider(providerId, updatedFields);

        res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// const patchUpdateSkillProviderWithNoImage = async (req, res) => {
//     const providerId = req.params.id;
//     const updatedFields = req.body;

//     try {
//         const updatedProvider = await skillProviderService.patchUpdateSkillProviderWithNoImage(providerId, updatedFields);
//         res.status(200).json(updatedProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

const patchUpdateSkillProviderWithNoImage = async (req, res) => {
    const providerId = req.params.providerId;
    const updatedFields = req.body;

    try {
        const updatedProvider = await skillProviderService.patchUpdateSkillProvider(providerId, updatedFields);
        res.status(200).json({ success: true, data: updatedProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};





// const patchUpdateSkillProviderWithNoImage = async (req, res, next) => {
//     const providerId = req.params.id;
//     const updatedFields = req.body;

//     try {
//         const updatedProvider = await skillProviderService.patchUpdateSkillProviderWithNoImage(providerId, updatedFields);
//         res.status(200).json(updatedProvider);
//     } catch (error) {
//         next(error);
//     }
// };



async function updateOnlyImage(req, res) {
    try {
        const providerId = req.params.id;
        const imagePath = req.file ? req.file.path : null;

        // Check if a file is uploaded
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image uploaded' });
        }

        // Call the service layer function to update only the image of the skill provider
        const updatedSkillProvider = await skillProviderService.updateOnlyImage(providerId, imagePath);

        res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}



// async function patchUpdateSkillProvider(req, res) {
//     try {
//         const providerId = req.params.id;
//         const updatedFields = req.body;

//         const updatedProvider = await skillProviderService.patchUpdateSkillProvider(providerId, updatedFields);

//         res.status(200).json({ success: true, skillProvider: updatedProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }



async function deleteSkillProvider(req, res) {
    try {
        const skillProviderId = req.params.id;
        await skillProviderService.deleteSkillProvider(skillProviderId);
        res.status(200).json({ success: true, message: 'Skill provider deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}




async function filterSkillProviders(req, res) {
    try {
        const filter = req.body; // Assuming filter parameters are passed in the request body
        const skillProviders = await skillProviderService.filterSkillProviders(filter);

        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, message: 'No skill providers found matching the criteria' });
        }

        res.status(200).json({ success: true, message: 'Skill providers filtered successfully', skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


async function findByLocation(req, res) {
    try {
        const locationFilter = req.body; // Assuming location filter parameters are passed in the request body
        const skillProviders = await skillProviderService.findByLocation(locationFilter);

        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, message: 'No skill providers found in the specified location' });
        }

        res.status(200).json({ success: true, message: 'Skill providers filtered by location successfully', skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


async function findByServiceOrSubCategory(req, res) {
    try {
        const filter = req.body; // Assuming service or subcategory filter parameters are passed in the request body
        const skillProviders = await skillProviderService.findByServiceOrSubCategory(filter);

        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, message: 'No skill providers found matching the specified service or subcategory' });
        }

        res.status(200).json({ success: true, message: 'Skill providers filtered by service or subcategory successfully', skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}



// async function searchSkillProviders(req, res) {
//     try {
//         const { stateOfResidence, city, street, address, serviceType, subCategory } = req.params;
//         const filter = { stateOfResidence, city, street, address, serviceType, subCategory };

//         const skillProviders = await skillProviderService.searchSkillProviders(filter);

//         if (skillProviders.length === 0) {
//             return res.status(404).json({ success: false, message: 'No skill providers found matching the criteria' });
//         }

//         res.status(200).json({ success: true, message: 'Skill providers filtered successfully', skillProviders });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message || 'An error occurred while filtering skill providers' });
//     }
// }

// async function searchByLocation(req, res) {
//     try {
//         const { stateOfResidence, city, street, address } = req.params;
//         const locationFilter = { stateOfResidence, city, street, address };
//         const skillProviders = await skillProviderService.searchByLocation(locationFilter);

//         if (skillProviders.length === 0) {
//             return res.status(404).json({ success: false, message: 'No skill providers found in the specified location' });
//         }

//         res.status(200).json({ success: true, message: 'Skill providers filtered by location successfully', skillProviders });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message || 'An error occurred while filtering skill providers by location' });
//     }
// }



// Controller to search skill providers based on filters
const searchSkillProviders = async (req, res) => {
    try {
        // Extract the query parameters
        const { stateOfResidence, city, street, address, serviceType, subCategory } = req.query;

        // Build the filter object based on provided query parameters
        const filter = {};
        if (stateOfResidence) filter.stateOfResidence = stateOfResidence;
        if (city) filter.city = city;
        if (street) filter.street = street;
        if (address) filter.address = address;
        if (serviceType) filter.serviceType = serviceType;
        if (subCategory) filter.subCategory = subCategory;

        // Call the service function with the filter object
        const skillProviders = await skillProviderService.searchSkillProviders(filter);

        // If no skill providers are found, return a 404 status
        if (skillProviders.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No skill providers found matching the given filters.'
            });
        }

        // Return the skill providers with a 200 status
        return res.status(200).json({
            success: true,
            message: 'Skill providers retrieved successfully.',
            data: skillProviders
        });
    } catch (error) {
        // Return a 500 status with an error message in case of an error
        return res.status(500).json({
            success: false,
            message: 'An error occurred while searching for skill providers.',
            error: error.message
        });
    }
};







async function searchByLocation(req, res) {
    try {
        const locationFilter = { stateOfResidence, city, street, address };

        const skillProvider = req.params.locationFilter;

        const skillProviders = await skillProviderService.searchByLocation(skillProvider);
        
        // Check if skill providers data is empty
        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, error: 'No skill providers found for the specified search' });
        }

        // Send success response with skill providers data
        res.status(200).json({ success: true, data: skillProviders });
    } catch (error) {
        // Handle internal server error
        console.error('Error fetching skill providers by service type:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
}


async function searchByServiceOrSubCategory(req, res) {
    try {
        const { serviceType, subCategory } = req.params;
        const filter = { serviceType, subCategory };
        const skillProviders = await skillProviderService.searchByServiceOrSubCategory(filter);

        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, message: 'No skill providers found matching the specified service or subcategory' });
        }

        res.status(200).json({ success: true, message: 'Skill providers filtered by service or subcategory successfully', skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'An error occurred while filtering skill providers by service or subcategory' });
    }
}

// async function getSkillProvidersByServiceType(req, res) {
//     try {
//         const serviceType = req.params.serviceType;
//         const skillProviders = await skillProviderService.getSkillProvidersByServiceType(serviceType);
        
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

// Controller function to get skill providers by service type

const getSkillProvidersByServiceType = async (req, res) => {
    try {
        const { serviceType } = req.params;
        
        // Validate the input
        if (!serviceType) {
            return res.status(400).json({ error: 'Service type is required' });
        }

        // Get skill providers by service type
        const skillProviders = await skillProviderService.getSkillProvidersByServiceType(serviceType);

        // Send the response
        return res.status(200).json(skillProviders);
    } catch (error) {
        console.error('Error fetching skill providers:', error);
        return res.status(500).json({ error: 'An error occurred while fetching skill providers' });
    }
};

// Define the route


// Get skill providers by service type
const findSkillProvidersByServiceType = async (req, res) => {
    try {
        const { serviceType } = req.params.serviceType;
        const skillProviders = await skillProviderService.findSkillProvidersByServiceType(serviceType);
        res.json(skillProviders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch skill providers' });
    }
};

// Controller function to get skill providers by matching keywords
const findSkillProvidersByKeyword = async (req, res) => {
    try {
        const { keyword } = req.query;
        const skillProviders = await skillProviderService.findSkillProvidersByKeyword(keyword);
        res.json(skillProviders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch skill providers' });
    }
};




async function searchSkillServiceType(req, res) {
    try {
        const {serviceType, subCategory } = req.params;
        const filter = { serviceType, subCategory };

        const skillProviders = await skillProviderService.searchSkillServiceType(filter);

        if (skillProviders.length === 0) {
            return res.status(404).json({ success: false, message: 'No skill providers found matching the criteria' });
        }

        res.status(200).json({ success: true, message: 'Skill providers filtered successfully', skillProviders });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'An error occurred while filtering skill providers' });
    }
}



module.exports = {
    update,
    createSkillProvider,
    getAllSkillProviders,
    getSkillProviderById,
    updateSkillProviderProfileWithImage,
    deleteSkillProvider,
    patchUpdateSkillProvider,
    updateOnlyImage,
    patchUpdateSkillProviderWithNoImage,
    filterSkillProviders,
    findByLocation,
    findByServiceOrSubCategory,
    searchSkillProviders,
    searchByLocation,
    searchByServiceOrSubCategory,
    getSkillProvidersByServiceType,
    findSkillProvidersByServiceType,
    findSkillProvidersByKeyword,
    searchSkillServiceType
};


// const skillProviderService = require('../services/skillProviderService');
// const fs = require('fs');


// const skillProviderController = {};





// skillProviderController.createSkillProvider = async (req, res) => {
//     try {
//         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;
//         const imagePath = req.file ? req.file.path : null; // Check if an image file is uploaded
        
//         // Call the service layer function to create the skill provider with or without an image path
//         const newSkillProvider = await skillProviderService.createSkillProvider({ firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode, imagePath });
        
//         // Return success response with the newly created skill provider data
//         res.status(201).json({ success: true, skillProvider: newSkillProvider });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }




// // Controller function to handle creating a skill provider
// // skillProviderController.createSkillProvider = async (req, res) => {
// //     try {
// //         // Check for validation errors
// //         if (!req.files || Object.keys(req.files).length === 0) {
// //             return res.status(400).json({ success: false, message: 'No files were uploaded.' });
// //         }

// //         // Extract skill provider data from the request body
// //         const { firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

// //         // Extract image paths from the request files
// //         const { imagePath, cacImagePath } = req.files;

// //         // Call the service function to create the skill provider
// //         const skillProvider = await skillProviderService.createSkillProvider({ firstName, lastName, email, password, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode }, imagePath, cacImagePath);

// //         // Return success response
// //         res.status(201).json({ success: true, skillProvider });
// //     } catch (error) {
// //         console.error('Error creating skill provider:', error);
// //         res.status(500).json({ success: false, message: 'Internal server error' });
// //     }
// // };

// // // Controller function to handle updating a skill provider with image upload
// // skillProviderController.updateSkillProvider = async (req, res) => {
// //     try {
// //         // Check for validation errors
// //         if (!req.files || Object.keys(req.files).length === 0) {
// //             return res.status(400).json({ success: false, message: 'No files were uploaded.' });
// //         }

// //         // Extract skill provider data from the request body
// //         const { id } = req.params;
// //         const { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode } = req.body;

// //         // Extract image paths from the request files
// //         const { imagePath, cacImagePath } = req.files;

// //         // Call the service function to update the skill provider
// //         const updatedSkillProvider = await skillProviderService.updateSkillProvider(id, { firstName, lastName, email, phone, secondPhone, stateOfResidence, city, street, serviceType, subCategory, openingHour, referralCode }, imagePath, cacImagePath);

// //         // Return success response
// //         res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
// //     } catch (error) {
// //         console.error('Error updating skill provider:', error);
// //         res.status(500).json({ success: false, message: 'Internal server error' });
// //     }
// // };


// // Create a new skill provider with google map
// skillProviderController.createSkillProviderWithGoogle = async (req, res) => {
//     try {
//         const skillProviderData = req.body;
//         const newSkillProvider = await skillProviderService.createSkillProviderWithGoogle(skillProviderData);
//         res.status(201).json(newSkillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get all skill providers
// skillProviderController.getAllSkillProviders = async (req, res) => {
//     try {
//         const allSkillProviders = await skillProviderService.getAllSkillProviders();
//         res.status(200).json(allSkillProviders);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get a skill provider by ID
// skillProviderController.getSkillProviderById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const skillProvider = await skillProviderService.getSkillProviderById(id);
//         if (!skillProvider) {
//             return res.status(404).json({ success: false, error: 'Skill provider not found' });
//         }
//         res.status(200).json(skillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Update a skill provider by ID
// skillProviderController.updateSkillProvider = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
//         const updatedSkillProvider = await skillProviderService.updateSkillProvider(id, updates);
//         res.status(200).json(updatedSkillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };



// skillProviderController.updateSkillProviderProfileWithImage = async (req, res) => {
    
//     try {
//         const providerId = req.params.id;

//         const { firstName, lastName, email, password, phone, secondPhone, address, serviceType, serviceTypeCategory, openingHour, referralCode } = req.body;
//         // Check if a file is uploaded
        
//         const imagePath = req.file.path; // Assuming you're storing the image path in req.file.path
        
//         // if (!imagePath) {
//         //     return res.status(400).json({ success: false, error: 'No image uploaded' });
//         // }
//         // Update customer information including the image path
//         const updatedSkillProvider = await skillProviderService.updateSkillProviderProfileWithImage(providerId, { firstName, lastName, email, password, phone, secondPhone, address, serviceType, serviceTypeCategory, openingHour, referralCode, imagePath });

//         res.status(200).json({ success: true, skillProvider: updatedSkillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }

// };




// skillProviderController.deleteSkillProvider = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await skillProviderService.deleteSkillProvider(id);
//         res.status(200).json({ success: true, message: 'Skill provider deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Find nearest skill providers based on latitude and longitude
// skillProviderController.findNearestSkillProviders = async (req, res) => {
//     try {
//         const { latitude, longitude } = req.query;
//         const nearestSkillProviders = await skillProviderService.findNearestSkillProviders(latitude, longitude);
//         res.status(200).json(nearestSkillProviders);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// module.exports = skillProviderController;



// const skillProviderService = require('../services/skillProviderService');

// const skillProviderController = {};

// // Create a new skill provider
// skillProviderController.createSkillProvider = async (req, res) => {
//     try {
//         const skillProviderData = req.body;
//         const newSkillProvider = await skillProviderService.createSkillProvider(skillProviderData);
//         res.status(201).json(newSkillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get all skill providers
// skillProviderController.getAllSkillProviders = async (req, res) => {
//     try {
//         const allSkillProviders = await skillProviderService.getAllSkillProviders();
//         res.status(200).json(allSkillProviders);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Get a skill provider by ID
// skillProviderController.getSkillProviderById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const skillProvider = await skillProviderService.getSkillProviderById(id);
//         if (!skillProvider) {
//             return res.status(404).json({ success: false, error: 'Skill provider not found' });
//         }
//         res.status(200).json(skillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Update a skill provider by ID
// skillProviderController.updateSkillProvider = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
//         const updatedSkillProvider = await skillProviderService.updateSkillProvider(id, updates);
//         res.status(200).json(updatedSkillProvider);
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Delete a skill provider by ID
// skillProviderController.deleteSkillProvider = async (req, res) => {
//     try {
//         const { id } = req.params;
//         await skillProviderService.deleteSkillProvider(id);
//         res.status(200).json({ success: true, message: 'Skill provider deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// module.exports = skillProviderController;



// const SkillProviderService = require('../services/skillProviderService');

// // Controller function to handle creating a new skill provider
// exports.createSkillProvider = async (req, res, next) => {
//     try {
//         const { firstName, lastName, email, phone, address, serviceType, serviceTypeCategory, openingHour, referralCode, userId } = req.body;
//         const skillProviderData = { firstName, lastName, email, phone, address, serviceType, serviceTypeCategory, openingHour, referralCode, userId };
//         const skillProvider = await SkillProviderService.createSkillProvider(skillProviderData);
//         res.status(201).json({ success: true, data: skillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle getting a skill provider by ID
// exports.getSkillProviderById = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const skillProvider = await SkillProviderService.getSkillProviderById(id);
//         if (!skillProvider) {
//             res.status(404).json({ success: false, message: 'Skill provider not found' });
//             return;
//         }
//         res.status(200).json({ success: true, data: skillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle updating a skill provider
// exports.updateSkillProvider = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const updates = req.body;
//         const updatedSkillProvider = await SkillProviderService.updateSkillProvider(id, updates);
//         res.status(200).json({ success: true, data: updatedSkillProvider });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };

// // Controller function to handle deleting a skill provider
// exports.deleteSkillProvider = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         await SkillProviderService.deleteSkillProvider(id);
//         res.status(200).json({ success: true, message: 'Skill provider deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// };
