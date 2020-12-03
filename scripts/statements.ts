import path from 'path';

import { defineAST } from './generateAST';

const outputDir = process.argv[2];

defineAST(
  path.resolve(outputDir, 'statements.ts'),
  'Statement',
  [
    'Expression | expression: ExpressionAST.Expression',
    'Print | expression: ExpressionAST.Expression',
  ],
  `import { ExpressionAST } from './ast';`,
);
