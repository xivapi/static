import { useState } from "preact/hooks"
import {
  createClauseNode,
  parseQuery,
  stringifyQuery,
  type Group,
} from "./query";
import { Editor } from "./editor";

export function SearchPlayground() {
  const [root, setRoot] = useState<Group>([{
    occur: '',
    node: createClauseNode({ specifier: 'todo.specifier', value: '"todo value"' })
  }])

  const stringified = stringifyQuery(root);

  // roumd trip go brr
  const test = parseQuery(stringified)

  return <>
    <div className="not-content">
      <Editor group={root} onChange={setRoot} />
    </div>

    <pre><code>{stringified}</code></pre>
    <pre><code>{JSON.stringify(test, undefined, 2)}</code></pre>
  </>
}
