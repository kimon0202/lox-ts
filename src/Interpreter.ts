import { AST } from './ast/ast';
import { RuntimeError } from './errors/RuntimeError';
import Lox from './Lox';
import { Token, TokenType } from './Token';

export class Interpreter implements AST.Visitor<unknown> {
  public interpret(expression: AST.Expression): void {
    try {
      const value = this.evaluate(expression);
      console.log(this.stringify(value));
      console.log('');
    } catch (err) {
      if (err instanceof RuntimeError) Lox.runtimeError(err);
    }
  }

  // TODO: change the stringification method to reflect all possible options
  private stringify(value: unknown): string {
    if (value === null) return 'nil';
    return String(value);
  }

  private evaluate(expression: AST.Expression): unknown {
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

  public visitBinaryExpression(expression: AST.Binary): unknown {
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

    return null;
  }

  public visitGroupingExpression(expression: AST.Grouping): unknown {
    return this.evaluate(expression.expression);
  }

  public visitLiteralExpression(expression: AST.Literal): unknown {
    return expression.value;
  }

  public visitUnaryExpression(expression: AST.Unary): unknown {
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
}
