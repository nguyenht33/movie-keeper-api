module.exports = {
    CLIENT_ORIGIN:'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || global.DATABASE_URL ||'mongodb://localhost/movie-keeper',
    PORT: process.env.PORT || 8080
};
