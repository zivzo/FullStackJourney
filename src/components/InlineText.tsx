import { Fragment } from 'react'

/** Renders text, turning `backtick` spans into <code> elements. */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {text.split('`').map((part, index) =>
        index % 2 === 1 ? <code key={index}>{part}</code> : <Fragment key={index}>{part}</Fragment>,
      )}
    </>
  )
}
