import { tools } from '../utils/tools'
import ToolCard from '../components/ToolCard'

function Home({ onNavigate }) {
  return (
    <section className="home">
      <div className="hero">
        <h2>Free Online PDF Tools</h2>
        <p className="subtitle">
          Merge, split, compress and convert your PDF files — free, fast and
          right in your browser.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={onNavigate} />
        ))}
      </div>
    </section>
  )
}

export default Home
