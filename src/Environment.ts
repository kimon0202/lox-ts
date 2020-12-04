import { Token } from './Token';
import { RuntimeError } from './errors/RuntimeError';

export class Environment {
  public enclosing: Environment | null;

  private values: Map<string, unknown> = new Map();

  public constructor(enclosing?: Environment) {
    if (enclosing) this.enclosing = enclosing;
    else this.enclosing = null;
  }

  public get(name: Token): unknown {
    if (this.values.has(name.lexeme)) return this.values.get(name.lexeme);
    if (this.enclosing) return this.enclosing.get(name);

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }

  public define(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  public assign(name: Token, value: unknown): void {
    if (this.values.has(name.lexeme)) {
      this.values.set(name.lexeme, value);
      return;
    }

    if (this.enclosing) {
      this.enclosing.assign(name, value);
      return;
    }

    throw new RuntimeError(name, `Undefined variable ${name.lexeme}.`);
  }
}
