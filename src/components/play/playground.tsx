import { useState } from "preact/hooks"

export function SearchPlayground() {
  const [root, setRoot] = useState<Group>([{
    occur: '',
    node:createClauseNode({specifier: 'todo specifier', value: 'todo value'})
  }])

  return (
    <Group group={root} onChange={setRoot} />
  )
}

type Group = GroupEntry[]

type GroupProps = {
  group: Group
  onChange: (group: Group) => void
}

function Group({ group, onChange }: GroupProps) {
  return (
    <div style={{ border: '1px solid red', padding: 5 }}>
      {group.map((entry, index) => (
        <GroupEntry
          key={index}
          entry={entry}
          onChange={entry => {
            const newGroup = [...group]
            newGroup[index] = entry
            onChange(newGroup)
          }}
        />
      ))}

      <button onClick={() => onChange([...group, { occur: '', node: createClauseNode() }])}>add clause</button>
      <button onClick={() => onChange([...group, { occur: '', node: createGroupNode() }])}>add group</button>
    </div>
  )
}

type GroupEntry = {
  occur: Occur,
  node: Node
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

type NodeProps = {
  node: Node
  onChange: (node: Node) => void
}

function Node({ node, onChange }: NodeProps) {
  switch (node.type) {
    case 'clause': {
      return <Clause clause={node.clause} onChange={clause => onChange({ type: 'clause', clause })} />
    }
    case "group": {
      return <Group group={node.group} onChange={group => onChange({ type: 'group', group })} />
    }
    default: throw new UnreachableException(node)
  }
}

const OCCUR = ['', '+', '-'] as const
type Occur = (typeof OCCUR)[number]

type OccurProps = {
  occur: Occur,
  onChange: (occur: Occur) => void
}

function Occur({ occur, onChange }: OccurProps) {
  // TODO: would be nice to include meaningful text with these, without it
  // bleeding into the idle state
  return (
    <select
      value={occur}
      onChange={event => onChange(event.currentTarget.value as Occur)}
    >
      {OCCUR.map(occur => (
        <option key={occur} value={occur}>{occur}</option>
      ))}
    </select>
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

type OperationProps = {
  operation: Operation,
  onChange: (operation: Operation) => void
}

function Operation({ operation, onChange }: OperationProps) {
  // TODO: would be nice to include meaningful text with these, without it
  // bleeding into the idle state
  return (
    <select
      value={operation}
      onChange={event => onChange(event.currentTarget.value as Operation)}
    >
      {OPERATIONS.map(operation => (
        <option key={operation} value={operation}>{operation}</option>
      ))}
    </select>
  )
}

type Value = string

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

class UnreachableException {
  constructor(_value: never) { }
}
