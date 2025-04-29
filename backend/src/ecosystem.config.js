module.exports = {
  apps: [
    {
      name: "bobace-backend",
      script: "app.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
        JWT_SECRET: "Nhunam2014",
        MONGODB_URI: "mongodb://nhunam2003:Nhunam2014@160.30.21.36:52431/hen-ho-tra-sua?authSource=admin"
      }
    }
  ]
};