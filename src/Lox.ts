/* eslint-disable import/no-cycle */
import { AST } from './ast/ast';
import { AstPrinter } from './ast/printers/printer';
import { Parser } from './analysis/Parser';
import { Scanner } from './analysis/Scanner';
import { Token, TokenType } from './Token';
import { RuntimeError } from './errors/RuntimeError';
import { Interpreter } from './Interpreter';

export class LoxInstance {
  private _hadError = false;
  private _hadRuntimeError = false;
  private _interpreter = new Interpreter();

  // eslint-disable-next-line no-shadow
  public error(token: Token, message: string): void {
    if (token.type === TokenType.EOF)
      this.report(token.position.line, ' at end', message);
    else this.report(token.position.line, `at ${token.lexeme}`, message);
  }

  public runtimeError(err: RuntimeError): void {
    this.report(err.token.position.line, err.token.lexeme, err.message);
    this._hadRuntimeError = true;
  }

  public scannerError(line: number, message: string): void {
    this.report(line, '', message);
  }

  public report(line: number, where: string, message: string): void {
    console.error(`[line ${line}] Error ${where}: ${message}\n`);
    this._hadError = true;
  }

  public run(source: string): void {
    this._hadError = false;
    this._hadRuntimeError = false;

    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const ast = parser.parse() || new AST.Literal(undefined);

    // TODO: change this to reflect correct exit codes
    if (this._hadError || this._hadRuntimeError) {
      return;
    }

    // const printer = new AstPrinter();
    // printer.print(ast);
    this._interpreter.interpret(ast);
  }
}

export default new LoxInstance();
