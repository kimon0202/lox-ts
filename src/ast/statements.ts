/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-namespace */
import { ExpressionAST } from './ast';

export namespace StatementAST {
  export interface Visitor<Type> {
    visitExpressionStatement(statement: Expression): Type;
    visitPrintStatement(statement: Print): Type;
  }

  export abstract class Statement {
    public abstract accept<Type>(visitor: Visitor<Type>): Type;
  }

  export class Expression extends Statement {
    public expression: ExpressionAST.Expression;

    public constructor(expression: ExpressionAST.Expression) {
      super();
      this.expression = expression;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitExpressionStatement(this);
    }
  }

  export class Print extends Statement {
    public expression: ExpressionAST.Expression;

    public constructor(expression: ExpressionAST.Expression) {
      super();
      this.expression = expression;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitPrintStatement(this);
    }
  }
}
