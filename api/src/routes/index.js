const express=require('express');const r=express.Router();r.use('/api',require('./v1'));r.use('/webhooks',require('./webhooks'));module.exports=r;
