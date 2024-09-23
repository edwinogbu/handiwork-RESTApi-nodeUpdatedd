const express = require('express');
const router = express.Router();
const nigeriaStatesController = require('../controllers/nigerianStatesController ');

// Routes for Nigerian States
router.post('/create', nigeriaStatesController.createNigerianState);
router.get('/view/:id', nigeriaStatesController.getNigerianStateById);
router.get('/states', nigeriaStatesController.getAllNigerianStates);
router.put('/update/:id', nigeriaStatesController.updateNigerianState);
router.delete('/delete/:id', nigeriaStatesController.deleteNigerianState);

// Route for getting cities by state code
router.get('/:stateCode/cities', nigeriaStatesController.getCitiesByStateCode);

// Routes for Towns
router.post('/towns', nigeriaStatesController.createTown);
router.get('/:stateCode/towns', nigeriaStatesController.getAllTownsByStateCode);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const nigerianStatesController = require('../controllers/nigerianStatesController ');

// // Route to create a new Nigerian state
// router.post('/create', nigerianStatesController.createNigerianState);

// // Route to get Nigerian state by ID
// // router.get('/:id', nigerianStatesController.getNigerianStateById);

// // Route to get all Nigerian states
// router.get('/states', nigerianStatesController.getAllNigerianStates);

// // Route to update Nigerian state by ID
// router.put('/update/:id', nigerianStatesController.updateNigerianState);

// // Route to delete Nigerian state by ID
// router.delete('/delete/:id', nigerianStatesController.deleteNigerianState);

// // Route to get cities in a specific Nigerian state by state code
// router.get('/:state_code/towns', nigerianStatesController.getCitiesByStateCode);

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const nigerianStatesController = require('../controllers/nigerianStatesController ');

// // Route to create a new Nigerian state
// router.post('/api/nigerian-states', nigerianStatesController.createNigerianState);

// // Route to get Nigerian state by ID
// router.get('/api/nigerian-states/:id', nigerianStatesController.getNigerianStateById);

// // Route to get all Nigerian states
// router.get('/api/nigerian-states', nigerianStatesController.getAllNigerianStates);

// // Route to update Nigerian state by ID
// router.put('/api/nigerian-states/:id', nigerianStatesController.updateNigerianState);

// // Route to delete Nigerian state by ID
// router.delete('/api/nigerian-states/:id', nigerianStatesController.deleteNigerianState);

// // Route to get cities in a specific Nigerian state by state code
// router.get('/api/nigerian-states/:state_code/towns', nigerianStatesController.getCitiesByStateCode);

// module.exports = router;
