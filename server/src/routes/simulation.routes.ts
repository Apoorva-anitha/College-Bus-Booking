import { Router } from 'express';
import { runConcurrencyTest, seedAdyarBenchmark } from '../controllers/simulation.controller';
import { optionalAuthenticate } from '../middleware/authenticate';

const router = Router();

router.post('/concurrency-test', optionalAuthenticate, runConcurrencyTest);
router.post('/seed-adyar', optionalAuthenticate, seedAdyarBenchmark);

export default router;
