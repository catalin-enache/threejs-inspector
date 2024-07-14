import express from 'express';
import chalk from 'chalk';
import path from 'path';

const port = 1234;

const app = express();

app.use((req, res, next) => {
  const start = new Date();
  res.on('finish', () => {
    const duration = new Date() - start;
    console.log(`${start.toISOString()} - ${req.method} - ${req.url} - ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use(express.static(path.resolve()));
const server = app.listen(port, () => {
  console.log(chalk.green(`Server started at http://localhost:${port}`));
});

process.on('SIGINT', () => close());

function close(exitCode = 1) {
  server.close();
  process.exit(exitCode);
}
