import { Router} from "express";
import * as authController from '../controller/auth.js'

const authRouter = new Router();

authRouter.route('/signup').post(authController.registerUser);
authRouter.route('/signin').post(authController.login);

export default authRouter;