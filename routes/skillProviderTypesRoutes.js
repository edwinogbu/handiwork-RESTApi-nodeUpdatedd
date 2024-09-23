const express = require('express');
const router = express.Router();
const skillProviderTypesController = require('../controllers/skillProviderTypesController');

// Create a new skill type
router.post('/createSkillType', skillProviderTypesController.createSkillType);

// Update a skill type by ID
router.put('/updateSkillType/:id', skillProviderTypesController.updateSkillType);

// View a skill type by ID
router.get('/viewSkillType/:id', skillProviderTypesController.getSkillTypeById);

// View all skill types
router.get('/viewAllSkillTypes', skillProviderTypesController.getAllSkillTypes);

// Delete a skill type by ID
router.delete('/deleteSkillType/:id', skillProviderTypesController.deleteSkillType);

module.exports = router;


// const express = require('express');
// const userToken = require('../middleware/userToken');
// const skillProviderTypesController = require('../controllers/skillProviderTypesController');

// const router = express.Router();

// router.post('/create', skillProviderTypesController.createSkillProviderType);
// router.get('/types', skillProviderTypesController.getAllSkillProviderTypes);
// router.get('/type/:id', skillProviderTypesController.getSkillProviderTypeById);
// router.put('/update/:id', skillProviderTypesController.updateSkillProviderType);
// router.delete('/delete/:id', skillProviderTypesController.deleteSkillProviderType);

// router.get('/searchServiceType/:serviceType', skillProviderTypesController.getSkillProvidersByServiceType);


// module.exports = router;
