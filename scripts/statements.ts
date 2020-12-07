import path from 'path';

import { defineAST } from './generateAST';

const outputDir = process.argv[2];

defineAST(
  path.resolve(outputDir, 'statements.ts'),
  'Statement',
  [
    'Block ^ statements: Statement[]',
    'Expression ^ expression: ExpressionAST.Expression',
    'LoxFunction ^ name: Token, params: Token[], body: Statement[]',
    'If ^ condition: ExpressionAST.Expression, thenBranch: Statement, elseBranch: Statement | null',
    'Print ^ expression: ExpressionAST.Expression',
    'Return ^ keyword: Token, value: ExpressionAST.Expression | null',
    'Var ^ name: Token, initializer: ExpressionAST.Expression',
    'While ^ condition: ExpressionAST.Expression, body: Statement',
  ],
  `import { ExpressionAST } from './ast';
  import { Token } from '../Token';`,
);
