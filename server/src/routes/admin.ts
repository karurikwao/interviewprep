import { Router } from 'express';
import { prisma } from '../db.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// === Admin Settings ===
router.get('/settings', async (_req, res) => {
  let settings = await prisma.adminSettings.findUnique({ where: { id: 'admin-settings' } });
  if (!settings) {
    settings = await prisma.adminSettings.create({ data: { id: 'admin-settings' } });
  }
  res.json(settings);
});

router.put('/settings', async (req, res) => {
  const { adsEnabled, interstitialBeforeDownload, interstitialDurationSec, cookieConsentEnabled, maintenanceMode, siteVerificationSnippets } = req.body;
  const settings = await prisma.adminSettings.upsert({
    where: { id: 'admin-settings' },
    update: { adsEnabled, interstitialBeforeDownload, interstitialDurationSec, cookieConsentEnabled, maintenanceMode, siteVerificationSnippets },
    create: { id: 'admin-settings', adsEnabled, interstitialBeforeDownload, interstitialDurationSec, cookieConsentEnabled, maintenanceMode, siteVerificationSnippets },
  });
  res.json(settings);
});

// === Ad Networks ===
router.get('/ad-networks', async (_req, res) => {
  const networks = await prisma.adNetwork.findMany({ orderBy: { priority: 'desc' } });
  res.json(networks);
});

router.post('/ad-networks', async (req, res) => {
  const { name, label, adCode, isActive, priority, settings } = req.body;
  const network = await prisma.adNetwork.create({ data: { name, label, adCode, isActive, priority, settings } });
  res.status(201).json(network);
});

router.put('/ad-networks/:id', async (req, res) => {
  const { name, label, adCode, isActive, priority, settings } = req.body;
  const network = await prisma.adNetwork.update({ where: { id: req.params.id }, data: { name, label, adCode, isActive, priority, settings } });
  res.json(network);
});

router.delete('/ad-networks/:id', async (req, res) => {
  await prisma.adNetwork.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// === User Management ===
router.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, emailVerified: true, createdAt: true, progress: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(users);
});

router.put('/users/:id', async (req, res) => {
  const { isActive, role } = req.body;
  const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive, role }, select: { id: true, email: true, isActive: true, role: true } });
  res.json(user);
});

router.delete('/users/:id', async (req, res) => {
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

// === Stats ===
router.get('/stats', async (_req, res) => {
  const [totalUsers, totalDownloads, activeNetworks] = await Promise.all([
    prisma.user.count(),
    prisma.downloads.count(),
    prisma.adNetwork.count({ where: { isActive: true } }),
  ]);
  const recentDownloads = await prisma.downloads.findMany({ take: 50, orderBy: { createdAt: 'desc' }, include: { user: { select: { email: true } } } });
  res.json({ totalUsers, totalDownloads, activeNetworks, recentDownloads });
});

export { router as adminRouter };
