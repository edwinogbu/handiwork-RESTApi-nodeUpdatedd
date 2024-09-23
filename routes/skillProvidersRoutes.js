const express = require('express');
const router = express.Router();
const skillProvidersController = require('./skillProvidersController');

// Create a new skill provider
router.post('/', skillProvidersController.createSkillProvider);

// Get a skill provider by ID
router.get('/:providerId', skillProvidersController.getSkillProviderById);

// Get all skill providers
router.get('/', skillProvidersController.getAllSkillProviders);

// Update a skill provider
router.put('/:providerId', skillProvidersController.updateSkillProvider);

// Delete a skill provider
router.delete('/:providerId', skillProvidersController.deleteSkillProvider);

module.exports = router;
