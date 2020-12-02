import { Token } from '../Token';

export class RuntimeError extends Error {
  private _token: Token;

  public constructor(token: Token, message: string) {
    super(message);
    this._token = token;
  }

  public get token(): Token {
    return this._token;
  }
}
