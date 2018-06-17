#   .env file example:

```
PORT=3000

MONGODB_URI=<mongodb-uri>

TOKEN_SECRET=<some-token-secret>

REDIS_HOST=<redis-host>
REDIS_PASSWORD=<redis-password> //optional
REDIS_PORT=<redis-port>
```

Start the application by running `npm start`.  **Note:** Socket.IO doesn't work with multiple node processes, even with the socket.io-redis module.

`npm test` will run the tests, the app must be running.