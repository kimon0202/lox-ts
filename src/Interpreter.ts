import { AST } from './ast/ast';
import { TokenType } from './Token';

export class Interpreter implements AST.Visitor<unknown> {
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

  public visitBinaryExpression(expression: AST.Binary): unknown {
    const left = this.evaluate(expression.left);
    const right = this.evaluate(expression.right);

    switch (expression.operator.type) {
      case TokenType.MINUS:
        return (left as number) - (right as number);
      case TokenType.SLASH:
        return (left as number) / (right as number);
      case TokenType.STAR:
        return (left as number) * (right as number);
      case TokenType.PLUS: {
        if (typeof left === 'number' && typeof right === 'number')
          return (left as number) + (right as number);

        if (typeof left === 'string' && typeof right === 'string')
          return (left as string) + (right as string);

        break;
      }
      case TokenType.GREATER:
        return (left as number) > (right as number);
      case TokenType.GREATER_EQUAL:
        return (left as number) >= (right as number);
      case TokenType.LESS:
        return (left as number) < (right as number);
      case TokenType.LESS_EQUAL:
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
