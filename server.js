require('dotenv').config();
const express = require('express'),
      app = express(),
      cors = require('cors'),
      passport = require('passport'),
      mongoose = require('mongoose');
      mongoose.Promise = global.Promise;

const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require('./config'),
      { router: usersRouter } = require('./users'),
      { router: authRouter, localStrategy, jwtStrategy } = require('./auth'),
      { router: watchedRouter } = require('./watched'),
      { router: watchlistRouter } = require('./watchlist');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(
    cors({ origin: CLIENT_ORIGIN })
);

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/watched', watchedRouter);
app.use('/api/watchlist', watchlistRouter);

let server;

function runServer(DATABASE_URL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(DATABASE_URL, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(PORT, () => {
	        console.log(`Your app is listening on port ${PORT}`);
	        resolve();
	      })
	      .on('error', err => {
	        mongoose.disconnect();
	        reject(err);
	      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = { app, runServer, closeServer };
