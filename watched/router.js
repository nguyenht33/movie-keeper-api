const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ User } = require('../users/models');

// add movie to movies watched list
router.post('/:userId', jsonParser, (req, res) => {
  let { movieId, title, year, poster_path, rating, review, date } = req.body;

  User.findOne({ _id: req.params.userId })
    .then(user => {
      user.watched.push({ movieId, title, year, poster_path, rating, review, date })
      return user.save();
    })
    .then(user => {
      return res.status(201).json({ message: `Added ${title} to list` });
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ message: 'Internal server error' });
    });
});

// get all movies from watched list
router.get('/:userId', (req, res) => {
	User.findOne({ _id: req.params.userId })
		.then(user => {
			return res.status(200).send(user.showWatched());
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// update an movie from watched list
router.put('/:userId/:movieId', jsonParser, (req, res) => {
	const { rating, review } = req.body;

	User.findOneAndUpdate(
		{ '_id': req.params.userId, 'watched.movieId': req.params.movieId },
		{ '$set': {
								'watched.$.review': review,
								'watched.$.rating': rating
							 }
		})
		.then(user => {
			return res.status(204).json({ message: 'movie updated' });
		})
		.catch(err => {
			console.error(err)
			res.status(500).json({ message: 'Internal server error' });
		});
});

// remove movie from movies watched list
router.delete('/:userId/:movieId', (req, res) => {
	User.findByIdAndUpdate(
			{'_id': req.params.userId},
			{'$pull': {'watched': { 'movieId': req.params.movieId }}
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
