import { AST } from './ast';

export class AstPrinter implements AST.Visitor<string> {
  public print(expression: AST.Expression | null): string {
    console.log('Printing AST...');

    if (expression === null) throw new Error('Impossible to print a null AST.');
    return expression.accept(this);
  }

  public visitBinaryExpression(expression: AST.Binary): string {
    return this.parenthesize(
      expression.operator.lexeme,
      expression.left,
      expression.right,
    );
  }

  public visitGroupingExpression(expression: AST.Grouping): string {
    return this.parenthesize('group', expression.expression);
  }

  public visitLiteralExpression(expression: AST.Literal): string {
    return String(expression.value) || 'nil';
  }

  public visitUnaryExpression(expression: AST.Unary): string {
    return this.parenthesize(expression.operator.lexeme, expression.right);
  }

  private parenthesize(name: string, ...expressions: AST.Expression[]): string {
    return `(${name} ${expressions
      .map(expression => expression.accept(this))
      .join(' ')})`;
  }
}
