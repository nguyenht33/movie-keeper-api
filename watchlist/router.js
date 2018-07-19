const express = require('express'),
			router = express.Router(),
			bodyParser = require('body-parser'),
			jsonParser = bodyParser.json(),
			{ User } = require('../users/models');

// add movie to movies watched
router.post('/:userId', jsonParser, (req, res) => {
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

module.exports = { router };
