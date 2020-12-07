/* eslint-disable import/no-cycle */
import { ExpressionAST } from '../ast/ast';
import { Token, TokenType } from '../Token';
import { ParseError } from '../errors/ParseError';
import Lox from '../Lox';
import { StatementAST } from '../ast/statements';

export class Parser {
  private readonly _tokens: Token[];
  private _current = 0;

  public constructor(tokens: Token[]) {
    this._tokens = tokens;
  }

  public parse(): StatementAST.Statement[] {
    const statements: StatementAST.Statement[] = [];

    while (!this.isAtEnd()) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      statements.push(this.declaration()!);
    }

    return statements;
  }

  private peek(offset = 0): Token {
    const index = this._current + offset;

    if (offset >= this._tokens.length)
      return this._tokens[this._tokens.length - 1];

    return this._tokens[index];
  }

  private previous(): Token {
    return this._tokens[this._current - 1];
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this._current++;
    return this.previous();
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();

    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): ParseError {
    Lox.error(token, message);
    return new ParseError();
  }

  private match(...tokenTypes: TokenType[]): boolean {
    for (let i = 0; i < tokenTypes.length; i++) {
      const type = tokenTypes[i];

      if (this.check(type)) {
        this.advance();
        return true;
      }
    }

    return false;
  }

  private expression(): ExpressionAST.Expression {
    return this.assignment();
  }

  private assignment(): ExpressionAST.Expression {
    const expression = this.or();

    if (this.match(TokenType.EQUAL)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expression instanceof ExpressionAST.Variable) {
        const { name } = expression as ExpressionAST.Variable;
        return new ExpressionAST.Assign(name, value);
      }

      this.error(equals, `Invalid assignment target.`);
    }

    return expression;
  }

  private or(): ExpressionAST.Expression {
    let expression = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();

      expression = new ExpressionAST.Logical(expression, operator, right);
    }

    return expression;
  }

  public and(): ExpressionAST.Expression {
    let expression = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();

      expression = new ExpressionAST.Logical(expression, operator, right);
    }

    return expression;
  }

  private statement(): StatementAST.Statement {
    if (this.match(TokenType.PRINT)) return this.printStatement();
    if (this.match(TokenType.RETURN)) return this.returnStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE))
      return new StatementAST.Block(this.block());
    if (this.match(TokenType.FOR)) return this.forStatement();
    if (this.match(TokenType.IF)) return this.ifStatement();

    return this.expressionStatement();
  }

  private returnStatement(): StatementAST.Statement {
    const keyword = this.previous();
    let value: ExpressionAST.Expression | null = null;

    if (!this.check(TokenType.SEMICOLON)) value = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected ";" after return value.');
    return new StatementAST.Return(keyword, value);
  }

  private whileStatement(): StatementAST.Statement {
    this.consume(TokenType.LEFT_PAREN, 'Expected "(" after "while".');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after condition.');
    const body = this.statement();

    return new StatementAST.While(condition, body);
  }

  private forStatement(): StatementAST.Statement {
    this.consume(TokenType.LEFT_PAREN, 'Expected "(" after "for".');

    let initializer: StatementAST.Statement | null;
    if (this.match(TokenType.SEMICOLON)) initializer = null;
    else if (this.match(TokenType.VAR)) initializer = this.varDeclaration();
    else initializer = this.expressionStatement();

    let condition: ExpressionAST.Expression | null = null;
    if (!this.check(TokenType.SEMICOLON)) condition = this.expression();

    this.consume(TokenType.SEMICOLON, 'Expected ";" after loop condition.');

    let increment: ExpressionAST.Expression | null = null;
    if (!this.check(TokenType.RIGHT_PAREN)) increment = this.expression();

    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after for clauses.');

    let body = this.statement();

    if (increment) {
      body = new StatementAST.Block([
        body,
        new StatementAST.Expression(increment),
      ]);
    }

    if (!condition) condition = new ExpressionAST.Literal(true);
    body = new StatementAST.While(condition, body);

    if (initializer) body = new StatementAST.Block([initializer, body]);
    return body;
  }

  private ifStatement(): StatementAST.Statement {
    this.consume(TokenType.LEFT_PAREN, 'Expected "(" after "if".');
    const condition = this.expression();
    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after if condition.');

    const thenBranch = this.statement();
    let elseBranch = null;

    if (this.match(TokenType.ELSE)) elseBranch = this.statement();
    return new StatementAST.If(condition, thenBranch, elseBranch);
  }

  private block(): StatementAST.Statement[] {
    const statements: StatementAST.Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd())
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      statements.push(this.declaration()!);

    this.consume(TokenType.RIGHT_BRACE, 'Exprected "}" after block.');
    return statements;
  }

  private declaration(): StatementAST.Statement | null {
    try {
      if (this.match(TokenType.FUN)) return this.function('function');
      if (this.match(TokenType.VAR)) return this.varDeclaration();

      return this.statement();
    } catch (err) {
      this.synchronize();
      return null;
    }
  }

  private function(kind: string): StatementAST.LoxFunction {
    const name = this.consume(TokenType.IDENTIFIER, `Expected ${kind} name.`);

    this.consume(TokenType.LEFT_PAREN, `Expected "(" after ${kind} name.`);
    const params: Token[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (params.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 parameters.");
        }

        params.push(
          this.consume(TokenType.IDENTIFIER, 'Expected paramer name.'),
        );
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after parameters.');
    this.consume(TokenType.LEFT_BRACE, `Expected "{" before ${kind} body.`);

    const body = this.block();
    return new StatementAST.LoxFunction(name, params, body);
  }

  private varDeclaration(): StatementAST.Statement {
    const name = this.consume(TokenType.IDENTIFIER, 'Expected variable name.');
    let initializer: ExpressionAST.Expression = new ExpressionAST.Literal(null);

    if (this.match(TokenType.EQUAL)) initializer = this.expression();

    this.consume(
      TokenType.SEMICOLON,
      'Expected ";" after variable declaration.',
    );
    return new StatementAST.Var(name, initializer);
  }

  private expressionStatement(): StatementAST.Statement {
    const expression = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected ";" after expression.');

    return new StatementAST.Expression(expression);
  }

  private printStatement(): StatementAST.Statement {
    const value = this.expression();
    this.consume(TokenType.SEMICOLON, 'Expected ";" after value.');

    return new StatementAST.Print(value);
  }

  private equality(): ExpressionAST.Expression {
    let expression = this.comparison();

    while (this.match(TokenType.BANG_EQUAL, TokenType.EQUAL_EQUAL)) {
      const operator = this.previous();
      const right = this.comparison();

      expression = new ExpressionAST.Binary(expression, operator, right);
    }

    return expression;
  }

  private comparison(): ExpressionAST.Expression {
    let expression = this.term();

    while (
      this.match(
        TokenType.GREATER,
        TokenType.GREATER_EQUAL,
        TokenType.LESS,
        TokenType.LESS_EQUAL,
      )
    ) {
      const operator = this.previous();
      const right = this.term();

      expression = new ExpressionAST.Binary(expression, operator, right);
    }

    return expression;
  }

  private term(): ExpressionAST.Expression {
    let expression = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();

      expression = new ExpressionAST.Binary(expression, operator, right);
    }

    return expression;
  }

  private factor(): ExpressionAST.Expression {
    let expression = this.unary();

    while (this.match(TokenType.SLASH, TokenType.STAR)) {
      const operator = this.previous();
      const right = this.unary();

      expression = new ExpressionAST.Binary(expression, operator, right);
    }

    return expression;
  }

  private unary(): ExpressionAST.Expression {
    if (this.match(TokenType.BANG, TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();

      return new ExpressionAST.Unary(operator, right);
    }

    return this.call();
  }

  private call(): ExpressionAST.Expression {
    let expression = this.primary();

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (this.match(TokenType.LEFT_PAREN))
        expression = this.finishCall(expression);
      else break;
    }

    return expression;
  }

  private finishCall(
    callee: ExpressionAST.Expression,
  ): ExpressionAST.Expression {
    const args: ExpressionAST.Expression[] = [];

    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), "Can't have more than 255 arguments.");
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      'Expected ")" after arguments.',
    );
    return new ExpressionAST.Call(callee, paren, args);
  }

  private primary(): ExpressionAST.Expression {
    if (this.match(TokenType.FALSE)) return new ExpressionAST.Literal(false);
    if (this.match(TokenType.TRUE)) return new ExpressionAST.Literal(true);
    if (this.match(TokenType.NIL)) return new ExpressionAST.Literal(null);

    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new ExpressionAST.Literal(this.previous().literal);
    }

    if (this.match(TokenType.IDENTIFIER))
      return new ExpressionAST.Variable(this.previous());

    if (this.match(TokenType.LEFT_PAREN)) {
      const expression = this.expression();
      this.consume(TokenType.RIGHT_PAREN, 'Expected ")" after expression.');

      return new ExpressionAST.Grouping(expression);
    }

    throw this.error(this.peek(), 'Expected expression.');
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      // eslint-disable-next-line default-case
      switch (this.peek().type) {
        case TokenType.CLASS:
        case TokenType.FUN:
        case TokenType.VAR:
        case TokenType.FOR:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.PRINT:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}
