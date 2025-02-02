import { alt, apply, buildLexer, expectEOF, expectSingleResult, nil, opt, rep, rule, seq, tok } from "typescript-parsec";
import { UnreachableException } from "./util";

export function parseQuery(input: string): Group {
  let wrapped = input;
  if (!input.startsWith('(')) {
    wrapped = `(${wrapped})`
  }

  return expectSingleResult(expectEOF(RULE_GROUP.parse(tokeniser.parse(wrapped))))
}

export function stringifyQuery(root: Group): string {
  return stringifyGroup(root, 'root')
}

// -----
// #region Parsing support
// -----

enum Token {
  Plus,
  Minus,
  Whitespace,
  Specifier,
  Ampersand,
  BracketOpen,
  BracketClose,
  ParenOpen,
  ParenClose,
  Eq,
  Gt,
  Lt,
  Tilde,
  Boolean,
  Number,
  String,
}

const tokeniser = buildLexer([
  [true, /^\+/g, Token.Plus],
  [true, /^-/g, Token.Minus],
  [false, /^\s+/g, Token.Whitespace],
  // NOTE: This is an intentional simplification - modelling the full query
  // behavior of relation operations I feel risks exposing functionality I'm not
  // convinced is stable yet.
  [true, /^[\w.@\[\]]+/g, Token.Specifier],
  [true, /^\(/g, Token.ParenOpen],
  [true, /^\)/g, Token.ParenClose],
  [true, /^=/g, Token.Eq],
  [true, /^>/g, Token.Gt],
  [true, /^</g, Token.Lt],
  [true, /^~/g, Token.Tilde],
  [true, /^true|false/g, Token.Boolean],
  // NOTE: Omitting exponents for the sake of my own sanity for now.
  [true, /^\d+(\.\d+)?/g, Token.Number],
  [true, /^"(?:\\"|\\\\|[^"\\])+"/g, Token.String],
])

const RULE_GROUP = rule<Token, Group>();
const RULE_GROUP_ENTRY = rule<Token, GroupEntry>();
const RULE_NODE = rule<Token, Node>();
const RULE_OCCUR = rule<Token, Occur>();
const RULE_CLAUSE = rule<Token, Clause>();
const RULE_SPECIFIER = rule<Token, Specifier>();
const RULE_OPERATION = rule<Token, Operation>();
const RULE_VALUE = rule<Token, Value>();

// -----
// #endregion
// #region Group
// -----

export type Group = GroupEntry[]

RULE_GROUP.setPattern(apply(
  seq(
    tok(Token.ParenOpen),
    rep(RULE_GROUP_ENTRY),
    tok(Token.ParenClose)
  ),
  ([_open, entries, _close]) => entries
))

function stringifyGroup(group: Group, position: 'root' | 'child' = 'child'): string {
  const content = group.map(stringifyGroupEntry).join(' ')
  return position === 'root' ? content : `(${content})`
}

// -----
// #endregion
// #region Group Entry
// -----

export type GroupEntry = {
  occur: Occur,
  node: Node
}

RULE_GROUP_ENTRY.setPattern(apply(
  seq(RULE_OCCUR, RULE_NODE),
  ([occur, node]) => ({ occur, node })
))

function stringifyGroupEntry({ occur, node }: GroupEntry): string {
  return `${occur}${stringifyNode(node)}`
}

// -----
// #endregion
// #region Node
// -----

export type Node =
  | { type: 'clause', clause: Clause }
  | { type: 'group', group: Group }

export function createClauseNode(clause: Partial<Clause> = {}): Node {
  return { type: 'clause', clause: createClause(clause) }
}

export function createGroupNode(group: Group = []): Node {
  return { type: 'group', group }
}

RULE_NODE.setPattern(alt(
  apply(RULE_CLAUSE, clause => ({ type: 'clause', clause })),
  apply(RULE_GROUP, group => ({ type: 'group', group })),
))

function stringifyNode(node: Node): string {
  switch (node.type) {
    case 'clause': return stringifyClause(node.clause)
    case 'group': return stringifyGroup(node.group)
    default: throw new UnreachableException(node)
  }
}

// -----
// #endregion
// #region Occur
// -----

export const OCCUR = ['', '+', '-'] as const
export type Occur = (typeof OCCUR)[number]

RULE_OCCUR.setPattern(alt(
  apply(tok(Token.Plus), () => '+' as const),
  apply(tok(Token.Minus), () => '-' as const),
  apply(nil(), () => '' as const),
))

// -----
// #endregion
// #region Clause
// -----

export type Clause = {
  specifier: Specifier,
  operation: Operation,
  value: Value,
}

function createClause(clause: Partial<Clause> = {}): Clause {
  return {
    specifier: '',
    operation: '=',
    value: '',
    ...clause
  }
}

RULE_CLAUSE.setPattern(apply(
  seq(RULE_SPECIFIER, RULE_OPERATION, RULE_VALUE),
  ([specifier, operation, value]) => ({ specifier, operation, value })
))

function stringifyClause({ specifier, operation, value }: Clause): string {
  return `${specifier}${operation}${value}`
}

// -----
// #endregion
// #region Specifier
// -----

export type Specifier = string

RULE_SPECIFIER.setPattern(apply(tok(Token.Specifier), token => token.text))

// -----
// #endregion
// #region Operation
// -----

export const OPERATIONS = ['=', '~', '>=', '>', '<=', '<'] as const
export type Operation = (typeof OPERATIONS)[number]

RULE_OPERATION.setPattern(alt(
  apply(seq(tok(Token.Gt), tok(Token.Eq)), () => '>=' as const),
  apply(seq(tok(Token.Lt), tok(Token.Eq)), () => '<=' as const),
  apply(tok(Token.Gt), () => '>' as const),
  apply(tok(Token.Lt), () => '<' as const),
  apply(tok(Token.Eq), () => '=' as const),
  apply(tok(Token.Tilde), () => '~' as const),
))

// -----
// #endregion
// #region Value
// -----

export type Value = string

RULE_VALUE.setPattern(alt(
  apply(tok(Token.Boolean), token => token.text),
  apply(
    seq(opt(tok(Token.Minus)), tok(Token.Number)),
    ([maybeMinus, number]) => `${maybeMinus?.text ?? ''}${number.text}`
  ),
  apply(tok(Token.String), token => token.text),
))

// -----
// #endregion
// -----
