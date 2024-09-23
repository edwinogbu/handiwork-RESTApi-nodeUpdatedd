const nigerianStatesService = require('../services/nigerianStatesService');

async function createNigerianState(req, res) {
    try {
        const {
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        } = req.body;

        const newState = await nigerianStatesService.createNigerianState({
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        });

        res.status(201).json({ success: true, state: newState });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getNigerianStateById(req, res) {
    try {
        const stateId = req.params.id;
        const state = await nigerianStatesService.getNigerianStateById(stateId);
        if (!state) {
            res.status(404).json({ success: false, error: 'Nigerian state not found' });
            return;
        }
        res.status(200).json({ success: true, state });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getAllNigerianStates(req, res) {
    try {
        const states = await nigerianStatesService.getAllNigerianStates();
        res.status(200).json({ success: true, states });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function updateNigerianState(req, res) {
    try {
        const stateId = req.params.id;
        const {
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        } = req.body;

        const updatedState = await nigerianStatesService.updateNigerianState(stateId, {
            name,
            capital,
            state_code,
            creation_date,
            latitude,
            longitude,
            total_area,
            population,
            postal_code,
            religions
        });

        res.status(200).json({ success: true, state: updatedState });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function deleteNigerianState(req, res) {
    try {
        const stateId = req.params.id;
        await nigerianStatesService.deleteNigerianState(stateId);
        res.status(200).json({ success: true, message: 'Nigerian state deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function getCitiesByStateCode(req, res) {
    try {
        const stateCode = req.params.stateCode;
        const cities = await nigerianStatesService.getCitiesByStateCode(stateCode);
        res.status(200).json({ success: true, cities });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

async function createTown(req, res) {
    try {
        const {
            name,
            latitude,
            longitude,
            population,
            postal_code,
            total_area,
            creation_date,
            state_id
        } = req.body;

        const newTown = await nigerianStatesService.createTown({
            name,
            latitude,
            longitude,
            population,
            postal_code,
            total_area,
            creation_date,
            state_id
        });

        res.status(201).json({ success: true, town: newTown });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// async function getAllTownsByStateCode(req, res) {
//     try {
//         const stateCode = req.params.stateCode;
//         const towns = await nigerianStatesService.getAllTownsByStateCode(stateCode);
//         res.status(200).json({ success: true, towns });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

async function getAllTownsByStateCode(req, res) {
    try {
        const stateCode = req.params.stateCode;
        const towns = await nigerianStatesService.getCitiesByStateCode(stateCode);
        res.status(200).json(towns);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}


module.exports = {
    createNigerianState,
    getNigerianStateById,
    getAllNigerianStates,
    updateNigerianState,
    deleteNigerianState,
    getCitiesByStateCode,
    createTown,
    getAllTownsByStateCode
};



// const nigerianStatesService = require('../services/nigerianStatesService');



// async function createNigerianState(req, res) {
//     try {
//         const stateData = req.body;

//         // Call the service layer function to create the Nigerian state
//         const newState = await nigerianStatesService.createNigerianState(stateData);

//         // Return success response with the newly created state data
//         res.status(201).json({ success: true, state: newState });
//     } catch (error) {
//         // Return error response if any error occurs during the process
//         res.status(500).json({ success: false, error: error.message });
//     }
// }




// // async function getNigerianStateById(req, res) {
// //     try {
// //         const stateId = req.params.id;
// //         const state = await nigerianStatesService.getNigerianStateById(stateId);
// //         if (!state) {
// //             res.status(404).json({ success: false, error: 'State not found' });
// //             return;
// //         }
// //         res.status(200).json({ success: true, state });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }


// // async function getAllNigerianStates(req, res) {
// //     try {
// //         const nigerianStates = await nigerianStatesService.getAllNigerianStates();
// //         res.status(200).json({ success: true, nigerianStates });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }

// // async function updateNigerianState(req, res) {
// //     try {
// //         const stateId = req.params.id;
// //         const {
// //             name,
// //             capital,
// //             state_code,
// //             creation_date,
// //             latitude,
// //             longitude,
// //             total_area,
// //             population,
// //             postal_code,
// //             religions
// //         } = req.body;

// //         // Call the service layer function to update the Nigerian state
// //         const updatedState = await nigerianStatesService.updateNigerianState(stateId, {
// //             name,
// //             capital,
// //             state_code,
// //             creation_date,
// //             latitude,
// //             longitude,
// //             total_area,
// //             population,
// //             postal_code,
// //             religions
// //         });

// //         res.status(200).json({ success: true, state: updatedState });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }

// // async function deleteNigerianState(req, res) {
// //     try {
// //         const stateId = req.params.id;
// //         await nigerianStatesService.deleteNigerianState(stateId);
// //         res.status(200).json({ success: true, message: 'State deleted successfully' });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }

// async function getNigerianStateById(req, res) {
//     try {
//         const stateId = req.params.id;
//         const state = await nigerianStatesService.getNigerianStateById(stateId);
//         if (!state) {
//             res.status(404).json({ success: false, error: 'Nigerian state not found' });
//             return;
//         }
//         res.status(200).json({ success: true, state });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }



// // async function getAllNigerianStates(req, res) {
// //     try {
// //         const stateData = await nigerianStatesService.getAllNigerianStates();
// //         res.status(200).json({ success: true, stateData });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }

// // async function getAllNigerianStates(req, res) {
// //     try {
// //         const states = await nigerianStatesService.getAllNigerianStates();

// //         // Format the states data as required
// //         const formattedStates = states.map(state => ({
// //             name: state.name,
// //             capital: state.capital,
// //             state_code: state.state_code,
// //             creation_date: state.creation_date,
// //             location: {
// //                 latitude: state.latitude || null,
// //                 longitude: state.longitude || null
// //             },
// //             total_area: state.total_area || null,
// //             population: state.population || null,
// //             postal_code: state.postal_code || null,
// //             religions: state.religions || []
// //         }));

// //         res.status(200).json({ success: true,  message: 'Unable To list all Nigerian state', states: formattedStates });
// //     } catch (error) {
// //         res.status(500).json({ success: false, error: error.message });
// //     }
// // }


// // Controller function to handle the request for getting all Nigerian states
// async function getAllNigerianStates(req, res) {
//     try {
//         // Call the service function to get all states
//         const states = await nigerianStatesService.getAllNigerianStates();
        
//         // Send the states as JSON response
//         res.status(200).json(states);
//     } catch (error) {
//         // Handle errors
//         console.error('Error retrieving Nigerian states:', error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


// async function updateNigerianState(req, res) {
//     try {
//         const stateId = req.params.id;
//         const stateData = req.body;

//         // Update Nigerian state information
//         const updatedState = await nigerianStatesService.updateNigerianState(stateId, stateData);

//         res.status(200).json({ success: true, state: updatedState });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function deleteNigerianState(req, res) {
//     try {
//         const stateId = req.params.id;
//         await nigerianStatesService.deleteNigerianState(stateId);
//         res.status(200).json({ success: true, message: 'Nigerian state deleted successfully' });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// async function getCitiesByStateCode(req, res) {
//     try {
//         const stateCode = req.params.state_code;
//         const cities = await nigerianStatesService.getCitiesByStateCode(stateCode);
//         res.status(200).json({ success: true, cities });
//     } catch (error) {
//         res.status(500).json({ success: false, error: error.message });
//     }
// }

// module.exports = {
//     createNigerianState,
//     getNigerianStateById,
//     getAllNigerianStates,
//     updateNigerianState,
//     deleteNigerianState,
//     getCitiesByStateCode
// };
