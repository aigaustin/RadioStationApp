const prisma = require('../lib/prisma');

class PlanService {
  async getActivePlans() {
    return prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });
  }

  async getAllPlans() {
    return prisma.plan.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPlan(data) {
    if (!['RADIO', 'TV', 'STREAMING', 'FULL'].includes(data.type)) {
      throw new Error('Invalid plan type. Must be RADIO, TV, STREAMING, or FULL.');
    }

    return prisma.plan.create({
      data: {
        name: data.name,
        type: data.type,
        price: Number(data.price),
        interval: data.interval || 'monthly',
        features: data.features || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
        trialDays: data.trialDays ? parseInt(data.trialDays, 10) : 0
      }
    });
  }

  async updatePlan(id, data) {
    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.price !== undefined) updateData.price = Number(data.price);
    if (data.interval !== undefined) updateData.interval = data.interval;
    if (data.features !== undefined) updateData.features = data.features;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.trialDays !== undefined) updateData.trialDays = parseInt(data.trialDays, 10);

    return prisma.plan.update({
      where: { id },
      data: updateData
    });
  }

  async deletePlan(id) {
    const subCount = await prisma.subscription.count({
      where: { planId: id }
    });
    
    if (subCount > 0) {
      throw new Error('Cannot delete plan with active subscriptions. Archive it by setting isActive to false instead.');
    }

    return prisma.plan.delete({
      where: { id }
    });
  }
}

module.exports = new PlanService();
