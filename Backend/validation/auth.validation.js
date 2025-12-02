const Joi = require('joi');

const loginSchema = Joi.object({
	email: Joi.string().email().required(),
	password: Joi.string()
            .min(6)
            .max(128)
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
            .required()
            .messages({
                'string.pattern.base': 'password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
            }),
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

module.exports = {
	validateLogin: validateBody(loginSchema),
};

