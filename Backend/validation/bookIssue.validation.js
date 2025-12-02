const Joi = require('joi');

const requestBookSchema = Joi.object({
    bookId: Joi.number().integer().positive().required(),
    // local date-only format YYYY-MM-DD
    returnDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const approveBodySchema = Joi.object({
    approve: Joi.boolean().required(),
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

function validateBody(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const details = error.details.map((d) => d.message);
            return res.sendError('Validation failed', 400, { errors: details });
        }
        req.body = value;
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
    validateRequestBook: validateBody(requestBookSchema),
    validateApproveBody: validateBody(approveBodySchema),
    validateIssueId: validateParams(idParamSchema),
};
