const createError = require('http-errors');
const passport = require('passport');
const axios = require('axios');

const User = require('../models/user.model');
const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');
const nodemailer = require('../config/nodemailer.config');


module.exports.loginWithSlack = (req, res, next) => {
    const passportSlackController = passport.authenticate('slack', (error, user) => {
        if (error) {
            next(error)
        } else {
            req.session.user = user;
            res.json(user)
        }
    })

    passportSlackController(req, res, next);
}


module.exports.loginWithGmail = (req, res, next) => {
    console.log('AAAA')
    console.log(req.body)
    console.log(req.params)
    const passportGoogleLogin = passport.authenticate('google', {
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ]
    })
    passportGoogleLogin(req, res, next)
}


module.exports.getLoginWithGmail = (req, res, next) => {
    console.log('BBBB')
    console.log(req.body)
    console.log(req.params)

    const passportGoogleController = passport.authenticate('google', {
        scope: ['profile', 'email']
    }, (error, user) => {
        if (error) {
            next(error);
        } else {
            req.session.user = user;  
            res.json(user);
        }
    })
    passportGoogleController(req, res, next)
}

module.exports.loginWithFacebook = (req, res, next) => {
   const fbUser = req.body;

   User.findOne({ "email": fbUser.email })
            .then((user) => {
                if (user) {
                    req.session.user = user;  
                    res.json(user);
                } else {
                    const newUser = new User({
                        name: fbUser.name,
                        email: fbUser.email,
                        avatar: fbUser.picture.data.url,
                        password: fbUser.expiresIn + Math.random().toString(36).substring(7),
                        bio: '',
                        city: 'city',
                        country: 'country',
                        social: {
                            facebook: fbUser.id,
                        },
                        activation: {
                            active: true
                        }
                    });

                    newUser
                        .save()
                        .then((u) => {
                            console.log(u)
                            req.session.user = u;  
                            res.json(user);
                        })
                        .catch((err) => next(err));
                }
            })
            .catch((err) => next(err));
}


module.exports.doLogin = (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw createError(400, 'missing credentials');
    }

    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                throw createError(404, 'user not found');
            } else {
                return user.checkPassword(password)
                    .then(match => {
                        if (match) {
                            if (user.activation.active) {
                                req.session.user = user;
                                res.status(200).json(user)
                            } else {
                                throw createError(400, 'account not activated');
                            }
                        } else {
                            throw createError(400, 'user not found');
                        }
                    })
            }
        })
        .catch(next);
}


module.exports.logout = (req, res, next) => {
    req.session.destroy();
    res.status(204).json();
    console.log(req.session)
}


module.exports.create = (req, res, next) => {
    const params = JSON.parse(req.body.body);

    if (req.file) {
        params.avatar = req.file.path
    };

    const user = new User(params)
    
    user.save()
        .then( u => {
            nodemailer.sendValidationEmail(u.email, u.activation.token, u.name);
            res.status(201).json({ message: 'Please check your e-mail for actvation'})
        })
        .catch(next)

}

module.exports.activation = (req, res, next) => {
    console.log('ACTIVATION')
    User.findOne({ "activation.token": req.params.token })
        .then(user => {
            if (user) {
                user.activation.active = true;
                user.save()
                    .then(() => {
                        res.status(200).json({
                            message: 'Your account has been activated. You can log in now.'
                        })
                    })
                    .catch(next)
            } else {
                res.status(400).json({ message: 'Invalid link' })
            }
        })
        .catch(next)
}


module.exports.update = (req, res, next) => {
    const data = JSON.parse(req.body.body);

    if (data.id.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own profile')

    const params = {
        name: data.name,
        bio: data.bio,
        city: data.city,
        country: data.country,
        style: data.danceStyles
    }

    if (req.file) {
        params.avatar = req.file.path
    };

    User.findByIdAndUpdate( req.session.user.id, params, {
            runValidators: true,
            new: true
        })
        .then( u => {
            //console.log(u)
            res.status(200).json(u)
        })
        .catch(err => next(err))
}


module.exports.delete = (req, res, next) => {
    const userId = req.session.user.id;

    if (req.params.id === userId) {
        Promise.all([
            Comment.deleteMany({ 'user': userId }),
            Like.deleteMany({ 'user': userId }),
            Post.deleteMany({ 'user': userId }),
            User.findByIdAndDelete( userId )
        ])
            .then(() => {
                req.session.destroy();
                res.status(204).json();
            })
            .catch(next)
    }
}


module.exports.profile = (req, res, next) => {
    User.findById( req.params.id )
        .populate({
            path: 'photos',
            options: {
                sort: {
                    createdAt: -1
                }
            }
        })
        .populate({
            path: 'posts',
            populate: ['likes', 'user']
        })
        .populate({
            path: 'posts',
            options: {
                sort: {
                    createdAt: -1
                }
            },
            populate: {
              path: 'comments',
              populate: {
                path: 'user',
              }
            }
          })
        .then( user => {
            if (!user) {
                throw createError(404, 'user not found')
            } else {
                res.json(user)
            }
        }) 
        .catch(next)
}


module.exports.network = (req, res, next) => {
    User.findById(req.currentUser.id)
        .then( me => {

            Match.find({ 'users': { $in: [req.currentUser.id] } })
                .populate({path: 'users', match: {'_id': {$ne: req.session.user.id}}})
                .then(matches => {

                    const matchIds = matches.reduce((acc, cur) => {
                        acc.push(cur.users[0], cur.users[1])
                        return acc
                    }, []);

                    User.find().where('_id').nin([ ...matchIds, req.currentUser.id ])
                        .sort({
                            createdAt: -1
                        })
                        .populate('matches')
                        .then(users => {

                            const cityMatches = [];
                            const countryMatches = [];
                            const rest = [];

                            users.forEach( u => {
                                if ( u.style.some( d => me.style.includes(d))) {
                                    if (u.city === me.city) {
                                        cityMatches.push(u)
                                    } else if (u.country === me.country) {
                                        countryMatches.push(u)
                                    } else {
                                        rest.push(u)
                                    }
                                }
                            })

                            const orderedUsers = [ ...cityMatches, ...countryMatches, ...rest];
                            console.log( orderedUsers ) 
                            res.status(200).json({ orderedUsers })
                        })
                        .catch(next)
                })
                .catch(next)
        })
        .catch(next)
    
}


module.exports.contacts = (req, res, next) => {
    Match.find({
        $or: [{
                users: {
                    $in: [req.currentUser.id]
                },
                status: 'accepted'
            },
            {
                users: {
                    $in: [req.currentUser.id]
                },
                status: {
                    $eq: 'pending'
                },
                requester: {
                    $ne: req.currentUser.id
                }
            }
        ]
    })
    .populate('users')
    .sort([['status', -1]])
    .then(matches => {
        const users = matches.map(m => {
            return {
                user: m.users.find(e => e._id.toString() !== req.currentUser.id.toString()),
                showAcceptBtn: m.status === 'pending',
                match: m._id
            }
        })
        res.status(200).json(users)
    })
    .catch(err => next(err))
}


module.exports.createMatch = (req, res, next) => {
    const match = new Match({
        users: [req.session.user.id, req.body.id],
        status: 'pending',
        requester: req.session.user.id
    })
    
    match.save()
        .then( m => res.status(200).json(m))
        .catch(next)
}


module.exports.updateMatch = (req, res, next) => {
    Match.findByIdAndUpdate( req.params.id, { status: req.body.status }, {
        runValidators: true,
        new: true
    })
        .then( m => res.status(200).json(m))
        .catch(next)
}
