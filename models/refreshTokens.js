const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { EXPIRATIONS, SALT_ROUNDS} = require('../constants');

class RefreshToken {
    static generateNewToken(userId, userAgent, ip){
        return new Promise((resolve, reject) => {
            crypto.randomBytes(64, (error, buffer) => {
                if(error) reject(error);
                let token = `${userId}.${buffer.toString('hex')}`;
                bcrypt.hash(token, SALT_ROUNDS, (error, hash) => {
                    if(error) reject(error);
                    let newRefreshToken = {
                        user: userId,
                        user_agent: userAgent,
                        ip: ip,
                        token: hash,
                        expires_at: Date.now() + EXPIRATIONS.REFRESH_TOKEN
                    };
                    this.findOneAndUpdate({user: userId, user_agent: userAgent}, newRefreshToken, {upsert: true})
                        .exec()
                        .then(refreshToken => {
                            resolve(token);
                        }, error => {
                            reject(error);
                        });
                });
            });
        });
    }

    validateToken(token){
        return new Promise((resolve, reject) => {
            bcrypt.compare(token, this.token, (error, isMatch) => {
                if(error) reject(error);
                if(!isMatch) reject(errors.invalid_refresh_token);

                this.expires_at = Date.now() + EXPIRATIONS.REFRESH_TOKEN;
                
                this.save().then(result => {
                    resolve();
                }, error => {
                    reject(error);
                });
            });
        });
    }
}

const refreshTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    user_agent: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expires_at: {
        type: Date,
        required: true
    },
    generated_at: {
        type: Date,
        required: true,
        default: Date.now
    }
});

refreshTokenSchema.loadClass(RefreshToken);

module.exports = {
    model: 'RefreshToken',
    schema: refreshTokenSchema
};