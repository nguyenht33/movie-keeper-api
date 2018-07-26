const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;

const MovieSchema = Schema({
  movieId: Number,
  title: String,
  year: Number,
  poster_path: String,
  rating: Number,
  review: String,
  date: Date,
  user: { type: Schema.Types.ObjectId, ref: 'User' }
});

const Movie = mongoose.model('Movie', MovieSchema);

module.exports = { Movie };
