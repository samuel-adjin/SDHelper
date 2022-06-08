import express,{Application,Request,Response,urlencoded}  from "express";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from 'dotenv';
import AuthRoute from '../src/route/Auth/auth'
import UserRoute from '../src/route/User/user'
import CourseRoute from '../src/route/Course/course'
import ProgramRoute from '../src/route/Program/program'


dotenv.config();
const app:Application = express();
app.use(helmet())
app.use(morgan('combined'))
app.use(urlencoded({ extended: false }));
app.use(express.json())
// healthCheck
app.get('/health',(req:Request,res:Response)=>{
    res.status(200).json("Application health is good");
})

app.use('/v1/auth',AuthRoute)
app.use('/v1/user',UserRoute)
app.use('/v1/course',CourseRoute)
app.use('/v1/program',ProgramRoute)






export default app;