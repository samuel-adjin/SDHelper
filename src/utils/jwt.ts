// import jwt from 'jsonwebtoken';

// const generateTokens = async  (username:String,email:String,role:String, expires:number,jwt_Secret:String)=>{
//     const access_token =  jwt.sign({username,email,role},jwt_Secret,{expiresIn:process.env.ACCESS_EXPIRES})
//     const refresh_token = jwt.sign({username,email,role},process.env.REFRESH_TOKEN!,{expiresIn:process.env.REFRESH_EXPIRES})
//     return {access_token,refresh_token}
// }

// export default generateTokens;