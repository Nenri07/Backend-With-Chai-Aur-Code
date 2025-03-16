
import connDb from './db/db.js'
import dotenv from "dotenv"

dotenv.config({
    path:'./env'
})

connDb().then(()=>{
    app.listen(process.env.PORT || 7200 ,()=>{
        console.log(`port on which server running is ${process.env.PORT?process.env.PORT:7200}`);  
    }
    )
})
.catch((error)=>{
    console.log(`server persistr an error ${error}`);
    
})








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