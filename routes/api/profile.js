const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const Profile = require('../../models/Profile');
const User = require('../../models/User');
const {check,validationResult} = require('express-validator');

const config = require('config');
const request = require('request');

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

    const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
    }= req.body;

    const profileFields={};

    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills){
        profileFields.skills = skills.split(',').map(skill=>skill.trim());
    }

    //build social object
    profileFields.social={}

    if(youtube) profileFields.social.youtube= youtube;
    if(twitter) profileFields.social.twitter=twitter;
    if(facebook) profileFields.social.facebook=facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram;



    try{
        let profile=await Profile.findOne({user:req.user.id});

        if(profile){
            //update
            profile = await Profile.findOneAndUpdate({user:req.user.id},{$set:
            profileFields},{
                new:true
            });
            
            return res.json(profile);
        }

        //create

        profile = new Profile(profileFields);

        await profile.save();
        res.json(profile);



    }catch(err){
        console.error(err)
        res.status(500).send('Server Error')
    }
    res.send('hello');


}





);


//@route GET api/profile/
//@desc gel all profiels
//@acsses Public

router.get('/',async (req,res)=>{
    try {
        const profiles = await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
})

//@route GET api/profile/user/:user_id
//@desc get a spesific profile
//@acsses Public
router.get('/user/:user_id',async (req,res)=>{
    try {
        const profile = await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg:"Profile not found"});
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg:"Profile not found"});
        }
        res.status(500).send('server error');
        
    }
})

//@route DELETE api/profile/
//@desc delete profile,user & posts
//@acsses Private
router.delete('/',auth ,async (req,res)=>{
    try {
        // @todo -remove users posts
        //remove profile
        await Profile.findOneAndRemove({user:req.user.id});
        //remove user
        await User.findOneAndRemove({_id:req.user.id});
        res.json({msg:'user removed'});
    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
})

//@route PUT api/profile/experience
//@desc add profile experience
//@acsses Private
router.put('/experience',[auth,[
    check('title','title required').not().isEmpty(),
    check('company','company required').not().isEmpty(),
    check('from','from date is required').not().isEmpty()
]] ,async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        descreption
    }= req.body;

    const newExp={
        title,
        company,
        location,
        from,
        to,
        current,
        descreption
    }
    
    try {
        const profile = await Profile.findOne({user:req.user.id});

        profile.experience.unshift(newExp);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
})


//@route DELETE api/profile/experience/:exp_id
//@desc delete experience
//@acsses Private
router.delete('/experience/:exp_id',auth ,async (req,res)=>{
    try {
        //remove experience
        const profile = await Profile.findOne({user:req.user.id});
        //remove user

        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);
        await profile.save()
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
})


//@route PUT api/profile/education
//@desc add profile education
//@acsses Private
router.put('/education',[auth,[
    check('school','school required').not().isEmpty(),
    check('degree','degree required').not().isEmpty(),
    check('from','from date is required').not().isEmpty(),
    check('fieldofstudy','field of study required').not().isEmpty(),
]] ,async (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        descreption
    }= req.body;

    const newEdu={
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        descreption
    }
    
    try {
        const profile = await Profile.findOne({user:req.user.id});

        profile.education.unshift(newEdu);
        await profile.save();
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
})


//@route DELETE api/profile/education/:edu_id
//@desc delete education
//@acsses Private
router.delete('/education/:edu_id',auth ,async (req,res)=>{
    try {
        //remove education
        const profile = await Profile.findOne({user:req.user.id});
        //remove education

        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex,1);
        await profile.save()
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('server error');
        
    }
})


//@route GET api/profile/github/:username
//@desc get user repos from github
//@acsses Public
router.get('/github/:username',(req,res)=>{
    try {
        const options={
            uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&
            client_id=${config.get('githubClientId')}&client_secret=${config.get('gitHubSecret')}`,
            method:`GET`,
            headers:{'user-agent':'node.js'}

        };

        request(options,(error,response,body)=>{
            if(error){
                console.error(err.message);
            }
            if(response.statusCode!=200){
                return res.status(404).json({msg:'No github profile found'});

            }
            res.json(JSON.parse(body));
        })


        
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
        
    }
})







module.exports = router;