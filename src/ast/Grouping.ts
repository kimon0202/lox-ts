import { Expression } from './Expression';
import { Visitor } from './IVisitor';

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
