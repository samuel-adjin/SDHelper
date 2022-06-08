import {Router} from "express";
import auth from '../../controller/Auth/auth';
import authMiddleware from "middleware/authMiddleware";

const router = Router();

router.route('/login').post(auth.login);
router.route('/register').post(auth.register);
router.route('/verify-email').post(auth.verifyEmail);
router.route('/reset-link').post(auth.resetLink);
router.route('/reset-password').post(auth.resetPassword);
router.route('/refresh-token').get(authMiddleware.verifyRefreshToken,auth.token);


export default router;

