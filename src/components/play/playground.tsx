import type { JSX } from "preact"
import { useCallback, useState } from "preact/hooks"
import {
  createClauseNode,
  createGroupNode,
  OCCUR,
  OPERATIONS,
  parseQuery,
  parseValue,
  stringifyQuery,
  type Clause,
  type Group,
  type GroupEntry,
  type Node,
  type Occur,
  type Operation,
  type Specifier,
  type Value
} from "./query";
import { UnreachableException } from "./util";
import styles from './playground.module.css'
import clsx from "clsx";

export function SearchPlayground() {
  const [root, setRoot] = useState<Group>([{
    occur: '',
    node: createClauseNode({ specifier: 'todo.specifier', value: '"todo value"' })
  }])

  const stringified = stringifyQuery(root);

  // roumd trip go brr
  const test = parseQuery(stringified)

  return <>
    <Group group={root} onChange={setRoot} />
    <pre><code>{stringified}</code></pre>
    <pre><code>{JSON.stringify(test, undefined, 2)}</code></pre>
  </>
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

type ValueProps = {
  value: Value,
  onChange: (value: Value) => void
}

function Value({ value, onChange }: ValueProps) {
  const invalid = parseValue(value).type === 'err'

  return (
    <input
      value={value}
      onInput={event => onChange(event.currentTarget.value)}
      className={clsx(styles.input, invalid && styles.invalid)}
    />
  )
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

function mustExist<T>(value: T | undefined): T {
  if (value == null) {
    throw new Error('precondition broken')
  }
  return value
}
