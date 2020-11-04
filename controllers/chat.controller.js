const createError = require('http-errors');

const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const Match = require('../models/match.model')

module.exports.index = (req, res, next) => {
    const { limit } = req.query;

    Chat.find({ 'members': { $in: [req.session.user.id] }}, null, {...(limit? {limit: Number(limit)} : {})}) 
        .populate({path: "members", match: {'_id': {$ne: req.session.user.id}}})
        .populate({
            path: 'messages',
            options: {
                limit: 2,
                sort: { createdAt: -1},
                skip: req.params.pageIndex*2
            },
            limit: 1
        })
        .then( chats => {

            const userIdsWithActiveChats = [];
            chats.forEach( c => userIdsWithActiveChats.push(c.members[0]._id))
          
            Match.find({'users': { $in: [req.session.user.id]}, status: 'accepted'}).where('users').nin(userIdsWithActiveChats)
                .populate({path: 'users', match: {'_id': {$ne: req.session.user.id}}})
                .then( matches => {
                    res.status(200).json({chats, matchesWithoutActiveChat: matches})
                }) 
        })
        .catch(err => next(err))
}


module.exports.show = (req, res, next) => {
    Chat.findById( req.params.id )
        .populate({path: "members", match: {'_id': {$ne: req.session.user.id}}})
        .populate({
            path: 'messages',
            options: {
                sort: {
                    createdAt: -1
                }
            }
        })
        .then( chat => {
            if (!chat) {
                throw createError(404, 'chat not found')
            } else {
                res.json(chat)
            }
        }) 
        .catch(next)
}


module.exports.create = (req, res, next) => {
    const { members } = req.body;
    const chat = new Chat({ members: members})

    chat.save()
        .then(c => res.status(201).json(c))
        .catch(next)
}


module.exports.addMessage = (req, res, next) => {
    const chatId = req.params.id;
    const userId = req.session.user.id;
    const text = req.body.message;

    if (!chatId) throw createError(400, 'chat ID missing')

    if (!text) throw createError(400, 'mandatory text is missing')

    Chat.findById( chatId )
        .then( c => {
            if (!c.members.includes(userId)) {
                throw createError(403, 'user not authorized')
            } else {
                const message = new Message({
                    message: text,
                    sender: userId,
                    chat: chatId,
                    status: 'unread'
                })
            
                message.save()
                    .then( m => res.status(201).json(m))
                    .catch(next)
            }
        })
        .catch(next)
}

module.exports.updateMessage = (req, res, next) => {
    Message.findById( req.params.id )
        .then( m => {

            if (m.sender.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own posts')

            const message = req.body.message + ' (edited)';

            if (message) {
                Message.findByIdAndUpdate( req.params.id, { message }, {
                    runValidators: true,
                    new: true
                })
                    .then( m => res.status(200).json(m))
                    .catch(next)
            }
        })
}


module.exports.deleteMessage = (req, res, next) => {
    Message.findById( req.params.id )
        .then( m => {

            if (m.sender.toString() !== req.session.user.id) throw createError(403, 'you can only edit your own posts')

            const message = '...(message cancelled)';

            if (message) {
                Message.findByIdAndUpdate( req.params.id, { message }, {
                    runValidators: true,
                    new: true
                })
                    .then( m => res.status(204).json(m))
                    .catch(next)
            }
        })
}

