import LoxEvents from './emitter/Lox';

export const error = (line: number, message: string): void =>
  report(line, '', message);

export const report = (line: number, where: string, message: string): void => {
  const errorMessage = `[line ${line}] Error ${where}: ${message}`;
  console.error(errorMessage);
  // hadError = true;
  LoxEvents.emit('error', errorMessage);
};
