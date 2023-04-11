const { validationResult } =require('express-validator/check');
const fs = require('fs');
const path = require('path');
const io = require('../socket');
const Post = require('../models/post')
const User = require('../models/user')
exports.getPosts = async (req,res,next)=>{
  const currentPage = req.query.page || 1;
  const perPage = 2;
   //Counting document for the pagination
  try
  { const totalItems = await Post.find().countDocuments()
  const  posts = await Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
    res.status(200).json({
          message:"Fetched posts successfully",
          posts:posts,
          totalItems:totalItems
        })
  }
  catch (err){
    if(!err.statuCode){
      err.statuCode = 500;
  }
  next(err)
  }
};
exports.createPost = async (req,res,next)=>{
    //validation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed,Entered data is incorrect');
        error.statuCode = 422
        throw error;
    }
    if(!req.file){
        const error = new Error('No image provided');
        error.statuCode = 422
        throw error;
    }
    const imageUrl = req.file.path.replace("\\" ,"/");
   console.log("ImageURL:  ",imageUrl);
    const title= req.body.title;
    const content= req.body.content;
    //inserting post in db:
    //create new post:
    const post = new Post({
        title:title,
        content:content,
        imageUrl:imageUrl,
        creator: req.userId
    });
    try{
    await post.save()
   const user = await User.findById(req.userId);
      console.log(user);
       user.posts.push(post)
    await  user.save();

    io.getIO().emit('posts', {   //to send to everyone we use .emit()  ( .broadcast() sends to all users, except the one from which this request was sent)
      action: 'create',        //channel/event name is post,action is 'create' and sending 'post' to all connected clients 
       post: {
         ...post._doc, creator: {
           _id: req.userId, name: user.name
         }
       }
     }) 

      res.status(201).json({
        message:"Post created Sucessfully!",
        post: post,
        creator:{_id: user._id,name:user.name}
    });
    }
    catch(err)
    {
        if(!err.statuCode){
            err.statuCode = 500;
        }
        next(err);//now error will go to next error handling middleware
 }
};
exports.getPost = async (req,res,next)=>{
    const postId = req.params.postId;
    try
   {
    const post = await  Post.findById(postId)
        if(!post){
            const error = new Error('Could not find Post');
            error.statuCode=404;
            throw error;
        }
        res.status(200).json({message:'Post fetched',post:post});
     }
     catch (err)
     {
          if(!err.statuCode){
            err.statuCode = 500;
        }
        next(err)
     }
}
exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed,Entered data is incorrect");
      error.statuCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    // Check if new file was uploaded
    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
      const error = new Error("No file picked");
      error.statuCode = 422;
      throw error;
    }
  try
  {  const post = await Post.findById(postId)
        if (!post) {
          const error = new Error("Could not find Post");
          error.statuCode = 404;
          throw error;
        }
        if(post.creator.toString() !== req.userId){
          const error = new Error("Not authorized");
          error.statuCode = 403;
          throw error;
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;
 const result = await post.save();
 io.getIO().emit('posts',{action:"update",post:result });
        res.status(200).json({
          message: "Post updated successfully!",
          post: result,
        });
   }
    catch(err)
    {
        if (!err.statuCode) {
          err.statuCode = 500;
        }
        next(err);
    }
  };
exports.deletePost = async (req,res,next) => {
    const postId = req.params.postId;
try
{
  const post= await  Post.findById(postId)
        if (!post) {
            const error = new Error("Could not find Post");
            error.statuCode = 404;
            throw error;
          }
          //checking the authorized user
          if(post.creator.toString() !== req.userId){
            const error = new Error("Not authorized");
            error.statuCode = 403;
            throw error;
          }
        //check logged in users
        clearImage(post.imageUrl);
     await  Post.findByIdAndRemove(postId);
   const user= await User.findById(req.userId);
      console.log(user);
      user.posts.pull(postId);
  await user.save();
      res.status(200).json({
        message: "Post Deleted successfully!",
      });
}
    catch(err){
        if (!err.statuCode) {
            err.statuCode = 500;
          }
          next(err);
    };;
}
const clearImage = filePath =>{
    filePath=path.join(__dirname,'..',filePath);
    fs.unlink(filePath,err=>{console.log(err)});
}