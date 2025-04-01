import mongoose,{Schema} from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const userSchema= Schema(
    {
        username:{
            type:String,
            required:true,
            unique:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
        },
        password:{
            type:String,
            unique:true,
            required:[true,'the password field is required']
        },
        fullname:{
            type:String,
            required:true
        },
        avatar:{
            type:String,
            required:true
        },
        coverImage:{
            type:String,
            required:true
        },
        watchHistory:[{
           type:mongoose.Schema.Types.ObjectId,
           ref:'Video'
        }]
        ,
        refreshToken:{
            type:String
        }
    },
    {timestamps:true}
)

//pre save encryption
userSchema.pre('save',async function(next) {
    if(!this.isModified(password)) return next()

    this.password= await bcrypt.hash(this.password,8)
    next()
    
} )

//check whter password is correct 
userSchema.methods.isPasswordcorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}

//access token logiv
userSchema.methods.AccessToken=function (){
    return jwt.sign({
        _id:this._id,
        email: this.email,
        password:this.password
    }
,process.env.ACESS_TOKEN_SECRET,
{
    expiresIn:ACESS_TOKEN_EXPIRY
})
}

//refresh token logic
userSchema.methods.refreshToken=function (){
    return jwt.sign({
        _id:this._id,
        email: this.email,
        password:this.password
    }
,process.env.REFRESH_TOKEN_SECRET,
{
    expiresIn:REFRESH_TOKEN_EXPIRY
})
}
export const User = mongoose.model('User', userSchema)