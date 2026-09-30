import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatSize } from '../utils/formatSize'

function SplitPdf({ onNavigate }) {
  const [file, setFile] = useState(null)
  const [pageCount, setPageCount] = useState(0)
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const pdfFile = e.target.files[0]
    if (!pdfFile) return

    setFile(null)
    setPageCount(0)
    setSelected([])
    setError(null)
    setSuccess(false)

    try {
      const bytes = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setFile(pdfFile)
      setPageCount(pdf.getPageCount())
      setSelected([])
    } catch (error) {
      setError('Could not read this file. Please upload a valid PDF.')
      console.error(error)
    }
  }

  function handleDrag(e) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  async function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const pdfFile = e.dataTransfer.files[0]
    if (!pdfFile) return

    if (pdfFile.type !== 'application/pdf') {
      setError('Please upload only PDF files.')
      return
    }

    setFile(null)
    setPageCount(0)
    setSelected([])
    setError(null)
    setSuccess(false)

    try {
      const bytes = await pdfFile.arrayBuffer()
      const pdf = await PDFDocument.load(bytes)
      setFile(pdfFile)
      setPageCount(pdf.getPageCount())
      setSelected([])
    } catch (error) {
      setError('Could not read this file. Please upload a valid PDF.')
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

  function clearSelection() {
    setSelected([])
  }

  function resetAll() {
    setFile(null)
    setPageCount(0)
    setSelected([])
    setError(null)
    setSuccess(false)
  }

  async function downloadPages() {
    setLoading(true)
    setError(null)
    setSuccess(false)

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
      setSuccess(true)
    } catch (error) {
      setError('Could not split this PDF.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="split-pdf-section">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Split PDF</h2>
      <p className="subtitle">
        Upload a PDF, select the pages you want and download them as a new PDF.
      </p>

      {!file && (
        <div
          className={`drop-zone ${dragActive ? 'drop-zone-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="drop-zone-content">
            <svg className="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="drop-text">
              <strong>Click to upload</strong> or drag and drop
            </p>
            <p className="drop-hint">PDF file only</p>
          </div>
          <input
            ref={fileInputRef}
            className="file-input-hidden"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
      )}

      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {file && (
        <>
          <div className="pdf-info-card">
            <div className="pdf-info-header">
              <div className="pdf-info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="pdf-info-details">
                <p className="pdf-info-name">{file.name}</p>
                <p className="pdf-info-meta">
                  {formatSize(file.size)} • {pageCount} pages
                </p>
              </div>
              <button className="change-file-btn" onClick={resetAll}>
                Change
              </button>
            </div>
          </div>

          <div className="pages-header">
            <h3>Select Pages ({selected.length} selected)</h3>
            <div className="pages-actions">
              <button className="secondary-btn" onClick={selectAll}>
                Select All
              </button>
              <button className="secondary-btn" onClick={clearSelection}>
                Clear
              </button>
            </div>
          </div>

          <div className="page-grid">
            {Array.from({ length: pageCount }, (_, i) => (
              <label
                className={`page-card ${selected.includes(i) ? 'page-card-selected' : ''}`}
                key={i}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(i)}
                  onChange={() => togglePage(i)}
                />
                <div className="page-number">Page {i + 1}</div>
              </label>
            ))}
          </div>
        </>
      )}

      {success && (
        <div className="success-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          PDF split successfully!
        </div>
      )}

      <button
        className="primary-btn split-btn"
        onClick={downloadPages}
        disabled={!file || selected.length === 0 || loading}
      >
        {loading ? (
          <>
            <svg className="spinner" viewBox="0 0 24 24">
              <circle
                className="spinner-circle"
                cx="12"
                cy="12"
                r="10"
                fill="none"
                strokeWidth="3"
              />
            </svg>
            Creating PDF...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Selected Pages
          </>
        )}
      </button>
    </section>
  )
}

export default SplitPdf
