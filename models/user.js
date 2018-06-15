const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { EXPIRATIONS, SALT_ROUNDS} = require('../constants');

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select: false
    }
});

userSchema.pre('save', function(next){
    if (!this.isModified('password')) return next();
    bcrypt.hash(this.password, SALT_ROUNDS, (error, hash) => {
        if(error) return next(error);

        this.password = hash;

        next();
    });
});

userSchema.methods.comparePassword = function(password){
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, this.password, (error, isMatch) => {
            if(error) reject(error)

            else resolve(isMatch);
        });
    });
}
  
module.exports = {
    model: 'User',
    schema: userSchema
};