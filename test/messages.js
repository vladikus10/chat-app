const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const io = require('socket.io-client');
const async = require('async');

chai.use(chaiHttp);

const { MESSAGES, ERRORS, EVENTS } = require('../constants');

let user1 = {
    username: 'user1',
    password: 'user1'
};
let user2 = {
    username: 'user2',
    password: 'user2'
};

let newMessage = {};

describe('Messaging', () => {

    before(function (done) {
        this.timeout(6000);

        async.parallel([
            next => {
                chai.request(global.url)
                    .post('/api/users')
                    .send(user1)
                    .then(res => {
                        expect(res).to.have.status(201);

                        chai.request(global.url)
                            .post('/api/session')
                            .send(user1)
                            .then(res => {
                                expect(res).to.have.status(200);

                                user1 = res.body;

                                next();
                            }, error => {
                                next(error);
                            });
                    }, error => {
                        next(error);
                    });
            },
            next => {
                chai.request(global.url)
                    .post('/api/users')
                    .send(user2)
                    .then(res => {
                        expect(res).to.have.status(201);

                        chai.request(global.url)
                            .post('/api/session')
                            .send(user2)
                            .then(res => {
                                expect(res).to.have.status(200);

                                user2 = res.body;

                                next();
                            }, error => {
                                next(error);
                            });
                    }, error => {
                        next(error);
                    });
            }
        ], error => {
            if (error) return done(error);
            done();
        });
    });

    it('Should send a new message', done => {
        const message = {
            recipient_id: user2._id,
            message: 'Hello'
        };

        const io2 = io(`${global.url}?access_token=${user2.access_token}`);

        io2.on(EVENTS.NEW_MESSAGE, receivedMessage => {

            expect(receivedMessage.from).to.equal(user1._id);
            expect(receivedMessage.to).to.equal(user2._id);
            expect(receivedMessage.message).to.equal(message.message);

            newMessage = receivedMessage;

            done();
        });

        io2.on('connect', () => {
            const io1 = io(`${global.url}?access_token=${user1.access_token}`);

            io1.on('connect', () => {

                io1.emit(EVENTS.SEND_MESSAGE, message);
            });
        });
    });

    it('Should return a list of messages with one new message', done => {
        chai.request(global.url)
            .get(`/api/messages/${user1._id}`)
            .set('x-access-token', user2.access_token)
            .then(res => {
                expect(res).to.have.status(200);

                expect(res.body.messages).to.be.an('array');
                expect(res.body.messages[0].message).to.equal(newMessage.message);
                expect(res.body.messages[0].to).to.equal(newMessage.to);
                expect(res.body.messages[0].from).to.equal(newMessage.from);
                expect(res.body.messages[0].timestamp).to.equal(newMessage.timestamp);
                expect(res.body.messages[0].seen).to.equal(newMessage.seen);

                done();
            }, error => {
                done(error);
            });
    });

    it('Should mark the message as seen', done => {
        const io2 = io(`${global.url}?access_token=${user2.access_token}`);

        io2.emit(EVENTS.MARK_SEEN, user1._id, () => {

            chai.request(global.url)
                .get(`/api/messages/${user1._id}`)
                .set('x-access-token', user2.access_token)
                .then(res => {
                    expect(res).to.have.status(200);

                    expect(res.body.messages).to.be.an('array');
                    expect(res.body.messages[0].seen).to.equal(true);

                    done();
                }, error => {
                    done(error);
                });
        });
    });
});