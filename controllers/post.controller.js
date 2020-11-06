const createError = require('http-errors');

const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');
const User = require('../models/user.model');
const Photo = require('../models/photo.model');

module.exports.test = (req, res) => {
    res.json({'message': 'holaaaaaa'});
}

module.exports.index = (req, res, next) => {

    Match.find({
        $or: [{
            users: {
                $in: [req.currentUser.id]
            },
            status: 'accepted'
        }]
    })
    .then(matches => {
        const matchIds = matches.reduce((acc, cur) => {
            if (!acc.includes(cur.users[0])) acc.push(cur.users[0])
            if (!acc.includes(cur.users[1])) acc.push(cur.users[1])
            return acc
        }, []);

        Post.find().where('user').in(matchIds)
                .sort({
                    createdAt: -1
                })
                .populate('user')
                .populate('likes')
                .populate({
                    path: 'comments',
                    options: {
                        sort: {
                            createdAt: 1
                        }
                    },
                    populate: 'user'
                })
                .then(posts => {

                    res.status(200).json(posts)
                })
                .catch(next)
    })
    .catch(next)
}


module.exports.show = (req, res, next) => {
    Post.findById( req.params.id )
        .then( post => {
            if (!post) {
                throw createError(404, 'post not found')
            } else {
                res.json(post)
            }
        }) 
        .catch(next)
}


module.exports.create = (req, res, next) => {
    const { body } = req.body ? req.body : "";
    const image = req.file ? req.file.path : undefined;
    const userId = req.session.user.id;

    if (!body) throw createError(400, 'Post text is mandatory');

    if (image) {
        const photo = new Photo({
            user: userId,
            photo: image
        })

        photo.save()
            .then(ph => console.log(ph))
    }

    const post = new Post({ body, image, user: userId })

    post.save()
        .then( p => res.status(201).json(p) )
        .catch(next)

}


module.exports.update = (req, res, next) => {

    Post.findById( req.params.id )
        .then( p => {

            if (p.user.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own posts')

            const { body } = req.body;

            if (req.file) {
                params.image = req.file.path;
            } 

            if (body) {
                Post.findByIdAndUpdate( req.params.id, { body }, {
                    runValidators: true,
                    new: true
                })
                    .then( m => res.status(200).json(m))
                    .catch(next)
            }
        })
}


module.exports.delete = (req, res, next) => {

    Promise.all([
        Photo.findOneAndDelete({'photo': req.body.body}),
        Comment.deleteMany({ 'post': req.params.id }),
        Like.deleteMany({ 'post': req.params.id }),
        Post.findByIdAndDelete( req.params.id )
    ])
        .then(() => res.status(204).json())
        .catch(next)
}


module.exports.addComment = (req, res, next) => {
    const text = req.body.body;
    const user = req.session.user.id;
    const post = req.params.id;

    if (!text) throw createError(400, 'text missing')

    const comment = new Comment({ text, user, post })

    comment.save()
        .then( c => {
            res.status(201).json(comment) 
        })
        .catch(next)
}


module.exports.updateComment = (req, res, next) => {

    Comment.findById(req.params.id)
        .then( c => {
            const text = req.body.body;

            if (c.user.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own comments')

            Comment.findByIdAndUpdate( req.params.id, { text }, {
                runValidators: true,
                new: true
            })
                .then( c => res.status(200).json(c))
                .catch(next)


        })
        .catch(next)

}


module.exports.deleteComment = (req, res, next) => {

    Comment.findById(req.params.id)
    .then( c => {
        const text = '...comment cancelled';
        
        if (c.user.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own comments')

        Comment.findByIdAndUpdate( req.params.id, { text }, {
            runValidators: true,
            new: true
        })
            .then( c => res.status(200).json(c))
            .catch(next)


    })
    .catch(next)
}


module.exports.like = (req, res, next) => {
    const params = {
        user: req.session.user.id,
        post: req.params.id
    };

    Like.find(params)
        .then(like => {
            if (like.length === 0) {
                const like = new Like(params)
                like.save()
                    .then(() => res.status(201).json({ likes: 1}))
                    .catch(next)
            } else {
                Like.deleteMany(params)
                    .then(() => res.status(200).json({ likes: -1 }))
                    .catch(next)
            }
        })
        .catch(next)
}
