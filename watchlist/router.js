const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ User } = require('../users/models');

// add movie to movies watchelist
router.post('/:userId', jsonParser, (req, res) => {
	console.log('adding movie')
	console.log(req.body)
  let { movieId, title, year, poster_path, date } = req.body;

  User.findOne({ _id: req.params.userId })
    .then(user => {
      user.watchlist.push({ movieId, title, year, poster_path, date })
      return user.save();
    })
    .then(user => {
      return res.status(201).send({ message: `Added "${title}" to list` })
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' });
    });
});

// get all movies from watchlist
router.get('/:userId', (req, res) => {
	User.findOne({ _id: req.params.userId })
		.then(user => {
			return res.status(200).send(user.showWatchlist());
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// find a movie in watchlist
router.get('/:userId/:movieId', (req, res) => {
	let status;
	let movieId = parseFloat(req.params.movieId)
	User.findOne({ '_id': req.params.userId })
		.then(user => {
			let found = user.watchlist.find(movie => movie.movieId === movieId);
			if (found) {
				status = true;
			} else {
				status = false;
			}
			return res.status(200).send({ watchlist: status });
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// remove movie from movies watchlist
router.delete('/:userId/:movieId', (req, res) => {
	console.log('deleting movie')
	User.findByIdAndUpdate(
			{'_id': req.params.userId},
			{'$pull': {'watchlist': { 'movieId': req.params.movieId }}
		})
		.then(() => {
			res.status(204).end();
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ message: 'Internal server error' });
		});
});

module.exports = { router };
