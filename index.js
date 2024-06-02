const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

passport.use(new DiscordStrategy({
    clientID: '1246850791852081244',
    clientSecret: 'QicffHVTL4E9P19Wg3KPu-UT_FoMu4ie',
    callbackURL: 'http://localhost:3000/auth/discord/callback',
    scope: ['identify', 'guilds']
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(() => done(null, profile));
}));

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', passport.authenticate('discord'));

app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

app.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/user-data', ensureAuthenticated, (req, res) => {
    res.json({
        username: req.user.username,
        guilds: req.user.guilds
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/');
}

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
