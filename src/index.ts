import Lox from './Lox';

const inputStream = process.stdin;
inputStream.setDefaultEncoding('utf-8');

const argsLength = process.argv.length;

if (argsLength === 2) {
  inputStream.on('data', data => {
    const source = String(data);
    Lox.run(source);
  });
} else if (argsLength === 3) {
  const path = process.argv[2];
  Lox.runFile(path);
}
