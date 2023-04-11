const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator/check');
const io = require('../socket.js');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;
  try {
    const totalItems = await Post.find().countDocuments()

    const posts = await Post.find()
       .populate('creator')
       .sort({ createdAt: -1})   //sort createdAt in descending way(-1)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)

    res.status(200).json({
      message: 'Fetched posts successfully.',
      posts: posts,
      totalItems: totalItems
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
  // .catch(err => {
  //   if (!err.statusCode) {
  //     err.statusCode = 500;
  //   }
  //   next(err);
  // });
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path.replace("\\" ,"/");
  console.log("ImageURL:  ",imageUrl); 
  const title = req.body.title;
  const content = req.body.content;  //images\8757bfdd-c676-4609-955f-d9170a3278fe-book.png
                                     //images\8757bfdd-c676-4609-955f-d9170a3278fe-book.png

  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  });

  try {
    const result = await post.save() //Or simply we can write 'await post.save()' because result is not used here

    const user = await User.findById(req.userId);

    user.posts.push(post);
    const savedUser = await user.save();
 
    // io.getIO().emit('posts', {   //to send to everyone we use .emit()  ( .broadcast() sends to all users, except the one from which this request was sent)
    //    action: 'create',        //channel/event name is post,action is 'create' and sending 'post' to all connected clients 
    //     post: {
    //       ...post._doc, creator: {
    //         _id: req.userId, name: user.name
    //       }
    //     }
    //   }) 
       
    res.status(201).json({
      message: 'Post created successfully!',
      post: post,  
      creator: {
        _id: user._id,
        name: user.name
      }
    })
    return savedUser;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId).populate('creator')

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: 'Post fetched.',
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, entered data is incorrect.');
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }
  try {
  const post = await Post.findById(postId).populate('creator')

  if (!post) {
    const error = new Error('Could not find post.');
    error.statusCode = 404;
    throw error;
  }
  if (post.creator._id.toString() !== req.userId) {
    const error = new Error('Not authorized!');
    error.statusCode = 403;
    throw error;
  }
  if (imageUrl !== post.imageUrl) {
    clearImage(post.imageUrl);
  }
  post.title = title;
  post.imageUrl = post.imageUrl.replace(/\\/g, "/");;
  post.content = content;

  const result = await post.save()
  io.getIO().emit('posts', { action: 'update', post: result })
    res.status(200).json({
      message: 'Post updated!',
      post: result
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  };
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId)

    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }
    if (post.creator.toString() !== req.userId) {
      const error = new Error('Not authorized!');
      error.statusCode = 403;
      throw error;
    }
    // Check logged in user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();
    io.getIO().emit('posts', { action: 'delete', post: postId})

    await res.status(200).json({
      message: 'Deleted post.'
    })
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};































// const fs = require('fs');
// const path = require('path');
// const { validationResult } = require('express-validator');

// const Post = require('../models/post.js');
// const User = require('../models/user');


// exports.getPosts = (req, res, next) => {
//   const currentPage = req.query.page || 1;
//   const perPage = 2;
//   let totalItems;
//   Post.find()
//        .countDocuments()
//        .then(count => {
//          totalItems = count;
//          return Post.find() 
//                      .skip((currentPage - 1) * perPage) 
//                      .limit(perPage);     
//        })
//        .then(posts => {
//         res.status(200).json({ message: 'Fetched Posts Successfully!', posts: posts, totalItems: totalItems})
//        })
//        .catch(err => {
//         if(err.statusCode){
//           err.statusCode = 500;
//         }
//         next(err);
//        })

//   // res.status(200).json({
//   //   posts: [{
//   //     _id: '1',
//   //     title: 'First Post',
//   //     content: 'This is the first post!',
//   //     imageUrl: 'images\iphone.jpg',
//   //     creator: {
//   //       name: 'Ramesh'
//   //     },
//   //     createdAt: new Date()
//   //   }]
//   // });
// };

// exports.createPost = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error('Validation Failed, Entered data is incorrect!');
//     error.statusCode = 422;
//     throw error;
//   }
//   if(!req.file){
//     const error = new Error('No image provided.!');
//     error.statusCode = 422;
//     throw error;
//   }
//   const imageUrl = req.file.path.replace("\\" ,"/");

//   const title = req.body.title;
//   const content = req.body.content;
//   const post = new Post({
//     title: title,
//     content: content,
//     imageUrl: imageUrl,
//     creator: { name: 'Ramesh' }
//   })
//   post.save()
//     .then(result => {
//       console.log(result);
//       res.status(201).json({
//         message: 'Post created successfully!',
//         post: result
//       });
//     })
//     .catch(err => {
//       if(!err.statusCode){
//         err.statusCode = 500;
//       }
//       next(err);
//     })
// };


// exports.getPost = (req, res, next) => {
//   const postId = req.params.postId;
//   Post.findById(postId)
//      .then(post => {
//       if(!post){
//         const error = new Error('Post not found!');
//         error.statusCode = 404;
//         throw error;
//       }

//       res.status(200).json({message: 'Post fetched..!', post: post})
//      })
//      .catch(err => {
//       if(!err.statusCode){
//         err.statusCode = 500;
//       }
//       next(err);
//      })   
// }

// exports.updatePost = (req, res, next) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     const error = new Error('Validation Failed, Entered data is incorrect!');
//     error.statusCode = 422;
//     throw error;
//   }
//   const postId = req.params.postId;
//   const title = req.body.title;
//   const content = req.body.content;
//   let imageUrl = req.body.image;
//   if(req.file){
//     imageUrl = req.file.path.replace("\\" ,"/");
//   }
//   if(!imageUrl){
//     const error = new Error('No file Picked');
//     error.statusCode = 422;
//     throw error;
//   }

//   Post.findById(postId)
//        .then(post => {
//          if(!post){
//           const error = new Error('Post not found!');
//           error.statusCode = 404;
//           throw error;
//          }
//          if(imageUrl !== post.imageUrl){
//           clearImage(post.imageUrl);
//          }

//          post.title = title;
//          post.imageUrl = imageUrl;
//          post.content = content
//          return post.save(); 
//        })
//        .then(result => {
//         res.status(200).json({ message: 'Post Updated Successfully..!!', post: result })
//        })
//        .catch(err => {
//         if(!err.statusCode){
//           err.statusCode = 500;
//         }
//         next(err);
//        })  
// }

// exports.deletePost = (req, res, next) => {
//   const postId = req.params.postId;
//   Post.findById(postId)   //not used finByIdAndRemove() because in future we will check for existing user by using findById() method 
//     .then(post => {
//       if(!post){
//         const error = new Error('Post not found!');
//         error.statusCode = 404;
//         throw error;
//        }

//       clearImage(post.imageUrl);
//       return Post.findByIdAndRemove(postId);
//     })
//     .then(result => {
//       console.log(result);
//       res.status(200).json({message: "Post Deleted Successfully..!!"})
//     })
//     .catch(err => {
//       if(!err.statusCode){
//         err.statusCode = 500;
//       }
//       next(err);
//     })
// }


// const clearImage = filepath => {   //helper function
//   filepath = path.join(__dirname, '..' , filepath);
//   fs.unlink(filepath, err => console.log(err))
// }