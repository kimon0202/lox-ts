import path from 'path';

import { defineAST } from './generateAST';

const outpurDir = process.argv[2];

defineAST(
  path.resolve(outpurDir, 'ast.ts'),
  'Expression',
  [
    'Assign | name: Token, value: Expression',
    'Binary | left: Expression, operator: Token, right: Expression',
    'Grouping | expression: Expression',
    'Literal | value: unknown',
    'Unary | operator: Token, right: Expression',
    'Variable | name: Token',
  ],
  "import { Token } from '../Token';",
);
