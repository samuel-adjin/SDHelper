import {Router} from  'express';
import program from '../../controller/Program/program';
import middleware from '../../middleware/authMiddleware';
import authorizeMiddleware from "../../middleware/authorizeMiddleware"



const router = Router();

router.route('/').get(middleware.verifyToken,program.showAllPrograms).post(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),program.AddNewProgram);
router.route('/filter').get(middleware.verifyToken,program.searchProgram);
router.route('/:id').get(middleware.verifyToken,program.getProgram).delete(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),program.deleteProgram).put(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),program.updateProgram);

export default router;


