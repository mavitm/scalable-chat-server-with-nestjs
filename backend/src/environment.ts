export default {
  listenPort: process.env.listenPort || 3000,
  mongoUrl: process.env.mongoUrl || 'mongodb://localhost:27017/chat',
  redis: {
    url: process.env.redisUrl || 'redis://localhost:6379',
    host: process.env.redisHost || 'localhost',
    port: process.env.redisPort || 6379,
  },
  bcrypt: {
    saltRounds: 10,
    secretKey: 'strongTextWithSpecialMention',
  },
  jwtSecretKey: 'strongTextWithSpecialMention',
  cors: {
    credentials: true,
    methods: ['GET', 'POST'],
    origin: [
      'http://localhost',
      'http://localhost:8080',
      'http:127.0.0.1',
      'http:127.0.0.1:8080',
      'http:127.0.0.1:3000',
    ],
  },
};
