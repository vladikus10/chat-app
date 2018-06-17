const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;
const io = require('socket.io-client');

chai.use(chaiHttp);

const { MESSAGES, ERRORS, EVENTS } = require('../constants');

let loggedInUser = {};
let loggedInUser2 = {};

describe('User creation and session control', () => {

    it('Should create a new user "admin"', done => {
        const user = {
            username: 'admin',
            password: 'admin'
        }

        chai.request(global.url)
            .post('/api/users')
            .send(user)
            .then(res => {
                expect(res).to.have.status(201);

                expect(res.body.message).to.equal(MESSAGES.USER_CREATED);

                done();
            }, error => {
                done(error);
            });
    });

    it('Should not allow to create a user with a duplicate username', done => {
        const user = {
            username: 'admin',
            password: 'admin'
        }

        chai.request(global.url)
            .post('/api/users')
            .send(user)
            .then(res => {
                expect(res).to.have.status(400);

                expect(res.body.message).to.equal(ERRORS.DUPLICATE_USERNAME);

                done();
            }, error => {
                done(error);
            });
    });

    it('Should not allow to create a user if the username and passwords are too short', done => {
        const user = {
            username: 'adm',
            password: 'adm'
        }

        chai.request(global.url)
            .post('/api/users')
            .send(user)
            .then(res => {
                expect(res).to.have.status(400);

                expect(res.body.errors[0].field[0]).to.equal('username');
                expect(res.body.errors[1].field[0]).to.equal('password');

                done();
            }, error => {
                done(error);
            });
    });

    it('Should allow you to login with an existing username and password', done => {
        const user = {
            username: 'admin',
            password: 'admin'
        }

        chai.request(global.url)
            .post('/api/session')
            .send(user)
            .then(res => {
                expect(res).to.have.status(200);

                expect(res.body._id).to.be.string;
                expect(res.body.username).to.equal(user.username);
                expect(res.body.access_token).to.be.string;
                expect(res.body.refresh_token).to.be.string;

                loggedInUser = res.body;

                done();
            }, error => {
                done(error);
            });
    });

    it('Should notify the connected user about the creation of a new user', done => {
        const user = {
            username: 'false_admin',
            password: 'admin123'
        };

        const _io = io(`${global.url}?access_token=${loggedInUser.access_token}`);

        _io.on(EVENTS.NEW_USER, newUser => {
            expect(newUser.username).to.equal(user.username);
            expect(newUser._id).to.be.a('string');
            
            _io.close();

            done();
        });

        _io.on('connect', () => {
            chai.request(global.url)
            .post('/api/users')
            .send(user)
            .then(res => {}, error => {
                done(error);
            });
        });
    });

    it('Should login as a different user and retrieve a list of other users (should return only admin)', done => {
        const user = {
            username: 'false_admin',
            password: 'admin123'
        };

        chai.request(global.url)
            .post('/api/session')
            .send(user)
            .then(res => {
                expect(res).to.have.status(200);

                const session = res.body;
                
                chai.request(global.url)
                    .get('/api/users')
                    .set('x-access-token', session.access_token)
                    .then(res => {
                        expect(res).to.have.status(200);
        
                        expect(res.body).to.be.a('array');
                        expect(res.body.length).to.be.greaterThan(1);
                        
                        const index = res.body.findIndex(u => {
                            return u.username === user.username;
                        });

                        expect(index).to.equal(-1);

                        loggedInUser2 = session;
        
                        done();
                    }, error => {
                        done(error);
                    });
            }, error => {
                done(error);
            });
    });

    it('Should allow you update your username and notify the others about it.', done => {
        const user = {
            username: 'super_admin'
        }

        const _io = io(`${global.url}?access_token=${loggedInUser2.access_token}`)

        _io.on(EVENTS.USERNAME_UPDATED, updatedUser => {
            expect(updatedUser.username).to.equal(user.username);
            expect(updatedUser._id).to.equal(loggedInUser._id);

            done();
        });

        _io.on('connect', () => {
            chai.request(global.url)
            .put('/api/users')
            .set('x-access-token', loggedInUser.access_token)
            .send(user)
            .then(res => {
                expect(res).to.have.status(200);

                expect(res.body.username).to.equal(user.username);

            }, error => {
                done(error);
            });
        });
    });

    it('Should allow you to refresh your token', done => {
        
        chai.request(global.url)
            .put('/api/session')
            .set('x-access-token', loggedInUser.access_token)
            .set('x-refresh-token', loggedInUser.refresh_token)
            .then(res => {
                expect(res).to.have.status(200);

                expect(res.body.access_token).to.not.equal(loggedInUser.access_token);
                expect(res.body.refresh_token).to.not.equal(loggedInUser.refresh_token);

                loggedInUser.access_token = res.body.access_token;
                loggedInUser.refresh_token = res.body.refresh_token;

                done();
            }, error => {
                done(error);
            });
    });

    it('Should log you out of the system and not allow to use the same access token', done => {

        chai.request(global.url)
            .delete('/api/session')
            .set('x-access-token', loggedInUser.access_token)
            .set('x-refresh-token', loggedInUser.refresh_token)
            .then(res => {
                expect(res).to.have.status(200);

                chai.request(global.url)
                .get('/api/users')
                .set('x-access-token', loggedInUser.access_token)
                .then(res => {
                    expect(res).to.have.status(403);
    
                    done();
                }, error => {
                    done(error);
                });
            }, error => {
                done(error);
            });
    });

});