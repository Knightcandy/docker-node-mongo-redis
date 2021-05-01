const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const session = require('express-session')
const redis = require('redis')
let RedisStore = require('connect-redis')(session)
const { MONGO_USER, MONGO_PASSWORD, MONGO_IP, MONGO_PORT, REDIS_URL, REDIS_PORT, SESSION_SECRET } = require('./config/config');

let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
});


const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");

const app = express();
app.enable('trust proxy');
app.use(cors({}));
app.use(express.json());
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret: SESSION_SECRET,
    cookie: {
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 60000
    }
}));
const port = process.env.PORT || 3000;

const MONGOURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`

const connectWithRetry = () =>{
    mongoose
    .connect(MONGOURL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    })
    .then(() => console.log("Connected to DB"))
    .catch((e) => {
        console.log(e);
        setTimeout(connectWithRetry, 5000);
    });
}

connectWithRetry();
    
app.get('/api/v1', (req, res, next) => {
    res.send("<h1>Docker compose running!!!</h1>");
    console.log("Service scaled");
})

app.use("/api/v1/users", authRouter)
app.use("/api/v1/posts", postRouter)

app.listen(port, () => {
    console.log('Listening on port ', port);
})

console.log(`
    docker built -t node-app-image .

    // Use Bind Mount
    docker run -v %cd%:/app:ro -v /app/node_modules-p 3000:3000 -d --name node-app node-app-image

    // Use Bind Mount with read-only and anonymous bind
    docker run -v %cd%:/app:ro -v /app/node_modules --env-file ./.env -p 3000:4000 -d --name node-app node-app-image
    docker run -v %cd%:/app:ro -v /app/node_modules --env-file ./.env -p 3000:4000 -d --name node-app node-app-image

    // Sartup docker config 
    docker-compose up

    // Shutdown docker config 
    docker-compose down -v

    // Sartup multiple configs
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d

    // Startup container and networks
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d --build
    docker compose -f docker-compose.yml -f docker-compose.prod.yaml up -d --build

    // Shutdown container and networks
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml down
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml down -v

    // Start specific service only (with no dependencies   ->   --no-deps)
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d --no-deps node-app
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d mongo

    // Rebuild with new volume without shutdown compose ( -V flag )
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d --build -V

    // Scale service multiple
    docker compose -f docker-compose.yml -f docker-compose.dev.yaml up -d --scale node-app=2
`)