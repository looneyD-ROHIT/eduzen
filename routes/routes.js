require('dotenv').config();
const express = require('express');
const requestIp = require('request-ip');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const nodemailer = require('nodemailer');
const {google} = require('googleapis');

const CLIENT_ID = `${process.env.CLIENT_ID}`;
const CLIENT_SECRET = `${process.env.CLIENT_SECRET}`;
const REFRESH_TOKEN = `${process.env.REFRESH_TOKEN}`;
const REDIRECT_URI = `${process.env.REDIRECT_URI}`;
const MONGODB_URI = `${process.env.MONGODB_URI}`;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID,CLIENT_SECRET,REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token:`${REFRESH_TOKEN}`});
google.options({ auth: oAuth2Client }); 

async function sendNotification(receiver, message){
    try{
        const accessToken = await oAuth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service : 'gmail',
            auth : {
                type : 'OAUTH2',
                user : `${process.env.USER_EMAIL}`,
                clientId : CLIENT_ID,
                clientSecret : CLIENT_SECRET,
                refreshToken : REFRESH_TOKEN,
                accessToken : accessToken
            }
        });

        const mailOptions = {
            from : 'EDUZEN MAILER <eduzenservices@gmail.com>',
            to : `${receiver}`,
            subject : 'Registration Notification',
            text : `${message}`
        }

        const result = await transport.sendMail(mailOptions);
        return result;
    }catch(e){
        console.log(e);
        return e;
    }
}

const JWT_SECRET = `${process.env.SECRET_TOKEN}`;

const router = express.Router();

router.use(bodyParser.json());

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
	useUnifiedTopology: true,
	})
	.then(() => console.log(`Connection Established!`))
	.catch(err => console.log(`Connection Failed!`));

// importing user schema
const User = require(path.join(__dirname,'../model/model.js'));
// importing newsletter subscriptions schema
const Subs = require(path.join(__dirname,'../model/modelNewsletter.js'));

const presentNow = ['home','about','feedback','join','register','login','newsletter','logout','notes','videos','success','player'];

// default page (homePage) (get)
router.get('/', (req, res)=>{
    // IP and location related stuff
    // clientIp = requestIp.getClientIp(req);
    // let dataToWrite = {};
    // fs.open( path.join(__dirname,'../data.json'),'r+', function (err, fileDescriptor) {
    //     if(!err && fileDescriptor){
    //         try{
    //             dataToWrite = fs.readFileSync(fileDescriptor,{encoding:'utf8', flag:'r'});
    //             console.log(dataToWrite);
    //             dataToWrite = JSON.parse(dataToWrite);
    //             dataToWrite["clientIp"] = clientIp;
    //             dataToWrite["clientIp"] = "42.105.2.229";
    //             console.log(dataToWrite);
    //             fs.writeFileSync('./data.json',JSON.stringify(dataToWrite));
                
    //             fs.close(fileDescriptor,err=>{
    //                 // console.log(err);
    //                 if(!err){
    //                     console.log(false);
    //                 }else{
    //                     console.log('Error closing file!');
    //                 }
    //             });
    //         }catch(e){
    //             console.log('Error writing data to file!');
    //         }
    //     }else{
    //         console.log('Couldn\'t open file!');
    //     }
    // });
    res.status(200).sendFile(path.join(__dirname,'../src/index.html'));
});

// homepage after logging in (get)
router.get('/home', (req,res)=>{
	res.status(200).sendFile(path.join(__dirname,'../src/home.html'));
});

// notes page (get)
router.get('/notes', (req, res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/notes.html'));
});

// join page (get)
router.get('/join', (req, res)=>{

    res.status(200).sendFile(path.join(__dirname,'../src/join.html'));
});

// registration page (get)
router.get('/register',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/register.html'));
});

// login page (get)
router.get('/login',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/login.html'));
});

// logout page (get)
router.get('/logout',(req,res)=>{
    res.status(200)//.sendFile(path.join(__dirname,'../src/login.html'));
	res.end('LoggedOut Successfully!');
});

// newsletter page (get)
router.get('/newsletter',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/newsletter.html'));
});

// success page (get)
router.get('/success',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/success.html'));
});

// videos page (get)
router.get('/videos',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/video.html'));
});

// player page (get)
router.get('/player',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/player.html'));
});

// contact page (get)
// router.get('/contact',(req,res)=>{
//     res.status(200).sendFile(path.join(__dirname,'../src/contact.html'));
// });

// about page (get)
router.get('/about',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/about.html'));
});

// feedback page (get)
router.get('/feedback',(req,res)=>{
    res.status(200).sendFile(path.join(__dirname,'../src/feedback.html'));
});

