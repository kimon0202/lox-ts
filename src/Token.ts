/* eslint-disable no-shadow */
export interface TokenPosition {
  readonly line: number;
  readonly column: number;
}

export interface Token {
  readonly type: TokenType;
  readonly lexeme: string;
  readonly literal: unknown;
  readonly position: TokenPosition;
}

export enum TokenType {
  // Single-character tokens.
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two character tokens.
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals.
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords.
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUN,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  EOF,
}

export const token = (
  type: TokenType,
  lexeme: string,
  literal: unknown,
  position: TokenPosition,
): Token => ({
  lexeme,
  literal,
  type,
  position,
});

// export class Token {
//   public _type: TokenType;
//   public _lexeme: string;
//   public _literal: unknown;
//   public _line: number;

//   public constructor(
//     type: TokenType,
//     lexeme: string,
//     literal: unknown,
//     line: number,
//   ) {
//     this._type = type;
//     this._lexeme = lexeme;
//     this._literal = literal;
//     this._line = line;
//   }

//   public toString(): string {
//     return `${this.type} ${this.lexeme} ${this.literal}`;
//   }

//   public get type(): TokenType {
//     return this._type;
//   }

//   public get lexeme(): string {
//     return this._lexeme;
//   }

//   public get literal(): unknown {
//     return this._literal;
//   }

//   public get line(): number {
//     return this._line;
//   }
// }
