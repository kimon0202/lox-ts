import { promises } from 'fs';
import { resolve } from 'path';

const { writeFile } = promises;

const args = process.argv;
const outpurDir = args[2];

function defineVisitor(types: string[]): string {
  const visitorMethodsContent = types
    .map(type => {
      const typeName = type.split('|')[0].trim();
      return `visit${typeName}Expression(expression: ${typeName}): Type;`;
    })
    .join('\n');

  const importContent = types
    .map(type => {
      const name = type.split('|')[0].trim();
      return `import { ${name} } from './${name}';`;
    })
    .join('\n');

  return `${importContent}

  export interface Visitor<Type> {
    ${visitorMethodsContent}
  }`;
}

async function defineAST(dir: string, types: string[]) {
  const visitor = defineVisitor(types);
  const visitorPath = resolve(dir, 'IVisitor.ts');

  await writeFile(visitorPath, visitor, { encoding: 'utf8' });

  types.forEach(async type => {
    const fileName = type.split('|')[0].trim();
    const fields = type.split('|')[1].trim();

    const path = resolve(dir, `${fileName}.ts`);

    const fieldSets = fields.split(', ');
    const fieldSetsContent = fieldSets
      .map(field => {
        const name = field.split(':')[0].trim();
        return `this.${name} = ${name};`;
      })
      .join('\n');

    const fieldsInitContent = fieldSets
      .map(field => `public ${field};`)
      .join('\n');

    const content = `import { Expression } from './Expression';
    import { Token } from '../Token';
    import { Visitor } from './IVisitor';

    export class ${fileName} extends Expression {
      ${fieldsInitContent}

      public constructor(${fields}) {
        super();
        ${fieldSetsContent}
      }

      public accept<Type>(visitor: Visitor<Type>): Type {
        return visitor.visit${fileName}Expression(this);
      }
    }`;

    await writeFile(path, content, { encoding: 'utf-8' });
  });
}

defineAST(outpurDir, [
  'Binary | left: Expression, operator: Token, right: Expression',
  'Grouping | expression: Expression',
  'Literal | value: unknown',
  'Unary | operator: Token, right: Expression',
]);
