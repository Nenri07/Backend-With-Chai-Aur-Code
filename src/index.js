
import connDb from './db/db.js'
import dotenv from "dotenv"

dotenv.config({
    path:'./env'
})

connDb()








// import mongoose from "mongoose";

// import {db} from './constants'

// ;(async ()=>{
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${db}`)
        
//     } catch (error) {
//         console.log(error);
//         throw error;
//     }

// })()