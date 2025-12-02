const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const {
	validateCreateUser,
	validateUpdateUser,
	validateUserId,
} = require('../validation/users.validation');
const {checkAuthJWT} = require('../middleware/authMiddleware');
const {roleMiddleware} = require('../middleware/roleMiddleware');


router.post('/', validateCreateUser, userController.createUser);

router.put('/:id', checkAuthJWT, roleMiddleware(['superAdmin']), validateUserId, validateUpdateUser, userController.updateUser);

router.get('/:id', checkAuthJWT, roleMiddleware(['superAdmin','librarian']), validateUserId, userController.getUserById);

router.get('/', checkAuthJWT, roleMiddleware(['superAdmin']), userController.getAllUsers);

router.delete('/:id', checkAuthJWT, roleMiddleware(['superAdmin']), validateUserId, userController.removeUser);

module.exports = router;
