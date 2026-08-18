import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export async function studentLogin(req: Request, res: Response) {
  try {
    const { registrationNumber, password } = req.body;
    if (!registrationNumber) {
      return res.status(400).json({ success: false, error: 'Registration number is required' });
    }
    const result = await authService.studentLogin(registrationNumber, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
}

export async function studentActivate(req: Request, res: Response) {
  try {
    const { registrationNumber, password } = req.body;
    if (!registrationNumber || !password) {
      return res.status(400).json({ success: false, error: 'Registration number and password are required' });
    }
    const result = await authService.studentActivate(registrationNumber, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);

    // Set secure HTTP-only cookie
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getMe(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Not authenticated' });
  }
  const user = authService.getUserById(req.user.userId) || {
    id: req.user.userId,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
    name: req.user.username
  };
  res.json({ success: true, user });
}

export async function switchRole(req: Request, res: Response) {
  try {
    const { userId, role } = req.body;
    const result = await authService.switchRole(userId, role);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      token: result.token,
      user: result.user
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function changeStudentPassword(req: Request, res: Response) {
  try {
    const { registrationNumber, oldPassword, newPassword } = req.body;
    const target = registrationNumber || req.user?.username || req.user?.userId;
    if (!target) {
      return res.status(400).json({ success: false, error: 'Registration number is required' });
    }
    const result = await authService.changeStudentPassword(target, oldPassword, newPassword);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getAllUsers(_req: Request, res: Response) {
  res.json({ users: authService.getUsers() });
}
