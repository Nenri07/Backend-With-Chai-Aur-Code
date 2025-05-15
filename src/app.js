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
import videoRoute from './routes/video.routes.js'
import tweetRoute from './routes/tweet.routes.js'
import subscriptionRoute from './routes/subscription.routes.js' 
import likeRoute from './routes/like.routes.js'
import commentRoute from './routes/comment.routes.js'

//routes
//its actually here with middleware
app.use('/api/v1/user',userRoute)
app.use("/api/v1/videos", videoRoute)
app.use("/api/v1/tweet", tweetRoute)
app.use("/api/v1/subscription", subscriptionRoute)
app.use("/api/v1/like", likeRoute)
app.use('/api/v1/comment', commentRoute)





export default app