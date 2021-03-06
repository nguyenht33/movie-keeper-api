const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { app } = require('../server');
const { User } = require('../users');
const { Watched } = require('../watched');
const { Watchlist } = require('../watchlist');

const	{ runServer, closeServer } = require('../server');
const	{ TEST_DATABASE_URL } = require('../config');
const { JWT_SECRET } = require('../config');
const { populateUser } = require('./seed/seed');

describe('Users Testings', () => {
	before(function() {
			return runServer(TEST_DATABASE_URL);
	});
	after(function() {
	    return closeServer();
	});

	describe('POST /api/users', () => {
		afterEach(function() {
			mongoose.connection.collections['users'].drop( function(err) {
			});
		});

		it ('Should be able to create a new user', (done) => {
			const jane = {
				username: 'jane',
				email: 'jane@gmail.com',
				password: 'password',
				firstname: 'jane',
				lastname: 'doe'
			}
			request(app)
				.post('/api/users')
				.send(jane)
				.expect(201)
				.expect((res) => {
					expect(res.body.username).to.equal(jane.username);
					expect(res.body.password).to.not.equal(jane.password);
				})
				.end((err, res) => {
					if (err) {
						return done(err);
					}

					User.findById(res.body.id)
						.then(user => {
							expect(user.username).to.equal('jane');
							done();
						})
						.catch(err => done(err));
				});
		});
	});

	describe('/api/auth', () => {
		beforeEach(populateUser);
		afterEach(function() {
			mongoose.connection.collections['users'].drop( function(err) {
			});
		});

		describe('/api/auth/login', () => {
			it('Should reject request with no credentials', (done) => {
				request(app)
					.post('/api/auth/login')
          .send({username: '', password: ''})
					.expect(400)
					.end(done);
			});

			it('Should reject request with incorrect usernames', (done) => {
				request(app)
					.post('/api/auth/login')
					.send({ username: 'userjohn', password: 'password' })
					.expect(401)
					.end(done);
			});

			it('Should reject request with incorrect usernames', (done) => {
				request(app)
					.post('/api/auth/login')
					.send({ username: 'userjoe' , password: 'wrongPassword' })
					.expect(401)
					.end(done);
			});
		});

		describe('/api/auth/refresh', () => {
			it('Should reject request with no credentials', (done) => {
				request(app)
					.post('/api/auth/login')
					.expect(400)
					.end(done);
			});

			it('Should reject requests with an invalid token', (done) => {
				const token = jwt.sign(
				{
					username: 'userjoe',
					firstname: 'joe',
					lastname: 'schmoe'
				},
				'wrongSecret',
				{
					algorithm: 'HS256',
					expiresIn: '7d'
				});

				request(app)
					.post('/api/auth/refresh')
					.set('Authorization', [`Bearer ${token}`])
					.expect(401)
					.end(done);
			});

			it('Should reject requests with an expired token', (done) => {
				const token = jwt.sign(
	        {
	          user: {
							username: 'userjoe',
							firstname: 'joe',
							lastname: 'schmoe'
	          },
	          exp: Math.floor(Date.now() / 1000) - 10
	        },
	        JWT_SECRET,
	        {
	          algorithm: 'HS256',
	          subject: 'userjoe'
	        }
	      );

	      request(app)
	      	.post('/api/auth/refresh')
	      	.set('Authorization', [`Bearer ${token}`])
	      	.expect(401)
	      	.end(done);
			});
		});
	});

	describe('Users Intergration Test', () => {
		let authToken;
		const loginUser = (done) => {
			User.findOne()
			.then(_user => {
				request(app)
					.post('/api/auth/login')
					.send({ username: 'userjoe', password: 'password' })
					.expect(200)
					.end((err, res) => {
						if (err) {
							return done(err);
						}
						authToken = res.headers['set-cookie'].pop().split(';')[0].slice(10);
						done();
					});
			});
		}
	});

});
