const Joi = require('joi');

const createBookSchema = Joi.object({
	title: Joi.string().min(3).max(255).required(),
	author: Joi.string().min(3).max(255).required(),
	publisher: Joi.string().min(3).max(255).required(),
	category: Joi.string().min(3).max(100).required(),
	imageUrl: Joi.string().uri().optional(),
	status: Joi.string().valid('available', 'issued', 'reserved', 'lost').optional(),
});

const updateBookSchema = Joi.object({
	title: Joi.string().min(3).max(255).optional(),
	author: Joi.string().min(3).max(255).optional(),
	publisher: Joi.string().min(3).max(255).optional(),
	category: Joi.string().min(3).max(100).optional(),
	imageUrl: Joi.string().uri().optional(),
	status: Joi.string().valid('available', 'issued', 'reserved', 'lost').optional(),
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
	validateCreateBook: validateBody(createBookSchema),
	validateUpdateBook: validateBody(updateBookSchema),
	validateBookId: validateParams(idParamSchema),
};

