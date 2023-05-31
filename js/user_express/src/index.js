import express from 'express';
import bodyParser from 'body-parser';

import { routes } from './routes.js';

const app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(routes);

app.listen(5000, () => {
  console.log('Servidor on na porta 5000')
});
