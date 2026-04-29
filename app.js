const express = require('express');
const os = require('os');
const path = require('path');
const serveStatic = require('serve-static');
const photosRouter = require('./routes/photos');
const indexRouter = require('./routes/index');
const apiPhotosRouter = require('./routes/api/api-photos');
const authRouter = require('./routes/auth');
const session = require('express-session');
const passport = require('passport');
const configurePassport = require('./services/passport');
const app = express();
const PORT = 3000;  
const vueHost = (process.env.VUE_HOST ?? 'http://localhost:5173').replace(/\/$/, '');

// connect to MongoDB using Mongoose
const mongoose = require('mongoose');      
// mongoose.connect('mongodb+srv://<db_username>:<db_password>@cluster0.njksd.mongodb.net/cscie31?appName=Cluster0')
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.njksd.mongodb.net/cscie31?appName=Cluster0`)
 .then(()=>console.log('Connected to MongoDB...'))
 .catch(err => {
    console.error('Could not connect to MongoDB...', err);
    process.exit(1);
    });   

// Require the cloudinary library
const cloudinary = require('cloudinary').v2;
// Return "https" URLs by setting secure: true
cloudinary.config({
  secure: true,
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// Log the cloudinary configuration
console.log(cloudinary.config());

// Session middleware adds req.session so route handlers can persist
// small per-user state across requests (via cookie + server-side session store).
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

configurePassport(passport);

app.use(passport.initialize());
app.use(passport.session());

// Parse URL-encoded form submissions (application/x-www-form-urlencoded)
// and place parsed values on req.body.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Centralized CORS config for browser-based Vue client.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && origin === vueHost) {
    res.set('Access-Control-Allow-Origin', origin);
  }

  res.set({
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

// Configure where template files live and which template engine to use.
// res.render('name') will look in /views and render with EJS.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Load sample data once at startup and expose it to all templates
// through app.locals (available in every rendered view).
const data = require('./data');
app.locals.photos = data.photos;

// Make authenticated user available in all rendered views.
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  next();
});

// Route order matters in Express:
// 1) Mount app routers first for dynamic routes.
// 2) Then serve static files from /public for matching paths.
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/photos', photosRouter);
app.use('/api/photos', apiPhotosRouter);

app.use(serveStatic(path.join(__dirname, 'public'))); 

// Final catch-all 404 handler for any request not handled above.
app.use( (req, res) => {
  res.status(404).send('Sorry - I don\'t have that');
});

// Export app for server startup (and easier testing).
module.exports = app;