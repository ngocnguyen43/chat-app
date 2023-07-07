import './v1/cache';

import * as dotenv from 'dotenv';
import { Express } from 'express';

import { MiddleWareLoader, ServerLoader } from '../api/v1/loaders';
import RouterLoader from './v1/loaders/routersLoader';

dotenv.config();
const version = 'v1';
const app: Express = ServerLoader.init();
RouterLoader.init(version, app);
MiddleWareLoader.init(app);
export default app;
