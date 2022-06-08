import {Router} from  'express';
import user from '../../controller/User/user';

const router = Router();

router.route('/').get(user.getAllUsers)
router.route('/:id').get(user.findUser).put(user.updateUserRecord).post(user.lockUserAccountStatus).delete(user.deleteUser)
router.route('/search-user').get(user.searchUserByEmailOrUsername)

export default router;
