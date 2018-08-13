const { app } = require('../../server');
const { User } = require('../../users');
const { Movie } = require('../../watched');
const { Watchlist } = require('../../watchlist');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

let authToken;
let testUser;
let userId = new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca');

const makeUser = (done) => {
  User.hashPassword('password').then((hash) => {
		return testUser = User.create({
			_id: userId,
			email:'joe@schmoe.com',
			password: hash,
			username: 'userjoe',
			firstname:'joe',
			lastname:'schmoe'
		})
	})
}

const populateUser = (done) => {
  User.remove({}).then(() => {
  	return makeUser();
  }).then(() => done());
};


const	testWatched = [{
  movieId: 281338,
	title: "War for the Planet of the Apes",
	year: "2017",
	poster_path: "/oDvgC7IeTdc03SgiSSo2HY7xGYX.jpg",
	rating: 4 ,
	review: "This is the review",
	date:  "2018-07-12T03:41:14+00:00",
  user: userId
}];

const testWatchlist = [{
  movieId: 281338,
  title: "War for the Planet of the Apes",
  year: "2017",
  date:  "2018-07-12T03:41:14+00:00",
  user: userId
}]

const populateWatched = (done) => {
  Movie.remove({}).then(() => {
    return Movie.insertMany(testWatched);
  }).then(() => done());
};

const populateWatchlist = (done) => {
  Watchlist.remove({}).then(() => {
    return Watchlist.insertMany(testWatchlist);
  }).then(() => done());
};

const populateUserWatched = (done) => {
	User.findOne().then(_user => {
		Movie.find().then(_movies => {
			_movies.forEach(_movie => {
				_user.movies.push(_movie);
			})
			return _user.save();
		})
		return Promise.resolve();
	}).then(() => done());
};

const populateUserWatchlist = (done) => {
	User.findOne().then(_user => {
		Watchlist.find().then(_movies => {
			_movies.forEach(_movie => {
				_user.watchlist.push(_movie);
			})
			return _user.save();
		})
		return Promise.resolve();
	}).then(() => done());
};

module.exports = {populateUser, populateWatched, populateUserWatched, populateWatchlist, populateUserWatchlist};
