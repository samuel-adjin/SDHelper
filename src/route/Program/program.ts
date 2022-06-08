import {Router} from  'express';
import program from '../../controller/Program/program';
import middleware from '../../middleware/authMiddleware'


const router = Router();

router.route('/').get(program.showAllPrograms).post(program.AddNewProgram);
router.route('/filter').get(program.searchProgram);
router.route('/:id').get(program.getProgram).post(program.AddNewProgram).delete(program.deleteProgram).put(program.updateProgram);

export default router;


