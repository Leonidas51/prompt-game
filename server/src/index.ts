import express, { Request, Response } from 'express';
import path from 'path';

const app = express();
const port = 3000;

app.use(express.static(path.resolve(__dirname, '../client')));

app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../client/index.html'));
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
