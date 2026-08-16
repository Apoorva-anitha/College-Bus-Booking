import { Router } from 'express';
import { login, register, getMe, switchRole, logout, getAllUsers, studentLogin, studentActivate } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validateBody, LoginSchema, RegisterSchema } from '../middleware/validate';

const router = Router();

router.post('/student/login', studentLogin);
router.post('/student/activate', studentActivate);
router.post('/student/register', studentActivate);
router.post('/login', validateBody(LoginSchema), login);
router.post('/register', validateBody(RegisterSchema), register);
router.get('/me', authenticate, getMe);
router.post('/switch-role', switchRole);
router.post('/logout', logout);
router.get('/users', getAllUsers);

export default router;

