const express = require('express');
const app = express();

// Import routes
const blindateRoutes = require('./src/routes/blindate.routes');

// Use routes
app.use('/api/blindates', blindateRoutes);

// Print all routes
console.log('Routes:');
app._router.stack.forEach(middleware => {
  if (middleware.route) {
    // Routes registered directly on the app
    console.log(`${Object.keys(middleware.route.methods).join(',')} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    // Router middleware
    middleware.handle.stack.forEach(handler => {
      if (handler.route) {
        const path = handler.route.path;
        const methods = Object.keys(handler.route.methods).join(',');
        console.log(`${methods} /api/blindates${path}`);
      }
    });
  }
});