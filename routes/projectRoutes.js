const express = require('express');
const router = express.Router();

const projectController = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management (create, read, update, delete)
 */

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *               - projectDesc
 *               - dueDate
 *             properties:
 *               projectName:
 *                 type: string
 *               projectDesc:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Failed to create project
 */
router.post('/', authMiddleware, projectController.createProject);

/**
 * @swagger
 * /api/projects/user/{userId}:
 *   get:
 *     summary: Get all projects for a specific user
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of user's projects
 *       404:
 *         description: User or projects not found
 */
router.get('/user/:userId', authMiddleware, projectController.getProjectsByUser);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   get:
 *     summary: Get a specific project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project found
 *       404:
 *         description: Project not found
 */
router.get('/:projectId', authMiddleware, projectController.getProjectById);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   put:
 *     summary: Update a project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projName:
 *                 type: string
 *               projDesc:
 *                 type: string
 *               dueDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       400:
 *         description: Failed to update project
 */
router.put('/:projectId', authMiddleware, projectController.updateProject);

/**
 * @swagger
 * /api/projects/{projectId}:
 *   delete:
 *     summary: Delete a project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the project
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 */
router.delete('/:projectId', authMiddleware, projectController.deleteProject);

module.exports = router;
