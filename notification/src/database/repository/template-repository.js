const Template = require('../models/Template');
const { DatabaseError, NotFoundError } = require('../../utils/errors');
const { createLogger } = require('../../utils/logger');
const logger = createLogger('template-repository');

class TemplateRepository {
    async CreateTemplate(templateData) {
        try {
            const template = new Template(templateData);
            const result = await template.save();
            return result;
        } catch (err) {
            logger.error(`Error creating template: ${err.message}`);
            throw new DatabaseError(`Error creating template: ${err.message}`);
        }
    }

    async FindTemplateById(id) {
        try {
            const template = await Template.findById(id);
            
            if (!template) {
                throw new NotFoundError(`Template with ID ${id} not found`);
            }
            
            return template;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding template by ID: ${err.message}`);
            throw new DatabaseError(`Error finding template: ${err.message}`);
        }
    }

    async FindTemplateByName(name) {
        try {
            console.log(`Looking for template with name: ${name}`);
            const template = await Template.findOne({ name });
            
            if (!template) {
                console.log(`Template with name ${name} not found`);
                throw new NotFoundError(`Template with name ${name} not found`);
            }
            
            console.log(`Found template: ${template.name}`);
            return template;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error finding template by name: ${err.message}`);
            throw new DatabaseError(`Error finding template: ${err.message}`);
        }
    }

    async FindTemplatesByType(type) {
        try {
            const templates = await Template.find({ type, isActive: true });
            return templates;
        } catch (err) {
            logger.error(`Error finding templates by type: ${err.message}`);
            throw new DatabaseError(`Error finding templates: ${err.message}`);
        }
    }

    async UpdateTemplate(id, updateData) {
        try {
            const template = await Template.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!template) {
                throw new NotFoundError(`Template with ID ${id} not found`);
            }
            
            return template;
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error updating template: ${err.message}`);
            throw new DatabaseError(`Error updating template: ${err.message}`);
        }
    }

    async DeleteTemplate(id) {
        try {
            const template = await Template.findByIdAndDelete(id);
            
            if (!template) {
                throw new NotFoundError(`Template with ID ${id} not found`);
            }
            
            return { success: true };
        } catch (err) {
            if (err instanceof NotFoundError) {
                throw err;
            }
            logger.error(`Error deleting template: ${err.message}`);
            throw new DatabaseError(`Error deleting template: ${err.message}`);
        }
    }

    async GetAllTemplates() {
        try {
            const templates = await Template.find().sort({ name: 1 });
            return templates;
        } catch (err) {
            logger.error(`Error getting all templates: ${err.message}`);
            throw new DatabaseError(`Error getting all templates: ${err.message}`);
        }
    }
}

module.exports = TemplateRepository;