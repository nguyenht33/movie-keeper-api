const bcrypt = require('bcryptjs'),
			mongoose = require('mongoose'),
			Schema = mongoose.Schema;
      mongoose.Promise = global.Promise;

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
  movies: [{ type: Schema.Types.ObjectId, ref: 'Movie' }],
  watchlist: [{ type: Schema.Types.ObjectId, ref: 'Watchlist' }],
  _id: { type: Schema.ObjectId, auto: true }
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
