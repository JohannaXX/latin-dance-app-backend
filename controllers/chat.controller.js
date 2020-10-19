const createError = require('http-errors');

const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const Match = require('../models/match.model')

module.exports.index = (req, res, next) => {
    Chat.find({ 'members': { $in: [req.session.user.id] }}) 
        .populate({path: "members", match: {'_id': {$ne: req.session.user.id}}})
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
        .populate({
            path: 'messages',
            options: {
                sort: {
                    createdAt: -1
                }
            },
            populate: 'sender'
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


module.exports.delete = (req, res, next) => {
    Promise.all([
        Message.deleteMany({ 'chat': req.params.id }),
        Chat.findByIdAndDelete( req.params.id )
    ])
        .then(() => {
            res.status(204).json();
        })
        .catch(next)
}

