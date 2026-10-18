import { Navbar } from './components/Navbar'
import { findTopic, findTrack } from './data/skills'
import { useHashRoute } from './hooks/useHashRoute'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { TopicPage } from './pages/TopicPage'
import { TrackPage } from './pages/TrackPage'

function renderPage(segments: string[]) {
  const [trackId, topicId, ...rest] = segments
  if (!trackId) return <HomePage />

  const track = findTrack(trackId)
  if (!track || rest.length > 0) return <NotFoundPage />
  if (!topicId) return <TrackPage track={track} />

  const topic = findTopic(track, topicId)
  return topic ? <TopicPage track={track} topic={topic} /> : <NotFoundPage />
}

function App() {
  const segments = useHashRoute()

  return (
    <>
      <Navbar activeTrackId={segments[0]} />
      <main>{renderPage(segments)}</main>
      <footer className="footer">
        <p>FullStackJourney — learning the full stack, one skill at a time.</p>
      </footer>
    </>
  )
}

export default App
