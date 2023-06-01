import { Router } from 'express';
import { UsersController } from './controllers/usersController.ts';

const routes: Router = Router();
const usersController = new UsersController()

routes.post('/users', usersController.createUser)
routes.get('/users', usersController.getUsers)

export {routes};
