/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-namespace */
import { ExpressionAST } from './ast';
import { Token } from '../Token';

export namespace StatementAST {
  export interface Visitor<Type> {
    visitBlockStatement(statement: Block): Type;
    visitExpressionStatement(statement: Expression): Type;
    visitIfStatement(statement: If): Type;
    visitPrintStatement(statement: Print): Type;
    visitVarStatement(statement: Var): Type;
  }

  export abstract class Statement {
    public abstract accept<Type>(visitor: Visitor<Type>): Type;
  }

  export class Block extends Statement {
    public statements: Statement[];

    public constructor(statements: Statement[]) {
      super();
      this.statements = statements;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitBlockStatement(this);
    }
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

  export class If extends Statement {
    public condition: ExpressionAST.Expression;
    public thenBranch: Statement;
    public elseBranch: Statement | null;

    public constructor(
      condition: ExpressionAST.Expression,
      thenBranch: Statement,
      elseBranch: Statement | null,
    ) {
      super();
      this.condition = condition;
      this.thenBranch = thenBranch;
      this.elseBranch = elseBranch;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitIfStatement(this);
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

  export class Var extends Statement {
    public name: Token;
    public initializer: ExpressionAST.Expression;

    public constructor(name: Token, initializer: ExpressionAST.Expression) {
      super();
      this.name = name;
      this.initializer = initializer;
    }

    public accept<Type>(visitor: Visitor<Type>): Type {
      return visitor.visitVarStatement(this);
    }
  }
}
