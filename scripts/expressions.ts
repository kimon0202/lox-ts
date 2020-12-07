import path from 'path';

import { defineAST } from './generateAST';

const outpurDir = process.argv[2];

defineAST(
  path.resolve(outpurDir, 'ast.ts'),
  'Expression',
  [
    'Assign ^ name: Token, value: Expression',
    'Binary ^ left: Expression, operator: Token, right: Expression',
    'Call ^ callee: Expression, paren: Token, args: Expression[]',
    'Grouping ^ expression: Expression',
    'Literal ^ value: unknown',
    'Logical ^ left: Expression, operator: Token, right: Expression',
    'Unary ^ operator: Token, right: Expression',
    'Variable ^ name: Token',
  ],
  "import { Token } from '../Token';",
);
