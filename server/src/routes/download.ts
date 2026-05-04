import { Router } from 'express';
import { prisma } from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', authMiddleware, async (req: any, res) => {
  try {
    const { topicId } = req.body;
    await prisma.downloads.create({ data: { userId: req.user.userId, topicId, ipAddress: req.ip } });
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/settings', async (_req, res) => {
  let settings = await prisma.adminSettings.findUnique({ where: { id: 'admin-settings' } });
  if (!settings) settings = await prisma.adminSettings.create({ data: { id: 'admin-settings' } });
  const activeNetworks = await prisma.adNetwork.findMany({ where: { isActive: true }, orderBy: { priority: 'desc' } });
  res.json({ adsEnabled: settings.adsEnabled, interstitialBeforeDownload: settings.interstitialBeforeDownload, interstitialDurationSec: settings.interstitialDurationSec, activeNetworks });
});

export { router as downloadRouter };
