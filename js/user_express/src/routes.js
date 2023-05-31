import { Router } from 'express';
import { usersController } from './controllers/usersController.js';

const routes = Router();

routes.post('/users', usersController.createUser)
routes.get('/users', usersController.getUsers)

export {routes};
