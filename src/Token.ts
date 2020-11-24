import { TokenType } from './TokenType';

export class Token {
  public type: TokenType;
  public lexeme: string;
  public literal: unknown;
  public line: number;

  public constructor(
    type: TokenType,
    lexeme: string,
    literal: unknown,
    line: number,
  ) {
    this.type = type;
    this.lexeme = lexeme;
    this.literal = literal;
    this.line = line;
  }

  public toString(): string {
    return `${this.type} ${this.lexeme} ${this.literal}`;
  }
}
