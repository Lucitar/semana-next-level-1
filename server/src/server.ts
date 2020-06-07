import express from 'express';
import Routes from './routes';
import cors from 'cors';
import path from 'path';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', Routes);
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.listen(8000);