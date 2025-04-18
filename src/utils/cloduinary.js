import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'



    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_CLOUD_API, 
        api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
    });

    const uploadOnCloudinary= async (localFilePath)=>{
        try {
            if(!localFilePath) return null

            //uploading on cloudinary
            const response = await cloudinary.uploader.upload(localFilePath,{
                resource_type:"auto"
            })

            // console.log('file uploaded successfuly', response.url);

            fs.unlinkSync(localFilePath)
            return response
            
            
        } catch (error) {
            fs.unlinkSync(localFilePath)
            //remove the uploadef file as failed the process 
            return null
            
        }

    }
    
    export {uploadOnCloudinary}
    