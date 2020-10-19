const createError = require('http-errors');

const Post = require('../models/post.model');
const Comment = require('../models/comment.model');
const Like = require('../models/like.model');
const Match = require('../models/match.model');

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
                .populate('comments')
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
    const { body, image} = req.body ? req.body : "";
    const userId = req.session.user.id;

    if (!body) throw createError(400, 'Post text is mandatory')

    const post = new Post({ body, image, user: userId })

    post.save()
        .then( p => res.status(201).json(p) )
        .catch(next)

}


module.exports.edit = (req, res, next) => {}


module.exports.update = (req, res, next) => {
    Post.findById( req.params.id )
        .then( p => {
            if (p.user !== req.session.user.id) throw createError(403, 'you can only edit your own posts')

            const params  = {};
            if (req.body.body) params.body = req.body.body
            if (req.body.image) params.image = req.body.image

            if (params) {
                Post.findByIdAndUpdate( req.params.id, params, {
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
        Comment.deleteMany({ 'post': req.params.id }),
        Like.deleteMany({ 'post': req.params.id }),
        Post.findByIdAndDelete( req.params.id )
    ])
        .then(() => res.status(204).json())
        .catch(next)
}


module.exports.deleteComment = (req, res, next) => {
    Comment.findByIdAndDelete( req.params.id )
        .then(() => res.status(204).json()) 
        .catch(next)
}


module.exports.addComment = (req, res, next) => {
    const { text } = req.body;
    const user = req.session.user.id;
    const post = req.params.id;

    if (!text) throw createError(400, 'text missing')

    const comment = new Comment({ text, user, post })

    comment.save()
        .then( c => res.status(201).json(c) )
        .catch(next)
}


module.exports.like = (req, res, next) => {

    Like.find({
        user: req.session.user.id, 
        post: req.params.id
    })
        .then(like => {
           //res.json(like)
            Like.deleteMany({ user: req.session.user.id, function(err, res) {
                if (err) {
                    console.log(err)
                } else {
                    res.status(204).json()
                }
            } })

            /* if (!like) {
                const like = new Like(params)

                like.save()
                    .then(l => {
                        console.log(l)
                        res.json({ likes: 1})
                    })
                    .catch(next)
            } else {
                Like.findByIdAndRemove(like._id)
                    .then(() => res.json({ likes: -1 }))
                    .catch(next)
            } */
        })
        .catch(next)
}
