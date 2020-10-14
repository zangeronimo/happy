import express, { json } from 'express';

import './database/connection';

const app = express();

app.use(express.json());

app.get('/', (request, response) => {
    return response.json({ message: 'Hello World'});
});

app.listen(4000);