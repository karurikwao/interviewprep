import { Router } from 'express';
import { prisma } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req: any, res) => {
  try {
    let progress = await prisma.userProgress.findUnique({ where: { userId: req.user.userId } });
    if (!progress) {
      progress = await prisma.userProgress.create({ data: { userId: req.user.userId } });
    }
    res.json(progress);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authMiddleware, async (req: any, res) => {
  try {
    const { reviewedTopics, checkedItems, timelineData } = req.body;
    const progress = await prisma.userProgress.upsert({
      where: { userId: req.user.userId },
      update: { reviewedTopics, checkedItems, timelineData },
      create: { userId: req.user.userId, reviewedTopics, checkedItems, timelineData },
    });
    res.json(progress);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export { router as progressRouter };
