import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import ImageToPdf from './pages/ImageToPdf'
import MergePdf from './pages/MergePdf'
import SplitPdf from './pages/SplitPdf'
import CompressPdf from './pages/CompressPdf'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div className="app">
      <Header currentPage={page} onNavigate={setPage} />
      <main className="container">
        {page === 'home' && <Home onNavigate={setPage} />}
        {page === 'about' && <About />}
        {page === 'image-to-pdf' && <ImageToPdf onNavigate={setPage} />}
        {page === 'merge-pdf' && <MergePdf onNavigate={setPage} />}
        {page === 'split-pdf' && <SplitPdf onNavigate={setPage} />}
        {page === 'compress-pdf' && <CompressPdf onNavigate={setPage} />}
      </main>
      <Footer />
    </div>
  )
}

export default App
