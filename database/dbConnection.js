const mongoose = require('mongoose')

const connectionString  = process.env.CONNECTIONSTRING

mongoose.connect(connectionString).then(()=>{
    console.log("Connected to Mongo DB Atlas");
    
}).catch(()=>{
    console.log("Error connecting MongoDB Atlas");
    
})