const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check,validationResult} = require('express-validator');


//@route GET api/profile/me
//@desc based on user id get profile 1 profile not many
//@acsses Private
router.get('/me',auth,async (req,res)=>{


    try{
        const profile= await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);

        if(!profile){
            return res.status(400).json({msg:'no prfile to this user'});

        }

        res.json(profile);


    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }




    res.send('Profile Route');
});


//@route POST api/profile/me
//@desc Create or update user profile
//@acsses Private
router.post('/',[auth,[
    check('status','status is required').not().isEmpty(),
    check('skills','skills is required').not().isEmpty()
]],async (req,res)=>{

    const errors= validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

})

module.exports = router;