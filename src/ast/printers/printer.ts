import { AST } from '../ast';

export class AstPrinter implements AST.Visitor<string> {
  public print(expression: AST.Expression): string {
    const str = expression.accept(this);
    console.log(str);
    console.log('');

    return str;
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
