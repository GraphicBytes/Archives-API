import express from 'express';
import helmet from "helmet";
import cors from 'cors';
import Mongo from './configs/Mongo.js';
import Logger from './helpers/Logger.js';
import { corsOptions } from './configs/CORS.js';

import { customHeaders, excludeFavicon, validateBody, validateHeaders, contentType, noRouteFound } from './middlewares/index.js';

const logger = new Logger('Server');
const db = new Mongo();
const app = express();

app.set('trust proxy', 1);
app.disable("x-powered-by");
app.use(helmet());
app.use(cors());
app.all('/', (req, res) => {
    return res.json({ status: 'OK' });
});
app.use(cors(corsOptions));

import { getPrivateRouter, getPublicRouter } from './routes/read.js';
import { postPrivateRouter, postPublicRouter } from './routes/create.js';
import { updatePrivateRouter, updatePublicRouter } from './routes/update.js';
import { deletePrivateRouter } from './routes/delete.js';

app.use(excludeFavicon);
app.use(customHeaders);
app.use(contentType);
app.use(express.json({ limit: '50mb' }));
app.use(validateBody);
app.use(validateHeaders);

app.use('/api/private/', getPrivateRouter);
app.use('/api/public/', getPublicRouter);
app.use('/api/private/', postPrivateRouter);
app.use('/api/public/', postPublicRouter);
app.use('/api/private/', updatePrivateRouter);
app.use('/api/public/', updatePublicRouter);
app.use('/api/private/', deletePrivateRouter);

app.use('*', noRouteFound);

db.getConnection().on('connected', function () {
    try {
        app.listen(3000);

        console.log(`Archives api listening on localhost:3000`);
        logger.log(`Archives api listening on localhost:3000`);
    } catch (error) {
        console.error(`Error starting server: ${error}`);
        logger.log(`Error starting server: ${error}`);
    }
});