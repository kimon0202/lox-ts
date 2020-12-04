import path from 'path';

import { defineAST } from './generateAST';

const outputDir = process.argv[2];

defineAST(
  path.resolve(outputDir, 'statements.ts'),
  'Statement',
  [
    'Block | statements: Statement[]',
    'Expression | expression: ExpressionAST.Expression',
    'If | condition: ExpressionAST.Expression, thenBranch: Statement, elseBranch: Statement',
    'Print | expression: ExpressionAST.Expression',
    'Var | name: Token, initializer: ExpressionAST.Expression',
  ],
  `import { ExpressionAST } from './ast';
  import { Token } from '../Token';`,
);
