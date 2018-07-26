const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ Watchlist } = require('./models'),
			{ User } = require('../users/models');

// add movie to movies watchlist
router.post('/:userId', jsonParser, (req, res) => {
	let user = req.params.userId
  let { movieId, title, year, poster_path, date } = req.body;
	let newMovie = new Watchlist({ movieId, title, year, poster_path, date, user });

	newMovie.save()
		.then(() => {
			return User.findOne({ _id: user })
		})
		.then(user => {
			user.watchlist.push(newMovie);
			return user.save();
		})
		.then(user => {
			return res.status(201).json({ message: `Added ${title} to movies you watched!` });
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// get all movies from watchlist
router.get('/:userId', (req, res) => {
	Watchlist.findOne({ user: req.params.userId })
		.then(movies => {
			return res.status(200).send(movies);
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// find a movie in watchlist
router.get('/:userId/:movieId', (req, res) => {
	let status;
	let user = req.params.userId;
	let movieId = req.params.movieId;
	Watchlist.findOne({ user: user , movieId: movieId })
		.then(movie => {
			if (movie) {
				status = true;
			} else {
				status = false;
			}
			return res.status(200).send({ watched: status });
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// remove movie from movies watchlist
router.delete('/:userId/:movieObjId', (req, res) => {
	const userId = req.params.userId;
	const movieObjId = req.params.movieObjId;

	Watchlist.findByIdAndRemove({ _id: movieObjId })
		.then(() => {
			return User.findByIdAndUpdate(
				{ _id: userId },
				{ $pull: { watchlist: movieObjId }}
			)
		})
		.then((user) => {
			res.status(204).end()
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

module.exports = { router };
