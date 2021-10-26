const express = require('express');
const connectdb = require('./config/db');
const app =express();


//connect db
connectdb();

//init middleware
app.use(express.json({extended:false}));

app.get('/',(req,res)=>{
    res.send('api running');
})

//define routes
app.use('/api/users',require('./routes/api/users'));
app.use('/api/auth',require('./routes/api/auth'));
app.use('/api/profile',require('./routes/api/profile'));
app.use('/api/posts',require('./routes/api/posts'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`server statrted on port ${PORT}`);
});