import {Router} from  'express';
import course from '../../controller/Course/course';
import middleware from "../../middleware/authMiddleware";
import authorizeMiddleware from "../../middleware/authorizeMiddleware"

const router = Router();

router.route('/').get(middleware.verifyToken,course.getAllCourse).post(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),course.createCourse);
router.route('/filter').get(middleware.verifyToken,course.SearchCourseByName);
router.route("/update-doc/:id").post(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),course.changeUploadedDoc);
router.route('/file-download/:id').get(middleware.verifyToken,course.downloadFile);
router.route('/:id').get(middleware.verifyToken,course.getACourse).delete(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),course.deleteCourse).patch(middleware.verifyToken,(req,res,next)=> authorizeMiddleware.checkRole(["ADMIN","SUPER_ADMIN"],req,res,next),course.UpdateCourse);

export default router;
