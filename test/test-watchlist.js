'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { app } = require('../server');
const { Watchlist } = require('../watchlist');
const { User } = require('../users');
const	{ runServer, closeServer } = require('../server');
const	{ TEST_DATABASE_URL } = require('../config');
const { populateUser, populateWatchlist, populateUserWatchlist } = require('./seed/seed');

describe('Watchlist Intergration Test', () => {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(populateUser);
	beforeEach(populateWatchlist);
	beforeEach(populateUserWatchlist);

	afterEach(function(done) {
		mongoose.connection.collections['users'].drop( function(err) {
			done();
		});
	});
	afterEach(function(done) {
  	mongoose.connection.collections['watchlists'].drop( function(err) {
			done();
		});
	});
	after(function() {
	  return closeServer();
	});


	let authToken;
	const loginUser = (done) => {
		User.findOne().then(_user => {
			request(app)
				.post('/api/auth/login')
				.send({ username: 'userjoe', password: 'password' })
				.expect(200)
				.end((err, res) => {
					if (err) {
						return done(err);
					}
					authToken = res.body.authToken;
					done();
				});
		});
	}


  describe('/api/watchlist', () => {
		beforeEach(loginUser);
    const movieId = 281338;

    it ('Should check if movie is in users watchlist', (done) => {
      User.findOne()
        .then(user => {
          request(app)
            .get(`/api/watchlist/check/${user._id}/${movieId}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.watchlist).to.equal(true)
              expect(res.body.id).to.be.a.string;
              done();
            });
        });
    });

    it ('Should add movie to movies watchlist', (done) => {
      const newMovie = {
        movieId: 8392,
        title: "My Neighbor Totoro",
        year: "1988",
        poster_path: "/2i0OOjvi7CqNQA6ZtYJtL65P9oZ.jpg",
        date: "2018-07-12T03:41:14+00:00"
      }

      User.findOne()
        .then(user => {
          request(app)
            .post(`/api/watchlist/${user._id}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .send(newMovie)
            .expect(201)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.message).to.exist;
              expect(res.body.movieId).to.be.a.string;
              done();
            });
        });
    });

    it ('Should get movies in watchlist list', (done) => {
      const page = 1;
      const perPage = 20;

      User.findOne()
        .then(user => {
          request(app)
            .get(`/api/watchlist/list/${user._id}/${page}/${perPage}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.pages).to.equal(1);
              expect(res.body.current).to.equal('1');
              expect(res.body.movies[0].movieId).to.equal(movieId);
              done();
            });
        });
    });

    it ('Should delete movie from watchlist list', (done) => {
      User.findOne()
        .then(user => {
          const movieDbId = user.watchlist[0];
          request(app)
            .delete(`/api/watchlist/${user._id}/${movieDbId}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .expect(204)
            .end((err, res) => {
              if (err) {
                return done(err);
              }

              User.findById(user._id)
                .then(user=> {
                  expect(user.watchlist).to.be.empty;
                  done();
                })
                .catch(err => done(err));
            });
        });
    });
  });
});
