import type { JSX } from "preact"
import { useCallback, useState } from "preact/hooks"
import { alt, apply, buildLexer, expectEOF, expectSingleResult, nil, opt, rep, rule, seq, tok } from "typescript-parsec"

export function SearchPlayground() {
  const [root, setRoot] = useState<Group>([{
    occur: '',
    node: createClauseNode({ specifier: 'todo.specifier', value: '"todo value"' })
  }])

  const stringified = stringifyGroup(root, 'root');

  // rouud trip go brr
  const wrapped = `(${stringified})`
  let test;
  try {
    test = expectSingleResult(expectEOF(RULE_GROUP.parse(tokeniser.parse(wrapped))))
  } catch {
    test = 'failed to parse'
  }

  return <>
    <Group group={root} onChange={setRoot} />
    <pre><code>{stringified}</code></pre>
    <pre><code>{JSON.stringify(test, undefined, 2)}</code></pre>
  </>
}

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

type Group = GroupEntry[]

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

type GroupProps = {
  group: Group
  onChange: (group: Group) => void
}

function Group({ group, onChange }: GroupProps) {
  return (
    <div style={{ border: '1px solid red', padding: 5 }}>
      {group.map((entry, index) => <>
        <GroupEntry
          key={index}
          entry={entry}
          onChange={entry => {
            const newGroup = [...group]
            newGroup[index] = entry
            onChange(newGroup)
          }}
        />
        <button onClick={() => onChange([...group.slice(undefined, index), ...group.slice(index + 1)])}>delete</button>
      </>)}

      <button onClick={() => onChange([...group, { occur: '', node: createClauseNode() }])}>add clause</button>
      <button onClick={() => onChange([...group, { occur: '', node: createGroupNode() }])}>add group</button>
    </div>
  )
}

type GroupEntry = {
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

type GroupEntryProps = {
  entry: GroupEntry
  onChange: (entry: GroupEntry) => void
}

function GroupEntry({ entry, onChange }: GroupEntryProps) {
  return (
    <div>
      <Occur occur={entry.occur} onChange={occur => onChange({ ...entry, occur })} />
      <Node node={entry.node} onChange={node => onChange({ ...entry, node })} />
    </div>
  )
}

type Node =
  | { type: 'clause', clause: Clause }
  | { type: 'group', group: Group }

function createClauseNode(clause: Partial<Clause> = {}): Node {
  return { type: 'clause', clause: createClause(clause) }
}

function createGroupNode(group: Group = []): Node {
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

type NodeProps = {
  node: Node
  onChange: (node: Node) => void
}

function Node({ node, onChange }: NodeProps) {
  switch (node.type) {
    case 'clause': return (
      <Clause
        clause={node.clause}
        onChange={clause => onChange({ type: 'clause', clause })}
      />
    )
    case "group": return (
      <Group
        group={node.group}
        onChange={group => onChange({ type: 'group', group })}
      />
    )
    default:
      throw new UnreachableException(node)
  }
}

const OCCUR = ['', '+', '-'] as const
type Occur = (typeof OCCUR)[number]

RULE_OCCUR.setPattern(alt(
  apply(tok(Token.Plus), () => '+' as const),
  apply(tok(Token.Minus), () => '-' as const),
  apply(nil(), () => '' as const),
))

const OCCUR_LABELS: Record<Occur, string> = {
  "": "SHOULD",
  "+": "MUST",
  "-": "MUST NOT"
}

const OCCUR_OPTIONS: SelectOption<Occur>[] = OCCUR
  .map(occur => ({ value: occur, label: OCCUR_LABELS[occur] }))

type OccurProps = {
  occur: Occur,
  onChange: (occur: Occur) => void
}

function Occur({ occur, onChange }: OccurProps) {
  const value = mustExist(OCCUR_OPTIONS.find(option => option.value === occur))
  return (
    <Select
      value={value}
      options={OCCUR_OPTIONS}
      onChange={option => onChange(option.value)}
    />
  )
}

type Clause = {
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

type ClauseProps = {
  clause: Clause
  onChange: (clause: Clause) => void
}

function Clause({ clause, onChange }: ClauseProps) {
  return <>
    <Specifier specifier={clause.specifier} onChange={specifier => onChange({ ...clause, specifier })} />
    <Operation operation={clause.operation} onChange={operation => onChange({ ...clause, operation })} />
    <Value value={clause.value} onChange={value => onChange({ ...clause, value })} />
  </>
}

type Specifier = string

RULE_SPECIFIER.setPattern(apply(tok(Token.Specifier), token => token.text))

type SpecifierProps = {
  specifier: Specifier,
  onChange: (specifier: Specifier) => void
}

function Specifier({ specifier, onChange }: SpecifierProps) {
  return <input
    value={specifier}
    onInput={event => onChange(event.currentTarget.value)}
  />
}

const OPERATIONS = ['=', '~', '>=', '>', '<=', '<'] as const
type Operation = (typeof OPERATIONS)[number]

RULE_OPERATION.setPattern(alt(
  apply(seq(tok(Token.Gt), tok(Token.Eq)), () => '>=' as const),
  apply(seq(tok(Token.Lt), tok(Token.Eq)), () => '<=' as const),
  apply(tok(Token.Gt), () => '>' as const),
  apply(tok(Token.Lt), () => '<' as const),
  apply(tok(Token.Eq), () => '=' as const),
  apply(tok(Token.Tilde), () => '~' as const),
))

const OPERATION_OPTIONS: SelectOption<Operation>[] = OPERATIONS
  .map(operation => ({ label: operation, value: operation }))

type OperationProps = {
  operation: Operation,
  onChange: (operation: Operation) => void
}

function Operation({ operation, onChange }: OperationProps) {
  const value = mustExist(OPERATION_OPTIONS.find(option => option.value === operation))
  return (
    <Select
      value={value}
      options={OPERATION_OPTIONS}
      onChange={option => onChange(option.value)}
    />
  )
}

type Value = string

RULE_VALUE.setPattern(alt(
  apply(tok(Token.Boolean), token => token.text),
  apply(
    seq(opt(tok(Token.Minus)), tok(Token.Number)),
    ([maybeMinus, number]) => `${maybeMinus?.text ?? ''}${number.text}`
  ),
  apply(tok(Token.String), token => token.text),
))

type ValueProps = {
  value: Value,
  onChange: (value: Value) => void
}

function Value({ value, onChange }: ValueProps) {
  return <input
    value={value}
    onInput={event => onChange(event.currentTarget.value)}
  />
}

type SelectOption<T extends string> = {
  value: T
  // TODO: would be nice to include descriptive content in the label
  label: string
}

type SelectProps<T extends string> = {
  value: SelectOption<T>,
  options: SelectOption<T>[],
  onChange: (operation: SelectOption<T>) => void
}

function Select<T extends string>({ value, options, onChange }: SelectProps<T>) {
  const onSelectChange = useCallback((event: JSX.TargetedEvent<HTMLSelectElement>) => {
    const newValue = event.currentTarget.value as T
    const newOption = mustExist(options.find(option => option.value === newValue))
    onChange(newOption)
  }, [options, onChange])

  // TODO: would be nice to include meaningful text with these, without it
  // bleeding into the idle state
  return (
    <select
      value={value.value}
      onChange={onSelectChange}
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  )
}

class UnreachableException {
  constructor(_value: never) { }
}

function mustExist<T>(value: T | undefined): T {
  if (value == null) {
    throw new Error('precondition broken')
  }
  return value
}
