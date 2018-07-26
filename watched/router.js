const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ Movie } = require('./models'),
			{ User } = require('../users/models');

// add movie to movies watched list
router.post('/:userId', jsonParser, (req, res) => {
	let user = req.params.userId
  let { movieId, title, year, poster_path, rating, review, date } = req.body;
	let newMovie = new Movie({ movieId, title, year, poster_path, rating, review, date, user });

	newMovie.save()
		.then(() => {
			return User.findOne({ _id: user })
		})
		.then(user => {
			user.movie.push(newMovie);
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

// get all movies from watched list
router.get('/:userId', (req, res) => {
	Movie.findOne({ user: req.params.userId })
		.then(movies => {
			return res.status(200).send(movies);
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// find a movie in watched
router.get('/:userId/:movieId', (req, res) => {
	console.log('sdlkfj')
	let status;
	let user = req.params.userId;
	let movieId = parseFloat(req.params.movieId);
	Movie.findOne({ user: user , movieId: movieId })
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

// update an movie from watched list
router.put('/:userId/:movieId', jsonParser, (req, res) => {
	const { rating, review } = req.body;

	Movie.findOneAndUpdate(
		{ 'user': req.params.userId, 'movieId': req.params.movieId },
		{ '$set': {
								'review': review,
								'rating': rating
							 }
		})
		.then(movie => {
			return res.status(204).end();
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// remove movie from movies watched list
router.delete('/:userId/:moviedbId', (req, res) => {
	Movie.findByIdAndRemove({ _id: req.params.movieDbId })
		.then(() => {
			return User.findByIdAndUpdate(
				{'_id': req.params.userId},
				{'$pull': { 'movie': {'_id': req.params.moviedbId}}
			})
		})
		.then(() => res.status(204).end())
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

module.exports = { router };
