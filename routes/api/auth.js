const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const User = require('../../models/User')
const jwt = require('jsonwebtoken');
const {check ,validationResult} = require('express-validator');
const config = require('config');
const bcrypt = require('bcryptjs');


//@route GET api/auth
//@desc auth route
//@acsses Public
router.get('/',auth, async (req,res)=>{
    try{
        const user= await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');

    };
});

//@route POST api/users
//@desc Authnticate user & get token
//@acsses Public
router.post('/',[
check('email','include a vaild email adress').isEmail(),
check('password','password is required').exists()],
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;

    try{
        let user = await User.findOne({email});

        if(!user){
            return res.status(400).json({errors:[{msg:'No such user'}]});
        }

        const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.status(400).json({errors:[{msg:'No such user'}]});
            //didnt write msg that passwords is wrong because this way a hacker can know that
            //such a user exits!
        }

        

        //return jwtoken//return jwtoken//return jwtoken
        const payload = {
            user:{
                id:user.id
            }
        };

        jwt.sign(payload,
            config.get('jwtSecret'),{
                expiresIn:3600
            },(err,token)=>{
                if(err) throw err;
                console.log(token);
                res.json({token});
            });



        //return jwtoken//return jwtoken//return jwtoken//return jwtoken



        res.send('User Reg');
    }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
    }



});



module.exports = router;