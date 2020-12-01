import Lox from './Lox';

const inputStream = process.stdin;
inputStream.setDefaultEncoding('utf-8');

inputStream.on('data', data => {
  const source = String(data);
  Lox.run(source);
});
