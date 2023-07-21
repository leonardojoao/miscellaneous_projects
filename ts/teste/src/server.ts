import express from 'express';

const app = express();

app.use(express.json());

app.get('/', function (req, res) {
  res.send('Olá Mundo! 2');
});

app.listen(3333, () => console.log('Server is running!'));
