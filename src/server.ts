import * as bodyParser from "body-parser";
import * as cors from "cors";
import * as express from "express";
import * as knex from "knex";
import * as morgan from "morgan";
import * as redis from "redis";

import UserRouter from "./routes/UserRouter";
import ProfileRouter from "./routes/ProfileRouter";
import ApiClarifaiRouter from "./routes/ApiClarifaiRouter";

import UserService from "./services/UserService";
import ProfileService from "./services/ProfileService";

import Authorization from "./middlewares/authorization";

const NODE_ENV = process.env.NODE_ENV || "development";
const PORT = process.env.PORT || 8080;

const knexfile = require("../knexfile")[NODE_ENV];
const pg = knex(knexfile);

const redisClient = redis.createClient(<string>process.env.REDIS_URL);

const app = express();

app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const authorization = new Authorization(redisClient);
const userService = new UserService(pg, redisClient);
const profileService = new ProfileService(pg);

const userRouter = new UserRouter(userService, authorization, redisClient);
const profileRouter = new ProfileRouter(profileService, authorization);
const apiClarifaiRouter = new ApiClarifaiRouter(authorization);

app.get("/", (req, res) => res.send("running"));
app.use("/users", userRouter.getRouter());
app.use("/profile", profileRouter.getRouter());
app.use("/api/clarifai", apiClarifaiRouter.getRouter());

//Error handler
app.use((req, res, next) => {
  res.status(404).json("Not Found");
});

app.listen(PORT, () => {
  console.log("Listening on port:", PORT);
});
