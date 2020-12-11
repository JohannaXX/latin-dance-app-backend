
const passport = require('passport');
const User = require('../models/user.model');

const SlackStrategy = require('passport-slack').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const slack = new SlackStrategy(
    {
        clientID: process.env.SLACK_CLIENT_ID,
        clientSecret: process.env.SLACK_CLIENT_SECRET,
        callbackUrl: "/auth/slack",
    },
    (accessToken, refreshToken, profile, next) => {
        User.findOne({ "social.slack": profile.id })
            .then((user) => {
                if (user) {
                    next(null, user);
                } else {
                    const newUser = new User({
                        name: profile.displayName,
                        email: profile.user.email,
                        avatar: profile.user.image_1024,
                        password: profile.provider + Math.random().toString(36).substring(8),
                        bio: '',
                        city: 'city',
                        country: 'country',
                        social: {
                            slack: profile.id,
                        },
                        activation: {
                            active: true
                        }
                        
                    });

                    newUser
                        .save()
                        .then((user) => {
                            next(null, user);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
    }
);

const google = new GoogleStrategy(
    {
        clientID: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        //callbackURL: "/auth/google/callback"
        callbackURL: "https://latin-dance-app.herokuapp.com/social-google/cb"
    },

    (accessToken, refreshToken, profile, next) => {
        User.findOne({ email: profile.emails[0].value })
            .then(user => {
                if (user) {
                    next(null, user);
                    return;
                } else {

                    const newUser = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        avatar: profile._json.picture,
                        password: profile.provider + Math.random().toString(36).substring(8),
                        city: 'city',
                        country: 'country',
                        social: {
                            google: profile.id,
                        },
                        googleID: profile.id,
                        activation: {
                            active: true
                        }
                    });

                    newUser
                        .save()
                        .then((user) => {
                            next(null, user);
                        })
                        .catch((err) => next(err));
                }

            })
            .catch(err => done(err));
    }
);


passport.use(slack)
passport.use(google)

passport.serializeUser(function (user, next) {
    next(null, user);
});

passport.deserializeUser(function (user, next) {
    next(null, user);
});

module.exports = passport.initialize()

