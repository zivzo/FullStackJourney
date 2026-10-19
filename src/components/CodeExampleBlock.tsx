import type { CodeExample } from '../data/skills'
import { InlineText } from './InlineText'

export function CodeExampleBlock({ example }: { example: CodeExample }) {
  return (
    <figure className="code-example">
      <figcaption>
        <h3>{example.title}</h3>
        <span className="code-lang">{example.language}</span>
      </figcaption>
      {example.description && (
        <p>
          <InlineText text={example.description} />
        </p>
      )}
      <pre className="code-block">
        <code>{example.code}</code>
      </pre>
    </figure>
  )
}
