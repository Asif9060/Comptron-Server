import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: "dkv9ksobc",
  api_key: "251951274938992",
  api_secret: "GYaQeJFZFYfKjUVpJunvi3vXqN4",
});

export default cloudinary;