import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'

function SplitPdf({ onNavigate }) {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)

  async function handleFileChange(e) {
    const pdfFile = e.target.files[0]
    if (!pdfFile) return

    setFile(null)
    setPageCount(0)
    setSelected([])

    try {
      const bytes = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setFile(pdfFile)
      setPageCount(pdf.getPageCount())
      setSelected([])
    } catch (error) {
      alert('Could not read this file. Please upload a valid PDF.')
      console.error(error)
    }
  }

  function togglePage(index) {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else {
      setSelected([...selected, index])
    }
  }

  function selectAll() {
    setSelected(Array.from({ length: pageCount }, (_, i) => i))
  }

  async function downloadPages() {
    setLoading(true)
    try {
      const bytes = await file.arrayBuffer()
      const srcPdf = await PDFDocument.load(bytes)
      const newPdf = await PDFDocument.create()

      const indices = [...selected].sort((a, b) => a - b)
      const pages = await newPdf.copyPages(srcPdf, indices)
      pages.forEach((page) => newPdf.addPage(page))

      const newBytes = await newPdf.save()
      const blob = new Blob([newBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'split.pdf'
      link.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Could not split this PDF.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section>
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Split PDF</h2>
      <p className="subtitle">
        Upload a PDF, select the pages you want and download them as a new PDF.
      </p>

      <input
        className="file-input"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {pageCount > 0 && (
        <>
          <p className="hint">
            {file.name} — {pageCount} pages total. Selected: {selected.length}
          </p>

          <div className="page-grid">
            {Array.from({ length: pageCount }, (_, i) => (
              <label className="page-checkbox" key={i}>
                <input
                  type="checkbox"
                  checked={selected.includes(i)}
                  onChange={() => togglePage(i)}
                />
                Page {i + 1}
              </label>
            ))}
          </div>

          <div className="btn-row">
            <button className="secondary-btn" onClick={selectAll}>
              Select All
            </button>
            <button className="secondary-btn" onClick={() => setSelected([])}>
              Clear
            </button>
          </div>
        </>
      )}

      <button
        className="primary-btn"
        onClick={downloadPages}
        disabled={selected.length === 0 || loading}
      >
        {loading ? 'Creating PDF...' : 'Download Selected Pages'}
      </button>
    </section>
  )
}

export default SplitPdf
