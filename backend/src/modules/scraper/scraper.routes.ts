import { Router } from 'express';
import { triggerScrape } from './scraper.controller';

const router = Router();

router.post('/trigger', triggerScrape);

export default router;
