const express = require('express');
const { requireAuth, requireGlobalAdmin } = require('../middleware/auth');
const planController = require('../controllers/PlanController');

const router = express.Router();

// GET /api/plans - List all active plans
router.get('/', planController.getActivePlans);

// GET /api/plans/all - Super Admin only: List all plans including inactive
router.get('/all', requireAuth, requireGlobalAdmin, planController.getAllPlans);

// POST /api/plans - Super Admin only: Create a new plan
router.post('/', requireAuth, requireGlobalAdmin, planController.createPlan);

// PUT /api/plans/:id - Super Admin only: Update a plan
router.put('/:id', requireAuth, requireGlobalAdmin, planController.updatePlan);

// DELETE /api/plans/:id - Super Admin only: Delete a plan
router.delete('/:id', requireAuth, requireGlobalAdmin, planController.deletePlan);

module.exports = router;
