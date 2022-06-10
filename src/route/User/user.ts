import {Router} from  'express';
import user from '../../controller/User/user';
import middleware from "../../middleware/authMiddleware"
import authorizeMiddleware from "../../middleware/authorizeMiddleware"


const router = Router();

router.route('/').get(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),user.getAllUsers)
router.route('/search-user').get(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole("SUPER_ADMIN",req,res,next),user.SuperAdminCreateUser)
router.route('/search-user').get(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),user.searchUserByEmailOrUsername)

router.route('/:id').get(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),user.findUser).put(middleware.verifyToken,user.updateUserRecord).post(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole("SUPER_ADMIN",req,res,next),user.lockUserAccountStatus).delete(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole("SUPER_ADMIN",req,res,next),user.deleteUser)



export default router;
