export default {
  mongodb: {
    url: 'mongodb://root:kl4p4rfh@autovideo-db-mongodb.ns-tevyggd8.svc:27017',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin',
      dbName: 'autovideo',
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 2000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }
  },
  server: {
    port: process.env.PORT || 3001
  }
} 