const express = require('express');
const connectdb = require('./config/db');
const app =express();


//connect db
connectdb();

app.get('/',(req,res)=>{
    res.send('api running');
})

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server statrted on port ${PORT}`);
});