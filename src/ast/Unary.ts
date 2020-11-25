import { Expression } from './Expression';
import { Token } from '../Token';
import { Visitor } from './IVisitor';

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
