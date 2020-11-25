import { Expression } from './Expression';
import { Visitor } from './IVisitor';

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
