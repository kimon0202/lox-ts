/* eslint-disable import/no-cycle */
// TODO: remove dependencies cycle
import { Binary } from './Binary';
import { Grouping } from './Grouping';
import { Literal } from './Literal';
import { Unary } from './Unary';

export interface Visitor<Type> {
  visitBinaryExpression(expression: Binary): Type;
  visitGroupingExpression(expression: Grouping): Type;
  visitLiteralExpression(expression: Literal): Type;
  visitUnaryExpression(expression: Unary): Type;
}
