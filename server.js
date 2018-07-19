const express = require('express'),
      app = express(),
      cors = require('cors'),
      mongoose = require('mongoose');
      mongoose.Promise = global.Promise;

const { CLIENT_ORIGIN, PORT, DATABASE_URL } = require('./config'),
      { router: usersRouter } = require('./users'),
      { router: watchedRouter } = require('./watched'),
      { router: watchlistRouter } = require('./watchlist');

app.use('/api/users', usersRouter);
app.use('/api/watched', watchedRouter);
app.use('/api/watchlist', watchlistRouter);
app.use(
    cors({ origin: CLIENT_ORIGIN })
);

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
