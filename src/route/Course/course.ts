import {Router} from  'express';
import course from '../../controller/Course/course';
import middleware from '../../middleware/authMiddleware'


const router = Router();

router.route('/').get(course.getAllCourse).post(course.createCourse);
router.route('/filter').get(course.SearchCourseByName);
router.route("/update-doc/:id").post(course.changeUploadedDoc);
router.route('/file-download/:id').get(course.downloadFile);
router.route('/:id').get(course.getACourse).delete(course.deleteCourse).patch(course.UpdateCourse);

export default router;
