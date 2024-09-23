const skillProvidersService = require('../services/skillProvidersService');

const skillProvidersController = {};

skillProvidersController.createSkillProvider = async (req, res, next) => {
    try {
        const skillProviderData = req.body;
        const createdProvider = await skillProvidersService.createSkillProvider(skillProviderData);
        res.status(201).json(createdProvider);
    } catch (error) {
        next(error);
    }
};

skillProvidersController.getAllSkillProviders = async (req, res, next) => {
    try {
        const providers = await skillProvidersService.getAllSkillProviders();
        res.status(200).json(providers);
    } catch (error) {
        next(error);
    }
};

skillProvidersController.getSkillProviderById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const provider = await skillProvidersService.getSkillProviderById(id);
        res.status(200).json(provider);
    } catch (error) {
        next(error);
    }
};

skillProvidersController.updateSkillProvider = async (req, res, next) => {
    try {
        const { id } = req.params;
        const providerData = req.body;
        const updatedProvider = await skillProvidersService.updateSkillProvider(id, providerData);
        res.status(200).json(updatedProvider);
    } catch (error) {
        next(error);
    }
};

skillProvidersController.deleteSkillProvider = async (req, res, next) => {
    try {
        const { id } = req.params;
        await skillProvidersService.deleteSkillProvider(id);
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

module.exports = skillProvidersController;
