/* eslint-disable import/no-cycle */
import { Interpreter } from '../Interpreter';

export abstract class LoxCallable {
  abstract call(interpreter: Interpreter, args: unknown[]): unknown;

  abstract get arity(): number;
}
