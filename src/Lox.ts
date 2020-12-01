/* eslint-disable import/no-cycle */
import { AstPrinter } from './ast/printer';
import { Parser } from './Parser';
import { Scanner } from './Scanner';
import { Token, TokenType } from './Token';

export class LoxInstance {
  private _hadError = false;

  // eslint-disable-next-line no-shadow
  public error(token: Token, message: string): void {
    if (token.type === TokenType.EOF)
      this.report(token.position.line, ' at end', message);
    else this.report(token.position.line, `at ${token.lexeme}`, message);
  }

  private report(line: number, where: string, message: string): void {
    console.log(`[line ${line}] Error ${where}: ${message}`);
    this._hadError = true;
  }

  public run(source: string): void {
    this._hadError = false;
    const scanner = new Scanner(source);
    const tokens = scanner.scanTokens();

    const parser = new Parser(tokens);
    const ast = parser.parse();

    const printer = new AstPrinter();

    if (this._hadError) {
      console.log(JSON.stringify(ast, null, 2));
      console.log(`Had Error: ${this._hadError}`);
      return;
    }

    printer.print(ast);
  }
}

export default new LoxInstance();