const bcrypt = require('bcryptjs'),
			mongoose = require('mongoose'),
			Schema = mongoose.Schema;
      mongoose.Promise = global.Promise;

const watchedSchema = Schema({
  movieId: Number,
  title: String,
  year: Number,
  poster_path: String,
  rating: Number,
  review: String,
  date: Date,
  _id: false
});

const watchlistSchema = Schema({
  movieId: Number,
  title: String,
  year: Number,
  poster_path: String,
  date: Date,
  _id: false
});

const UserSchema = Schema({
  username: {
    type: String,
    required: true,
    minlength: 1,
    trim: true,
    unique: true
  },
	email: {
		type: String
	},
	password: {
		type: String,
		required: true,
		minlength: 6,
		trim: true
	},
	firstname: {
		type: String,
		minlength: 1,
		trim: true
	},
	lastname: {
		type: String,
		minlength: 1,
		trim: true
	},
  watched: [watchedSchema],
  watchlist: [watchlistSchema]
});

UserSchema.methods.serialize = function() {
  return {
    id: this._id,
    username: this.username || '',
    email: this.email || '',
    firstname: this.firstname || '',
    lastname: this.lastname || '',
  };
};

UserSchema.methods.validatePassword = function(password) {
	return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
	return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};
