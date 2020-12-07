/* eslint-disable import/no-cycle */
import { StatementAST } from '../ast/statements';
import { Interpreter } from '../Interpreter';
import { LoxCallable } from './LoxCallable';
import { Environment } from '../Environment';
import { Return } from './Return';

export class LoxFunction extends LoxCallable {
  private readonly declaration: StatementAST.LoxFunction;
  private closure: Environment;

  public constructor(
    declaration: StatementAST.LoxFunction,
    closure: Environment,
  ) {
    super();
    this.closure = closure;
    this.declaration = declaration;
  }

  public get arity(): number {
    return this.declaration.params.length;
  }

  public call(interpreter: Interpreter, args: unknown[]): unknown | null {
    const env = new Environment(this.closure);
    args.forEach((arg, index) => {
      env.define(this.declaration.params[index].lexeme, args[index]);
    });

    try {
      interpreter.executeBlock(this.declaration.body, env);
    } catch (returnValue) {
      return (returnValue as Return).value;
    }

    return null;
  }
}
