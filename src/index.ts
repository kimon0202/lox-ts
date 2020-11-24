import { promises } from 'fs';

import LoxEvents from './emitter/Lox';
import { Scanner } from './Scanner';

const { readFile } = promises;

const stdInput = process.stdin;
stdInput.setDefaultEncoding('utf-8');

function main(): void {
  const args = process.argv;
  const argCount = args.length;

  console.log(args);

  if (argCount > 3) {
    console.log(`Usage: lox [script]`);
  } else if (args.length === 3) {
    runFile(args[2]);
  } else runPrompt();
}

async function runFile(path: string): Promise<void> {
  const content = await readFile(path, { encoding: 'utf-8' });
  run(content);

  if (hadError) process.exit(65);
}

function runPrompt(): void {
  stdInput.on('data', data => {
    for (;;) {
      console.log('> ');

      const line = String(data);
      if (!line) break;

      run(line);
      hadError = false;
    }
  });
}

function run(content: string): void {
  const scanner = new Scanner(content);
  const tokens = scanner.scanTokens();

  tokens.forEach(console.log);
}

main();

let hadError = false;

LoxEvents.onError(message => {
  hadError = true;
  console.log(message, `Had Error: ${hadError}`);
});
