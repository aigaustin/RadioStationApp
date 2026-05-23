class ScheduleController {
  
  static async createSchedule(req, res, prisma) {
    try {
      const { radioStationId, playlistId, name, startTime, endTime, isRecurring, daysOfWeek } = req.body;
      if (!radioStationId || !name || !startTime || !endTime) {
        return res.status(400).json({ ok: false, error: 'Missing required schedule fields' });
      }

      const schedule = await prisma.schedule.create({
        data: {
          radioStationId,
          playlistId, // Can be null if it's a live DJ event
          name,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          isRecurring: isRecurring || false,
          daysOfWeek // e.g. "1,2,3,4,5" for Mon-Fri
        }
      });
      res.json({ ok: true, data: schedule });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async listSchedules(req, res, prisma) {
    try {
      const { radioStationId } = req.query;
      const schedules = await prisma.schedule.findMany({
        where: { radioStationId },
        include: { playlist: true },
        orderBy: { startTime: 'asc' }
      });
      res.json({ ok: true, data: schedules });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }

  static async deleteSchedule(req, res, prisma) {
    try {
      const { id } = req.params;
      await prisma.schedule.delete({ where: { id } });
      res.json({ ok: true });
    } catch (e) {
      res.status(500).json({ ok: false, error: e.message });
    }
  }
}

module.exports = ScheduleController;
