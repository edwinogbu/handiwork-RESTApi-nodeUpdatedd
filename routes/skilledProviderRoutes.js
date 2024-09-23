const express = require('express');
const router = express.Router();
const userToken = require('./../middleware/userToken');
const skillProviderController = require('../controllers/skillProviderController');
const uploadMiddleware = require('../middleware/uploadMiddleware');

// Route to create a new skill provider
router.post('/create', uploadMiddleware, skillProviderController.createSkillProvider);

// Route to create a new skill provider
// router.post('/createWithCoordinate', skillProviderController.createSkillProviderWithGoogle);

// Route to get all skill providers
router.get('/skillproviders',  skillProviderController.getAllSkillProviders);

// Route to get a skill provider by ID
router.get('/view/:id', skillProviderController.getSkillProviderById);

// Route to update a skill provider by ID
// router.put('/update/:id', skillProviderController.updateSkillProvider);
router.put('/updateSkillProvider/:id', uploadMiddleware, skillProviderController.updateSkillProviderProfileWithImage);

// PATCH route to update a skill provider by ID
router.patch('/update/:id',  uploadMiddleware, skillProviderController.update);

// Route to update a skill provider by ID using PATCH
router.patch('/updateSkillParam/:id', uploadMiddleware, userToken, skillProviderController.patchUpdateSkillProvider);
// router.patch('/patchUpdate/:id', uploadMiddleware, skillProviderController.patchUpdate);


// Route to delete a skill provider by ID
router.delete('/delete/:id', userToken, skillProviderController.deleteSkillProvider);
// router.delete('/find-skillProvider/:id', skillProviderController.findNearestSkillProviders);

// const { updateOnlyImage } = require('../controllers/skillProviderController');

// Route to update only the image of a skill provider
router.put('/providers-image/:id', uploadMiddleware, skillProviderController.updateOnlyImage);

// Route for updating a skill provider
// router.patch('/updateProvider-withNoImage/:id', skillProviderController.patchUpdateSkillProviderWithNoImage);

// Route for updating a skill provider without updating the image
router.patch('/updateOnlyParams/:id', uploadMiddleware, skillProviderController.patchUpdateSkillProviderWithNoImage);




// THESE SEARCH ENPOINTS PASSES PARAMETERS  ON THE BODY WITH JSON 
// Route to filter skill providers
// router.get('/filter', skillProviderController.filterSkillProviders);

// Route to search skill providers
router.get('/search', skillProviderController.searchSkillProviders);


// Route to find skill providers by location
router.get('/findByLocation', skillProviderController.findByLocation);

// Route to find skill providers by service type or subcategory
router.get('/findByServiceOrSubCategory', skillProviderController.findByServiceOrSubCategory);



// THESE ENPOINTS PASSES PARAM ON THE URL I MADE THIS FOR VICTOR MOBILE INTEGRATION
// Route to filter skill providers
router.get('/searchSkill/:stateOfResidence?/:city?/:street?/:address?/:serviceType?/:subCategory?', skillProviderController.searchSkillProviders);
router.get('/searchSkillServiceType/:serviceType', skillProviderController.searchSkillServiceType);
router.get('/searchSkill/:subCategory?', skillProviderController.searchSkillProviders);

// Route to find skill providers by location
router.get('/searchByLocation/:stateOfResidence?/:city?/:street?/:address?', skillProviderController.searchByLocation);

// Route to find skill providers by service type or subcategory
router.get('/searchByServiceOrSubCategory/:serviceType?/:subCategory?', skillProviderController.searchByServiceOrSubCategory);

// router.get('/searchServiceType/:serviceType', skillProviderController.getSkillProvidersByServiceType);
router.get('/service-type/:serviceType', skillProviderController.getSkillProvidersByServiceType);
router.get('/find-service-type/:serviceType', skillProviderController.findSkillProvidersByServiceType );
// http://localhost:5000/api/skill-providers/service-type/plumbers
// http://localhost:5000/api/skills-subcategory/update/1
// http://localhost:5000/api/skill-providers/searchSkill/lagos
// http://localhost:5000/api/skill-providers/searchSkillServiceType/Plumbing Services


// Route to get skill providers by matching keywords
router.get('/skill-providers/search', skillProviderController.findSkillProvidersByKeyword);

module.exports = router;



// const express = require('express');
// const router = express.Router();
// const userToken = require('./../middleware/userToken');
// const skillProviderController = require('../controllers/skillProviderController');

// // POST request to create a new skill provider
// router.post('/create', userToken, skillProviderController.createSkillProvider);

// // GET request to get a skill provider by ID
// router.get('/view/:id', userToken, skillProviderController.getSkillProviderById);

// // PUT request to update a skill provider by ID
// router.put('/update/:id', userToken, skillProviderController.updateSkillProvider);

// // DELETE request to delete a skill provider by ID
// router.delete('/delete/:id', userToken, skillProviderController.deleteSkillProvider);

// module.exports = router;
