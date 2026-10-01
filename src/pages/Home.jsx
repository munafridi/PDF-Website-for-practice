import { tools } from '../utils/tools'
import ToolCard from '../components/ToolCard'

function Home({ onNavigate }) {
  return (
    <section className="home">
      <div className="hero">
        <h1>All Your PDF Tools in One Place</h1>
        <p className="subtitle">
          Merge, split, compress, and convert your PDF files — 100% free, fast,
          and secure. Everything happens right in your browser.
        </p>
      </div>

      <div className="tools-grid">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={onNavigate} />
        ))}
      </div>

      <div className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Choose a Tool</h3>
            <p>Select the PDF tool you need from our collection of utilities.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Upload Your File</h3>
            <p>Drag and drop or click to upload your PDF files securely.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Download Result</h3>
            <p>Get your processed PDF instantly. No waiting, no queues.</p>
          </div>
        </div>
      </div>

      <div className="trust-section">
        <div className="trust-grid">
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <h3>100% Private</h3>
            <p>Your files never leave your device. All processing happens locally.</p>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3>Lightning Fast</h3>
            <p>No server uploads. Process your files instantly in your browser.</p>
          </div>
          <div className="trust-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Completely Free</h3>
            <p>No hidden fees, no subscriptions. Use all tools without limits.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Home
