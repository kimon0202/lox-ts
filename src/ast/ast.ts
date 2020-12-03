/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-namespace */
import { Token } from '../Token';

export namespace ExpressionAST {
  export interface Visitor<Type> {
    visitBinaryExpression(expression: Binary): Type;
    visitGroupingExpression(expression: Grouping): Type;
    visitLiteralExpression(expression: Literal): Type;
    visitUnaryExpression(expression: Unary): Type;
  }

  export abstract class Expression {
    public abstract accept<Type>(visitor: Visitor<Type>): Type;
  }

  export class Binary extends Expression {
    public left: Expression;
    public operator: Token;
    public right: Expression;

    public constructor(left: Expression, operator: Token, right: Expression) {
      super();
      this.left = left;
      this.operator = operator;
      this.right = right;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitBinaryExpression(this);
    }
  }

  export class Grouping extends Expression {
    public expression: Expression;

    public constructor(expression: Expression) {
      super();
      this.expression = expression;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitGroupingExpression(this);
    }
  }

  export class Literal extends Expression {
    public value: unknown;

    public constructor(value: unknown) {
      super();
      this.value = value;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitLiteralExpression(this);
    }
  }

  export class Unary extends Expression {
    public operator: Token;
    public right: Expression;

    public constructor(operator: Token, right: Expression) {
      super();
      this.operator = operator;
      this.right = right;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitUnaryExpression(this);
    }
  }
}
