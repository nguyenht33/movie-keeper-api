const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ User } = require('./models');

// register user
router.post('/', jsonParser, (req, res) => {
	let {username, email, password, firstname, lastname} = req.body;

	User
		.find({ $or: [{ username: username }, { email: email }] })
		.then(users => {
			if (users.length === 0) {
				return User.hashPassword(password);
			}
			else if (users[0].username === username) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError',
					message: 'Username already taken',
					location: 'username'
				});
			}
			else if (users[0].email === email) {
				return Promise.reject({
					code: 422,
					reason: 'ValidationError',
					message: 'Email already exists',
					location: 'email'
				});
			};
		})
		.then(hash => {
			return User.create({
				username,
				email,
				password: hash,
				firstname,
				lastname
			});
		})
		.then(user => {
			return res.status(201).send(user.serialize());
		})
		.catch(err => {
			console.log(err);
			if(err.reason === 'ValidationError'){
				return res.status(err.code).json(err);
			}
			res.status(500).json({code:500, message: 'Internal server error'})
		});
});

module.exports = { router };
