const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users.controller');
const authenticateToken = require('../middlewares/auth');

router.use('/solves', authenticateToken);
router.use('/islogged', authenticateToken);
router.use('/isAdmin', authenticateToken);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - BearerAuth: []
 */


/**
 * @swagger
 * /users/solves:
 *   post:
 *     summary: Get the solved challenges for a user
 *     description: Retrieve the IDs of the challenges solved by a user based on their ID, after authenticating the request using a token.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The unique identifier of the user.
 *                 example: "12345"
 *     responses:
 *       '200':
 *         description: OK. Returns the array of solved challenge IDs for the user.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: integer
 *                 example: 12
 *       '400':
 *         description: Bad Request. The user does not exist.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "User does not exist"
 *       '403':
 *         description: Forbidden. Permission denied to access the endpoint.
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: "Not permitted!"
 */

router.get('/solves', usersController.solves);
router.get('/islogged', usersController.isLogged);

/**
 * @swagger
 * /users/ranking:
 *   get:
 *     summary: Get the ranking of users by points
 *     description: Retrieve the ranking of users based on their points.
 *     responses:
 *       '200':
 *         description: OK. Returns the ranking of users by points.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                     description: The unique identifier of the user.
 *                     example: 12
 *                   username:
 *                     type: string
 *                     description: The username of the user.
 *                     example: "john_doe"
 *                   points:
 *                     type: number
 *                     description: The points accumulated by the user.
 *                     example: 2500
 *                   rank:
 *                     type: integer
 *                     description: The ranking position of the user.
 *                     example: 1
 *       '500':
 *         description: Internal Server Error. An error occurred while retrieving the ranking.
 */
router.get('/ranking', usersController.ranking);
router.get('/isAdmin', usersController.isAdmin);

router.post('/verify', usersController.verifyRegistration);
router.post('/verifyPass', usersController.verifyPasswordChange);
router.post('/register', usersController.register);
router.post('/changePassword', usersController.changePassword);
router.post('/login', usersController.login);

module.exports = router;
