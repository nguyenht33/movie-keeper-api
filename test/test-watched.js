'use strict';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const assert = require('assert');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { app } = require('../server');
const { Movie } = require('../watched');
const { User } = require('../users');
const	{ runServer, closeServer } = require('../server');
const	{ TEST_DATABASE_URL } = require('../config');
const { populateUser, populateWatched, populateUserWatched } = require('./seed/seed');

describe('Watched Intergration Test', () => {
	before(function() {
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(populateUser);
	beforeEach(populateWatched);
	beforeEach(populateUserWatched);

	afterEach(function(done) {
		mongoose.connection.collections['users'].drop( function(err) {
			done();
		});
	});
	afterEach(function(done) {
  	mongoose.connection.collections['movies'].drop( function(err) {
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

  describe('/api/watched', () => {
    beforeEach(loginUser);
    const movieId = 281338;

    it ('Should check if movie is in users watched', (done) => {
      User.findOne()
        .then(user => {
          request(app)
            .get(`/api/watched/check/${user.id}/${movieId}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.watched).to.equal(true);
              expect(res.body.rating).to.equal(4);
              expect(res.body.id).to.exist;
              done();
            });
        });
    });

    it ('Should add movie to movies watched', (done) => {
      const newMovie = {
        movieId: 8392,
        title: "My Neighbor Totoro",
        year: "1988",
        poster_path: "/2i0OOjvi7CqNQA6ZtYJtL65P9oZ.jpg",
        rating: 4,
        review: "Cute",
        date: "2018-07-12T03:41:14+00:00"
      }

      User.findOne()
        .then(user => {
          request(app)
            .post(`/api/watched/${user.id}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .send(newMovie)
            .expect(201)
            .end((err, res) => {
              if (err) {
                return done(err);
              }
              expect(res.body.rating).to.equal(4);
              expect(res.body.movieId).to.be.a.string;
              done();
            });
        });
    });

    it ('Should get movies in watched list', (done) => {
      const page = 1;
      const perPage = 20;

      User.findOne()
        .then(user => {
          request(app)
            .get(`/api/watched/list/${user.id}/${page}/${perPage}`)
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

    it ('Should update movie in watched list', (done) => {
      const update = {
        rating: '1',
        review: 'Bad'
      }
      User.findOne()
        .then(user => {
          const movieDbId = user.movies[0];
          request(app)
            .put(`/api/watched/${user.id}/${movieDbId}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .send(update)
            .expect(200)
            .end((err, res) => {
              if (err) {
                return done(err);
              }

              expect(res.body.rating).to.equal(1);
              expect(res.body.review).to.equal('Bad');

              Movie.findById(movieDbId)
                .then(movie => {
                  expect(movie.rating).to.equal(1);
                  expect(movie.review).to.equal('Bad');
                  done();
                })
                .catch(err => done(err));
            });
        });
    });

    it ('Should delete movie from watched list', (done) => {
      User.findOne()
        .then(user => {
          const movieDbId = user.movies[0];
          request(app)
            .delete(`/api/watched/${user.id}/${movieDbId}`)
            .set('Authorization', [`Bearer ${authToken}`])
            .expect(204)
            .end((err, res) => {
              if (err) {
                return done(err);
              }

              User.findById(user.id)
                .then(user=> {
                  expect(user.movies).to.be.empty;
                  done();
                })
                .catch(err => done(err));
            });
        });
    });
  });

});
