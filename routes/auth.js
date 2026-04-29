const express = require('express');
const passport = require('passport');

const router = express.Router();
const postLoginRedirectUrl = (process.env.POST_LOGIN_REDIRECT_URL ?? '/').replace(/\/$/, '');
// login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) return res.redirect('/');
  res.render('login', {
    title: 'Login',
    error: req.query.error
  });
});

// redirect user to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google redirects back here
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login?error=1' }),
  (req, res) => {
    console.log('Login successful, redirecting to:', postLoginRedirectUrl);
    res.redirect(postLoginRedirectUrl);
  }
);

// logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(postLoginRedirectUrl);
  });
});

// check current user — useful for the Vue app
router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

module.exports = router;
