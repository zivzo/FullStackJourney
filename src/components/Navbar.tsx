import { href } from '../hooks/useHashRoute'
import { tracks } from '../data/skills'

interface NavbarProps {
  activeTrackId?: string
}

export function Navbar({ activeTrackId }: NavbarProps) {
  return (
    <header className="navbar">
      <a className="brand" href={href()}>
        FullStack<span>Journey</span>
      </a>
      <nav aria-label="Skill areas">
        <ul>
          {tracks.map((track) => (
            <li key={track.id}>
              <a
                href={href(track.id)}
                aria-current={track.id === activeTrackId ? 'page' : undefined}
              >
                <span aria-hidden="true">{track.icon}</span> {track.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
