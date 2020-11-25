import { Expression } from './Expression';
import { Token } from '../Token';
import { Visitor } from './IVisitor';

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
