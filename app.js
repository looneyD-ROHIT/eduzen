/**
 * app for initiating the server
 */

const express = require("express");
const requestIp = require('request-ip');
const path = require("path");
const fs = require("fs");
const { json } = require("express");
const router = require('./routes/routes');
const app = express();
const PORT = process.env.PORT || 80;
const hostname = "localhost";
let clientIp = "42.105.2.229";
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
 
// express related settings
app.use('/static', express.static('static')); // For serving static files
app.use(express.urlencoded());
app.use(express.json());
 
// template engine
 // pug related settings
//  app.set('view engine', 'pug'); // Set the template engine as pug
//  app.set('views', path.join(__dirname, 'src')); // Set the views(or source) directory

 
app.use('/',router);

// starting server
app.listen(PORT, ()=>{
    console.log(`The application started successfully on port ${PORT}`);
});
