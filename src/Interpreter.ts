/* eslint-disable import/no-cycle */
import { ExpressionAST } from './ast/ast';
import { StatementAST } from './ast/statements';
import { RuntimeError } from './errors/RuntimeError';
import Lox from './Lox';
import { Token, TokenType } from './Token';
import { Environment } from './Environment';

export class Interpreter
  implements ExpressionAST.Visitor<unknown>, StatementAST.Visitor<void> {
  private environment = new Environment();

  public interpret(statements: StatementAST.Statement[]): void {
    try {
      for (let i = 0; i < statements.length; i++) {
        this.execute(statements[i]);
      }
    } catch (err) {
      if (err instanceof RuntimeError) Lox.runtimeError(err);
    }
  }

  private execute(statement: StatementAST.Statement): void {
    statement.accept(this);
  }

  private executeBlock(
    statements: StatementAST.Statement[],
    environment: Environment,
  ): void {
    const previous = this.environment;
    try {
      this.environment = environment;

      for (let i = 0; i < statements.length; i++) {
        this.execute(statements[i]);
      }
    } finally {
      this.environment = previous;
    }
  }

  // TODO: change the stringification method to reflect all possible options
  private stringify(value: unknown): string {
    if (value === null) return 'nil';
    return String(value);
  }

  private evaluate(expression: ExpressionAST.Expression): unknown {
    return expression.accept(this);
  }

  private isTruthy(object: unknown): boolean {
    if (object === null) return false;
    if (typeof object === 'boolean') return object as boolean;

    return true;
  }

  private isEqual(left: unknown, right: unknown): boolean {
    if (left === null && right === null) return true;
    if (left === null) return false;

    return left === right;
  }

  private checkNumberOperand(operator: Token, operand: unknown): void {
    if (typeof operand === 'number') return;
    throw new RuntimeError(operator, 'Operand must be a number.');
  }

  private checkNumberOperands(
    operator: Token,
    right: unknown,
    left: unknown,
  ): void {
    if (typeof right === 'number' && typeof left === 'number') return;
    throw new RuntimeError(operator, 'Operands must be numbers.');
  }

  public visitBinaryExpression(expression: ExpressionAST.Binary): unknown {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.MINUS:
        this.checkNumberOperand(expression.operator, right);
        return (left as number) - (right as number);
      case TokenType.SLASH:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) / (right as number);
      case TokenType.STAR:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) * (right as number);
      case TokenType.PLUS: {
        if (typeof left === 'number' && typeof right === 'number')
          return (left as number) + (right as number);

        if (typeof left === 'string' && typeof right === 'string')
          return (left as string) + (right as string);

        throw new RuntimeError(
          expression.operator,
          'Operands must be two numbers or two strings.',
        );
      }
      case TokenType.GREATER:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) >= (right as number);
      case TokenType.LESS:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
        this.checkNumberOperands(expression.operator, right, left);
        return (left as number) <= (right as number);
      case TokenType.BANG_EQUAL:
        return !this.isEqual(left, right);
      case TokenType.EQUAL_EQUAL:
        return this.isEqual(left, right);
      default:
        return null;
    }
  }

  public visitGroupingExpression(expression: ExpressionAST.Grouping): unknown {
    return this.evaluate(expression.expression);
  }

  public visitLiteralExpression(expression: ExpressionAST.Literal): unknown {
    return expression.value;
  }

  public visitLogicalExpression(expression: ExpressionAST.Logical): unknown {
    const left = this.evaluate(expression.left);

    if (expression.operator.type === TokenType.OR) {
      if (this.isTruthy(left)) return left;
    } else {
      // eslint-disable-next-line no-lonely-if
      if (!this.isTruthy(left)) return left;
    }

    return this.evaluate(expression.right);
  }

  public visitUnaryExpression(expression: ExpressionAST.Unary): unknown {
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.MINUS:
        return -(right as number);
      case TokenType.BANG:
        return !this.isTruthy(right);
      default:
        return null;
    }
  }

  public visitExpressionStatement(statement: StatementAST.Expression): void {
    this.evaluate(statement.expression);
  }

  public visitPrintStatement(statement: StatementAST.Print): void {
    const value = this.evaluate(statement.expression);
    console.log(this.stringify(value));
  }

  public visitVariableExpression(expression: ExpressionAST.Variable): unknown {
    return this.environment.get(expression.name);
  }

  public visitVarStatement(statement: StatementAST.Var): void {
    let value = null;
    if (statement.initializer) value = this.evaluate(statement.initializer);

    this.environment.define(statement.name.lexeme, value);
  }

  public visitAssignExpression(expression: ExpressionAST.Assign): unknown {
    const value = this.evaluate(expression.value);
    this.environment.assign(expression.name, value);

    return value;
  }

  public visitBlockStatement(statement: StatementAST.Block): void {
    this.executeBlock(statement.statements, new Environment(this.environment));
  }

  public visitIfStatement(statement: StatementAST.If): void {
    if (this.isTruthy(this.evaluate(statement.condition)))
      this.execute(statement.thenBranch);
    else if (statement.elseBranch) this.execute(statement.elseBranch);
  }

  public visitWhileStatement(statement: StatementAST.While): void {
    while (this.isTruthy(this.evaluate(statement.condition))) {
      this.execute(statement.body);
    }
  }
}
