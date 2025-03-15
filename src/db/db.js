import mongoose from "mongoose";
import {db} from '../constants.js'


const connDb=async ()=>{
    try {
       const connectioInstance= await mongoose.connect(`${process.env.MONGODB_URI}/${db}`)
       console.log(`db is connected with host ${connectioInstance.connection.host}`);
       
    } catch (error) {
        console.log('conntection error in db Failed',error);
        process.exit(1)
        
    }
}
export default connDb