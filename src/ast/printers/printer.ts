import { ExpressionAST } from '../ast';

export class AstPrinter implements ExpressionAST.Visitor<string> {
  public print(expression: ExpressionAST.Expression): string {
    const str = expression.accept(this);
    console.log(str);
    console.log('');

    return str;
  }

  public visitBinaryExpression(expression: ExpressionAST.Binary): string {
    return this.parenthesize(
      expression.operator.lexeme,
      expression.left,
      expression.right,
    );
  }

  public visitGroupingExpression(expression: ExpressionAST.Grouping): string {
    return this.parenthesize('group', expression.expression);
  }

  public visitLiteralExpression(expression: ExpressionAST.Literal): string {
    return String(expression.value) || 'nil';
  }

  public visitUnaryExpression(expression: ExpressionAST.Unary): string {
    return this.parenthesize(expression.operator.lexeme, expression.right);
  }

  private parenthesize(
    name: string,
    ...expressions: ExpressionAST.Expression[]
  ): string {
    return `(${name} ${expressions
      .map(expression => expression.accept(this))
      .join(' ')})`;
  }
}
