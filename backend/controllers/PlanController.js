const planService = require('../services/PlanService');

class PlanController {
  async getActivePlans(req, res) {
    try {
      const plans = await planService.getActivePlans();
      res.json({ ok: true, data: plans });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async getAllPlans(req, res) {
    try {
      const plans = await planService.getAllPlans();
      res.json({ ok: true, data: plans });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async createPlan(req, res) {
    try {
      const plan = await planService.createPlan(req.body);
      res.json({ ok: true, data: plan });
    } catch (error) {
      const status = error.message.includes('Invalid plan type') ? 400 : 500;
      res.status(status).json({ ok: false, error: error.message });
    }
  }

  async updatePlan(req, res) {
    try {
      const plan = await planService.updatePlan(req.params.id, req.body);
      res.json({ ok: true, data: plan });
    } catch (error) {
      res.status(500).json({ ok: false, error: error.message });
    }
  }

  async deletePlan(req, res) {
    try {
      await planService.deletePlan(req.params.id);
      res.json({ ok: true });
    } catch (error) {
      const status = error.message.includes('Cannot delete plan') ? 400 : 500;
      res.status(status).json({ ok: false, error: error.message });
    }
  }
}

module.exports = new PlanController();
