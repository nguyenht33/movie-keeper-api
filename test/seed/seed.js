const { app } = require('../../server');
const { User } = require('../../users');
const { Watched } = require('../../watched');
const { Watchlist } = require('../../watchlist');
const mongoose = require('mongoose');
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');

let authToken;
let testUser;
// let userId = new mongoose.mongo.ObjectId('56cb91bdc3464f14678934ca');

const makeUser = (done) => {
  User.hashPassword('password').then((hash) => {
		return testUser = User.create({
			// _id: userId,
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

module.exports = {populateUser};
