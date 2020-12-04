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
    if (this.match(TokenType.LEFT_BRACE))
      return new StatementAST.Block(this.block());
    if (this.match(TokenType.IF)) return this.ifStatement();

    return this.expressionStatement();
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
      if (this.match(TokenType.VAR)) return this.varDeclaration();

      return this.statement();
    } catch (err) {
      this.synchronize();
      return null;
    }
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

    return this.primary();
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
