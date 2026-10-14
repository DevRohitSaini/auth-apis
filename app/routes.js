import {Router} from 'express';
import authRouter from './routes/auth.js'
import userRouter from './routes/user.js'

const router = new Router();

router.get('/', (req, res)=>{
    res.send('API is running...')
});

router.use('/auth',authRouter);
router.use('/users',userRouter);

export default router;