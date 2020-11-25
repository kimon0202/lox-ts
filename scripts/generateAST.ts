import { promises } from 'fs';
import { resolve } from 'path';

const { writeFile } = promises;

const args = process.argv;
const outpurDir = args[2];

function defineImports(): string {
  return `import { Token } from '../Token';`;
}

function defineVisitor(types: string[]): string {
  const visitorMethodsContent = types
    .map(type => {
      const typeName = type.split('|')[0].trim();
      return `visit${typeName}Expression(expression: ${typeName}): Type;`;
    })
    .join('\n');

  return `export interface Visitor<Type> {
    ${visitorMethodsContent}
  }`;
}

function defineExpression(): string {
  return `export abstract class Expression {
    public abstract accept<Type>(visitor: Visitor<Type>): Type;
  }`;
}

async function defineAST(dir: string, types: string[]) {
  const interfaceVisitorContent = defineVisitor(types);
  const importContnet = defineImports();
  const expressionContent = defineExpression();

  const path = resolve(dir, 'ast.ts');

  const astNodesContent = types
    .map(type => {
      const className = type.split('|')[0].trim();
      const fieldsList = type.split('|')[1].trim().split(', ');

      const initContent = fieldsList.map(field => `public ${field}`).join('\n');
      const constructorContent = fieldsList
        .map(field => {
          const varName = field.split(':')[0].trim();
          return `this.${varName} = ${varName};`;
        })
        .join('\n');

      return `export class ${className} extends Expression {
      ${initContent}

      public constructor(${fieldsList.join(', ')}) {
        super();
        ${constructorContent}
      }

      public accept<Type>(visitor: Visitor<Type>): Type {
        return visitor.visit${className}Expression(this);
      }
    }`;
    })
    .join('\n\n');

  const content = `
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-namespace */
${importContnet}

export namespace AST {
  ${interfaceVisitorContent}

  ${expressionContent}

  ${astNodesContent}
}`;

  await writeFile(path, content, { encoding: 'utf-8' });
}

defineAST(outpurDir, [
  'Binary | left: Expression, operator: Token, right: Expression',
  'Grouping | expression: Expression',
  'Literal | value: unknown',
  'Unary | operator: Token, right: Expression',
]);
