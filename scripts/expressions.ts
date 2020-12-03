import path from 'path';

import { defineAST } from './generateAST';

const outpurDir = process.argv[2];

defineAST(
  path.resolve(outpurDir, 'ast.ts'),
  'Expression',
  [
    'Binary | left: Expression, operator: Token, right: Expression',
    'Grouping | expression: Expression',
    'Literal | value: unknown',
    'Unary | operator: Token, right: Expression',
  ],
  "import { Token } from '../Token';",
);
