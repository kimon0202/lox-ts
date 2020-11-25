import { Visitor } from './IVisitor';

export abstract class Expression {
  public abstract accept<Type>(visitor: Visitor<Type>): Type;
}
