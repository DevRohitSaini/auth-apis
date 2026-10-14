import { Router} from "express";
import * as userController from '../controller/user.js';
import authenticate from '../middleware/authenticate.js';

const userRouter = new Router();

userRouter.route('/').get(authenticate, userController.users);

export default userRouter;