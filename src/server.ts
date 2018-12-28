import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as knex from 'knex';
import * as morgan from 'morgan';

import UserRouter from './routes/UserRouter';
import UserService from './services/UserService';
import ApiClarifaiRouter from './routes/ApiClarifaiRouter';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 8080;

const knexfile = require('../knexfile')[NODE_ENV];
const pg = knex(knexfile);

const app = express();

app.use(morgan('combined'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const userService = new UserService(pg);

const userRouter = new UserRouter(userService);
const apiClarifaiRouter = new ApiClarifaiRouter();

app.get('/', (req, res) => res.send('running'));
app.use('/users', userRouter.getRouter());
app.use('/api/clarifai', apiClarifaiRouter.getRouter());

//Error handler
app.use((req, res, next) => {
    res.status(404).json('Not Found');
})

app.listen(PORT, () => {
    console.log('Listening on port:', PORT)
});

