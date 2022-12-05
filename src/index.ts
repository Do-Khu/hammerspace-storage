import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import router from './routers/route';

dotenv.config();

const app: Express = express();
const port = parseInt(process.env.PORT || "9142");
const host = process.env.HOST || "localhost";

app.use(express.json())
app.use(express.urlencoded())

app.get('/ping', (req: Request, res: Response) => {
  res.send('Pong! :3');
});

// Rotas
app.use('/api', router)

// Resposta padrão para quaisquer outras requisições:
app.use((req, res) => {
  res.status(404)
})

app.listen(port, host, () => {
  console.log(`⚡️[server]: Server is running at http://${host}:${port}`);
});