const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const pagination = require('../mongoosePlugins/pagination');

const messageSchema = new Schema({
    message: {
        type: String,
        required: true
    },
    from: {
        type: ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    to: {
        type: ObjectId,
        required: true,
        ref: 'User',
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    seen: {
        type: Boolean,
        default: false
    }
});

messageSchema.plugin(pagination);
  
module.exports = {
    model: 'Message',
    schema: messageSchema
};