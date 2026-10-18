import { useRef, type KeyboardEvent } from 'react'

interface CodeEditorProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

const INDENT = '  '

/** Inserts text at the cursor, keeping the browser's undo history when possible. */
function insertText(textarea: HTMLTextAreaElement, text: string, onChange: (value: string) => void) {
  // execCommand is deprecated but is still the only way to keep native undo/redo working.
  const succeeded = text
    ? document.execCommand('insertText', false, text)
    : document.execCommand('delete', false)
  if (!succeeded) {
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, 'end')
    onChange(textarea.value)
  }
}

/**
 * A lightweight code editor built on a textarea: Tab indents, Enter keeps the
 * current indentation, and Escape followed by Tab moves focus out of the editor.
 */
export function CodeEditor({ id, label, value, onChange }: CodeEditorProps) {
  const escapePressed = useRef(false)

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    const textarea = event.currentTarget

    if (event.key === 'Escape') {
      escapePressed.current = true
      return
    }
    const releaseFocus = escapePressed.current
    escapePressed.current = false
    if (event.ctrlKey || event.metaKey || event.altKey) return

    if (event.key === 'Tab' && !releaseFocus) {
      event.preventDefault()
      const { selectionStart, selectionEnd } = textarea
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1

      if (event.shiftKey) {
        const removable = value.slice(lineStart, lineStart + INDENT.length).match(/^ {1,2}/)?.[0]
        if (!removable) return
        textarea.setSelectionRange(lineStart, lineStart + removable.length)
        insertText(textarea, '', onChange)
        const shift = removable.length
        textarea.setSelectionRange(
          Math.max(lineStart, selectionStart - shift),
          Math.max(lineStart, selectionEnd - shift),
        )
      } else {
        insertText(textarea, INDENT, onChange)
      }
      return
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      const lineStart = value.lastIndexOf('\n', textarea.selectionStart - 1) + 1
      const indentation = value.slice(lineStart).match(/^[ \t]*/)?.[0] ?? ''
      const before = value.slice(lineStart, textarea.selectionStart).trimEnd()
      const opensBlock = /[{[(]$/.test(before) || /<[a-zA-Z][^>/]*>$/.test(before)
      event.preventDefault()
      insertText(textarea, `\n${indentation}${opensBlock ? INDENT : ''}`, onChange)
    }
  }

  return (
    <textarea
      id={id}
      className="code-editor"
      aria-label={label}
      aria-describedby={`${id}-help`}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={handleKeyDown}
      spellCheck={false}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      wrap="off"
    />
  )
}
