const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
    {
        members: [ 
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            }
        ]
    },
    { timestamps: true }
);

chatSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'chat',
    justOne: false,
});


const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;