const express = require('express');
const {check ,validationResult} = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Posts');
const Posts = require('../../models/Posts');

//@route POST api/posts
//@desc Create  a post
//@acsses Private
router.post('/',[auth,[
    check('text','Text is requierd').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
    
        const newPost = new Post({
            text:req.body.text,
            name:user.name, 
            avatar:user.avatar,
            user:req.user.id
        });
        
        const post = await newPost.save();
        res.json(post);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('serever error');
        
    }
});

//@route GET api/posts
//@desc get all posts
//@acsses private
router.get('/',auth ,async (req,res)=>{
    try {
        const posts = await Posts.find().sort({date:-1});
        res.json(posts);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('serever error');
        
    }
});

//@route GET api/posts/:id
//@desc get all posts by id of post
//@acsses private
router.get('/:id',auth ,async (req,res)=>{
    try {
        const posts = await Posts.findById(req.params.id);

        if(!posts){
            return res.status(404).json({msg:'posts not found'});
        }
        res.json(posts);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg:'posts not found'});
        }
        res.status(500).send('serever error');
        
    }
});

//@route DELETE api/posts/:id
//@desc delete post by id of post
//@acsses private
router.delete('/:id',auth ,async (req,res)=>{
    try {
        const posts = await Posts.findById(req.params.id);

        if(!posts){
            return res.status(404).json({msg:'Post not found'});
        }


        if(posts.user.toString() !==req.user.id){
            return res.status(401).json({msg:'user not authoraized to delete'});
        }

        await posts.remove();
        res.json({msg:'Post Removed!'});
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg:'posts not found'});
        }
        res.status(500).send('serever error');
        
    }
});

//@route PUT api/posts/like/:id
//@desc like a post
//@acsses private
router.put('/like/:id',auth ,async (req,res)=>{
    try {
        const post = await Posts.findById(req.params.id);
        
        //check if user liked already
        if(post.likes.filter(like=>like.user.toString() === req.user.id).length>0){
            return res.status(400).json({msg:'post already liked'});

        }
        post.likes.unshift({user:req.user.id});

        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('serever error');
        
    }
});

//@route PUT api/posts/unlike/:id
//@desc unlike a post
//@acsses private
router.put('/unlike/:id',auth ,async (req,res)=>{
    try {
        const post = await Posts.findById(req.params.id);
        
        //check if user liked already
        if(post.likes.filter(like=>like.user.toString() === req.user.id).length===0){
            return res.status(400).json({msg:'post hasnt yet been liked'});

        }
        //get remove index
        const removeIndex = post.likes.map(like=>like.user.toString()).indexOf(req.user.id);

        post.likes.splice(removeIndex,1);


        await post.save();
        res.json(post.likes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('serever error');
        
    }
});

//@route POST api/posts/comment/:id
//@desc Create  a comment to post
//@acsses Public
router.post('/comment/:id',[auth,[
    check('text','Text is requierd').not().isEmpty()
]],async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Posts.findById(req.params.id);
        const newComment = {
            text:req.body.text,
            name:user.name, 
            avatar:user.avatar,
            user:req.user.id
        };
        
        post.comments.unshift(newComment)
        await post.save();
        res.json(post.comments);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('serever error');
        
    }
});


//@route DELETE api/posts/comment/:id/:comment_id
//@desc delete a comment on post by id of post and comment id
//@acsses private
router.delete('/comment/:id/:comment_id',auth ,async (req,res)=>{
    try {
        const post = await Posts.findById(req.params.id);
        
        
        //pull out the comment
        const comment = post.comments.find(comment=>comment.id === req.params.comment_id);

        //make sure comment exits
        if(!comment){
            return res.status(404).json({msg:'comment not found'});
        }

        //check user 
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({msg:'User not authorized'});
        }

        if(post.user.toString() !==req.user.id){
            return res.status(401).json({msg:'user not authoraized to delete'});
        }


        //get remove index
        const removeIndex = post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex,1);


        await post.save();

        res.json(post.comments);
        
    } catch (error) {
        console.error(error.message);
        if(error.kind === 'ObjectId'){
            return res.status(404).json({msg:'posts not found'});
        }
        res.status(500).send('serever error');
        
    }
});


module.exports = router;