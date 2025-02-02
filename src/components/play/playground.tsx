import { useId, useRef, useState } from "preact/hooks"
import {
  createClauseNode,
  parseQuery,
  stringifyQuery,
  type Group,
} from "./query";
import { Editor } from "./editor";
import styles from './playground.module.css'
import { CopyIcon, SendHorizontalIcon } from "lucide-preact";

export function SearchPlayground() {
  const [sheets, setSheets] = useState<string>('')

  const [root, setRoot] = useState<Group>([])

  const [response, setResponse] = useState<string>()

  const stringified = encodeURIComponent(stringifyQuery(root));
  const url = `/api/1/search?sheets=${sheets}&query=${stringified}`

  const abortController = useRef<AbortController>()
  const onSend = () => {
    if (abortController.current != null) {
      console.log('abort!')
      abortController.current.abort()
    }

    const controller = new AbortController();
    abortController.current = controller;
    fetch(url, { signal: controller.signal })
      .then(response => response.json())
      .then(
        response => {
          abortController.current = undefined
          setResponse(JSON.stringify(response, undefined, 2))
        },
        error => {
          // This will presumably be from aborts, log and squash.
          console.error('rejected', error)
        }
      )
  }
  const onCopy = () => {
    void navigator.clipboard.writeText(url)
  }

  // roumd trip go brr
  // const test = parseQuery(stringified)

  const sheetsId = useId();

  return (
    <div className={styles.playground}>
      <div className={styles.field}>
        <label for={sheetsId}>Sheets</label>
        <input
          id={sheetsId}
          type="text"
          value={sheets}
          onInput={event => setSheets(event.currentTarget.value)}
        />
      </div>

      <div className={styles.field}>
        <label>Query</label>
        <Editor group={root} onChange={setRoot} />
      </div>

      <div className={styles.url}>
        <button
          className={styles.action}
          onClick={onSend}
        >
          Send&nbsp;<SendHorizontalIcon size="1em" />
        </button>
        <pre className={styles.preview}><code>{url}</code></pre>
        <button
          className={styles.action}
          onClick={onCopy}
        >
          Copy&nbsp;<CopyIcon size="1em" />
        </button>
      </div>

      {response && (
        <pre className={styles.response}><code>{response}</code></pre>
      )}
    </div>
  )
}
