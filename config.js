module.exports = {
    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || global.DATABASE_URL ||'mongodb://localhost:27017/movie-keeper',
    TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || global.TEST_DATABASE_URL ||'mongodb://localhost:27017/test-movie-keeper',
    PORT: process.env.PORT || 8080,
    JWT_SECRET: process.env.JWT_SECRET || 'moviewatcher',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
};
