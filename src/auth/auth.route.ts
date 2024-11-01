import express, { Request, Response } from 'express';
import { registerUser, loginUser, loginWithGoogleOAUTH, googleOAUTHCallback } from './auth.controller';
import passport from 'passport';
import { authenticateJWT } from '../common/middlewares/authenticateJWT';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// protected-route JWT Authorization checking
// router.get('/protected-route', authenticateJWT, (req: Request, res: Response) => {
//     res.json({ message: "You have access to this protected route", user: req.user });
// })

router.get('/google/login', loginWithGoogleOAUTH);
router.get('/google/calback', passport.authenticate("google", { session: false }), googleOAUTHCallback)

export default router;