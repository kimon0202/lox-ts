import { promises } from 'fs';
import { resolve } from 'path';

const { writeFile } = promises;

function defineVisitor(baseName: string, types: string[]): string {
  const visitorMethodsContent = types
    .map(type => {
      const typeName = type.split('|')[0].trim();
      return `visit${typeName}${baseName}(${baseName.toLowerCase()}: ${typeName}): Type;`;
    })
    .join('\n');

  return `export interface Visitor<Type> {
    ${visitorMethodsContent}
  }`;
}

function defineBase(name: string): string {
  return `export abstract class ${name} {
    public abstract accept<Type>(visitor: Visitor<Type>): Type;
  }`;
}

export async function defineAST(
  dir: string,
  baseName: string,
  types: string[],
  imports: string,
): Promise<void> {
  const interfaceVisitorContent = defineVisitor(baseName, types);
  const baseContent = defineBase(baseName);

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

      return `export class ${className} extends ${baseName} {
      ${initContent}

      public constructor(${fieldsList.join(', ')}) {
        super();
        ${constructorContent}
      }

      public accept<Type>(visitor: Visitor<Type>): Type {
        return visitor.visit${className}${baseName}(this);
      }
    }`;
    })
    .join('\n\n');

  const content = `
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-namespace */
${imports}

export namespace ${baseName}AST {
  ${interfaceVisitorContent}

  ${baseContent}

  ${astNodesContent}
}`;

  await writeFile(dir, content, { encoding: 'utf-8' });
}
