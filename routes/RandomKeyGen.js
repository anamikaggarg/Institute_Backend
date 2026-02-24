const express = require('express');
const app = express();

const crypto = require('crypto');

const apiKeyauth = async(req,res,next)=>{
    const key = req.header["x-api-key"];
     if(!key){
        return res.status(200).json({message: "API Key missing"});
     }

     const validKey = await ApikeyModel.findOne({key:hashed});
     if(!validKey){
        return res.status(403).json({message:"Invalid Api key"});
     }
     next();


}

