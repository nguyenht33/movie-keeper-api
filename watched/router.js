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
			user.movies.push(newMovie);
			return user.save();
		})
		.then(user => {
			return res.status(201).json({
				message: `Added ${title} to movies you watched!`,
				movieId: newMovie.id,
				status: 201
			});
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

router.get('/:userId/:page', (req, res) => {
	const perPage = 15;
	const page = req.params.page || 1
	let movies;

	Movie.find({ user: req.params.userId })
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.then(_movies => {
			movies = _movies
			return Movie.count();
		})
		.then(count => {
			return res.status(200).json({
				pages: Math.ceil(count / perPage),
				current: page,
				movies: movies
			});
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});


// get all movies from watched list
// router.get('/:userId', (req, res) => {
// 	Movie.find({ user: req.params.userId })
// 		.then(movies => {
// 			console.log(movies)
// 			return res.status(200).send(movies);
// 		})
// 		.catch(err => {
// 			console.error(err)
// 			res.status(500).json({ message: 'Internal server error' });
// 		});
// });

// check if a movie is in watched
router.get('/check/:userId/:movieId', (req, res) => {
	let status,
			id,
			userId = req.params.userId,
			movieId = req.params.movieId;
	Movie.findOne({ user: userId, movieId: movieId })
		.then(movie => {
			if (movie) {
				id = movie._id;
				status = true;
			} else {
				id = null;
				status = false;
			}
			return res.status(200).send({ watched: status , id});
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
router.delete('/:userId/:movieObjId', (req, res) => {
	const userId = req.params.userId;
	const movieObjId = req.params.movieObjId;

	Movie.findByIdAndRemove({ _id: movieObjId })
		.then(() => {
			return User.findByIdAndUpdate(
				{ '_id': userId },
				{ '$pull': { 'movies': movieObjId }}
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
