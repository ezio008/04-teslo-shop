export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  dbPassword: process.env.DB_PASSWORD,
  dbName: process.env.DB_PASSWORD,
  dbHost: process.env.DB_PASSWORD,
  dbPort: process.env.DB_PASSWORD || 5432,
  dbUsername: process.env.DB_PASSWORD,
  hostApi: process.env.HOST_API,
  port: process.env.PORT || 3000,
});
