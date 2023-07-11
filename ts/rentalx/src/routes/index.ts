import { Router } from 'express';
import { categoriesRoutes } from './../routes/categories.routes';
import { specificationsRoutes } from './../routes/specification.routes';

const routes: Router = Router();

routes.use('/categories', categoriesRoutes);
routes.use('/specifications', specificationsRoutes);

export { routes };
