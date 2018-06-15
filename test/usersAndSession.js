const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = require('chai').expect;

chai.use(chaiHttp);

const { MESSAGES, ERRORS } = require('../constants');

let loggedInUser = {};

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

    it('Shouldds allow you to login with an existing username and password', done => {
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

    it('Should allow you update your username', done => {
        const user = {
            username: 'super_admin'
        }

        chai.request(global.url)
            .put('/api/users')
            .set('x-access-token', loggedInUser.access_token)
            .send(user)
            .then(res => {
                expect(res).to.have.status(200);

                expect(res.body.username).to.equal(user.username);

                done();
            }, error => {
                done(error);
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