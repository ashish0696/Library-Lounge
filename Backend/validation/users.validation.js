const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string()
        .pattern(/^[0-9()+\-\s]{7,20}$/)
        .required()
        .messages({ 'string.pattern.base': 'phone must be a valid phone number' }),
    password: Joi.string()
        .min(6)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
        .required()
        .messages({
            'string.pattern.base': 'password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
        }),
    role: Joi.string().valid('librarian', 'member','superAdmin').optional(),
});

const updateUserSchema = Joi.object({
	name: Joi.string().min(2).max(100).optional(),
	email: Joi.string().email().optional(),
	phone: Joi.string()
		.pattern(/^[0-9()+\-\s]{7,20}$/)
		.optional()
		.messages({ 'string.pattern.base': 'phone must be a valid phone number' }),
	password: Joi.string().min(6).max(128).optional(),
	role: Joi.string().valid('librarian', 'member','superAdmin').optional(),
}).min(1); 


const idParamSchema = Joi.object({
	id: Joi.number().integer().positive().required(),
});


function validateBody(schema) {
	return (req, res, next) => {
		const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
		if (error) {
				const details = error.details.map((d) => d.message);
				return res.sendError('Validation failed', 400, { errors: details });
			}
		next();
	};
}

function validateParams(schema) {
	return (req, res, next) => {
		const { error, value } = schema.validate(req.params, { abortEarly: false, stripUnknown: true });
		if (error) {
			const details = error.details.map((d) => d.message);
			return res.sendError('Validation failed', 400, { errors: details });
		}
		req.params = value;
		next();
	};
}

module.exports = {
	validateCreateUser: validateBody(createUserSchema),
	validateUpdateUser: validateBody(updateUserSchema),
	validateUserId: validateParams(idParamSchema),
};

