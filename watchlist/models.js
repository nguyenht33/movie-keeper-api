const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const WatchlistSchema = Schema({
  movieId: Number,
  title: String,
  year: Number,
  poster_path: String,
  date: Date,
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Watchlist = mongoose.model('Watchlist', WatchlistSchema);

module.exports = {Watchlist};
