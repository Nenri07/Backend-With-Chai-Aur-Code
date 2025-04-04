import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app=express()

app.use(cors({
    origin:process.env.ORIGIN_ADDRESS,
    credentials:true
}))
//for data we get from in body

app.use(express.json({limit:"20kb"}))

// for data we get from url

app.use(express.urlencoded({extended:true,limit:"20kb"}))

// to save images pdf etc in our server

app.use(express.static('public'))

// to perform crud on cookies

app.use(cookieParser())


///routers importing

import  userRoute  from './routes/user.routes.js'

//routes
//its actually here with middleware
app.use('/api/v1/user',userRoute)

export default app