// blogs page (get)
router.get('/blogs',(req,res)=>{
    // res.status(200).sendFile(path.join(__dirname,'../src/feedback.html'));
	res.status(200).end('404, page not found!');

});

// registration page (post)
router.post('/register', async (req, res) => {
    console.log(req.body);
	const { emailId, username, password: plainTextPassword } = req.body
    
    // checking if email id is valid or not
	if (!emailId || typeof emailId !== 'string') {
        return res.json({ status: 'error', error: 'Invalid emailId' })
	}
    
    // checking if username is valid or not
	if (!username || typeof username !== 'string') {
        return res.json({ status: 'error', error: 'Invalid username' })
	}
    
    // checking if password is valid or not
	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
        return res.json({ status: 'error', error: 'Invalid password' })
	}
    
    // checking if password is of suitable length or not
	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

    // hashing the password with a 10 iterations
	const password = await bcrypt.hash(plainTextPassword, 10)

	try {
        // creating new database entry
		const response = await User.create({
            emailId,
			username,
			password
		})
		console.log('User created successfully: ', response);
		// initial email sent to user
		const receiver = emailId;
		const message = `Hello ${emailId}, we welcome you to our platform, hope you will have an amazing journey ahead!`;
		sendNotification(receiver, message)
		.then(res => console.log('Email sent...',res))
		.catch(err => console.log(err.message));
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'error', error: 'Username/Email ID already in use' })
		}
		throw error;
	}

    // res.sendFile(path.join(__dirname,'../src/home.html'));
	res.json({ status: 'ok' });
});

// newsletter page (post)
router.post('/newsletter', async (req, res) => {
    console.log(req.body);
	const { emailId, firstName, lastName } = req.body
    
    // checking if email id is valid or not
	if (!emailId || typeof emailId !== 'string') {
        return res.json({ status: 'error', error: 'Invalid emailId' })
	}
    
    // checking if username is valid or not
	if (!firstName || typeof firstName !== 'string') {
        return res.json({ status: 'error', error: 'Invalid firstName' })
	}
    
    // checking if password is valid or not
	if (!lastName || typeof lastName !== 'string') {
        return res.json({ status: 'error', error: 'Invalid lastName' })
	}
    
	try {
        // creating new database entry
		const response = await Subs.create({
            emailId,
			firstName,
			lastName
		});
		console.log('User created successfully: ', response)
	} catch (error) {
		if (error.code === 11000) {
			// duplicate key
			return res.json({ status: 'exists' })
		}
		throw error
	}

	// initial email sent to user
	const receiver = emailId;
    const message = `Hello ${emailId}, you are all set up now to receive all interesting upcoming updates from EDUZEN!`;
    sendNotification(receiver, message)
    .then(res => console.log('Email sent...',res))
    .catch(err => console.log(err.message));
	res.json({ status: 'ok' });
});


// login page (post)
router.post('/login', async (req, res) => {
	const { emailId, password } = req.body
	const user = await User.findOne({ emailId }).lean();
    console.log(user);

	if (!user) {
		return res.json({ status: 'error', error: 'User not found!' })
	}

	if (await bcrypt.compare(password, user.password)) {
		// the username, password combination is successful

		const token = jwt.sign(
			{
				id: user._id,
				username: user.username
			},
			JWT_SECRET
		)

		return res.json({ status: 'ok', data: token })
	}

	res.json({ status: 'error', error: 'Invalid username/password' })
});

// forgot password (post) { with JWT authorization }
router.post('/change-password', async (req, res) => {
	const { token, newpassword: plainTextPassword } = req.body

	if (!plainTextPassword || typeof plainTextPassword !== 'string') {
		return res.json({ status: 'error', error: 'Invalid password' })
	}

	if (plainTextPassword.length < 5) {
		return res.json({
			status: 'error',
			error: 'Password too small. Should be atleast 6 characters'
		})
	}

	try {
		const user = jwt.verify(token, JWT_SECRET)

		const _id = user.id

		const password = await bcrypt.hash(plainTextPassword, 10)

		await User.updateOne(
			{ _id },
			{
				$set: { password }
			}
		)
		res.json({ status: 'ok' })
	} catch (error) {
		console.log(error)
		res.json({ status: 'error', error: ';))' })
	}
})

// not found (get)
router.get('/:slug',(req,res)=>{
	// console.log(req.params.slug);
	if(!presentNow.includes(req.params.slug,)){
		res.status(404).sendFile(path.join(__dirname,'../src/notfound.html'));
	}
});

// not found (post)
router.post('/:slug',(req,res)=>{
	// console.log(req.params.slug);
	if(!presentNow.includes(req.params.slug,)){
		// res.status(404).sendFile(path.join(__dirname,'../src/notfound.html'));
		res.status(404).end({"status":"ok","err":"temporarily closed!"});
	}
});

module.exports = router;