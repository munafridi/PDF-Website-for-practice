import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import * as pdfjsLib from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { formatSize } from '../utils/formatSize'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const LEVELS = [
  { id: 'low', label: 'Low — better quality', scale: 2, quality: 0.75 },
  { id: 'medium', label: 'Medium — balanced', scale: 1.5, quality: 0.6 },
  { id: 'high', label: 'High — smallest size', scale: 1, quality: 0.4 },
]

function CompressPdf({ onNavigate }) {
  const [file, setFile] = useState(null)
  const [level, setLevel] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const pdfFile = e.target.files[0]
    if (!pdfFile) return

    if (pdfFile.type !== 'application/pdf') {
      setError('Please upload only PDF files.')
      return
    }

    setFile(pdfFile)
    setResult(null)
    setError(null)
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

  function handleDrop(e) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const pdfFile = e.dataTransfer.files[0]
    if (!pdfFile) return

    if (pdfFile.type !== 'application/pdf') {
      setError('Please upload only PDF files.')
      return
    }

    setFile(pdfFile)
    setResult(null)
    setError(null)
  }

  function resetFile() {
    setFile(null)
    setResult(null)
    setError(null)
  }

  async function compressPdf() {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { scale, quality } = LEVELS.find((l) => l.id === level)
      const bytes = await file.arrayBuffer()
      const srcPdf = await pdfjsLib.getDocument({ data: bytes }).promise

      const firstPage = await srcPdf.getPage(1)
      const v0 = firstPage.getViewport({ scale })
      const doc = new jsPDF({
        unit: 'pt',
        format: [v0.width / scale, v0.height / scale],
        orientation: v0.width > v0.height ? 'landscape' : 'portrait',
      })

      for (let i = 1; i <= srcPdf.numPages; i++) {
        const page = await srcPdf.getPage(i)
        const viewport = page.getViewport({ scale })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        await page.render({ canvas, viewport }).promise

        const imgData = canvas.toDataURL('image/jpeg', quality)
        const w = viewport.width / scale
        const h = viewport.height / scale

        if (i > 1) {
          doc.addPage([w, h], w > h ? 'landscape' : 'portrait')
        }
        doc.addImage(imgData, 'JPEG', 0, 0, w, h)
      }

      const outBytes = doc.output('arraybuffer')
      const blob = new Blob([outBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'compressed.pdf'
      link.click()

      URL.revokeObjectURL(url)
      setResult({ before: file.size, after: outBytes.byteLength })
    } catch (error) {
      setError('Could not compress this PDF. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const percent = result
    ? Math.round((1 - result.after / result.before) * 100)
    : 0

  return (
    <section className="compress-pdf-section">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Compress PDF</h2>
      <p className="subtitle">
        Reduce PDF file size by converting each page into an optimized image.
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
                <p className="pdf-info-meta">{formatSize(file.size)}</p>
              </div>
              <button className="change-file-btn" onClick={resetFile}>
                Change
              </button>
            </div>
          </div>

          <div className="compression-section">
            <h3>Compression Level</h3>
            <div className="level-options">
              {LEVELS.map((l) => (
                <label
                  className={`level-option ${level === l.id ? 'level-option-selected' : ''}`}
                  key={l.id}
                >
                  <input
                    type="radio"
                    name="level"
                    checked={level === l.id}
                    onChange={() => setLevel(l.id)}
                  />
                  <div className="level-option-content">
                    <span className="level-option-label">{l.label}</span>
                    <span className="level-option-desc">
                      {l.id === 'low' && 'Best quality, larger file'}
                      {l.id === 'medium' && 'Good balance'}
                      {l.id === 'high' && 'Smallest file, lower quality'}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            <p className="hint">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Note: Pages are converted to images, so text will not be selectable.
            </p>
          </div>
        </>
      )}

      {result && (
        <div className="result-card">
          <div className="result-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3>Compression Complete</h3>
          </div>
          <div className="result-stats">
            <div className="result-stat">
              <span className="result-label">Original</span>
              <span className="result-value">{formatSize(result.before)}</span>
            </div>
            <svg className="result-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <div className="result-stat">
              <span className="result-label">Compressed</span>
              <span className="result-value">{formatSize(result.after)}</span>
            </div>
          </div>
          <div className="result-saved">
            <span className="result-saved-label">Space Saved</span>
            <span className={`result-saved-value ${percent >= 0 ? 'positive' : 'negative'}`}>
              {percent >= 0 ? `${percent}%` : `${Math.abs(percent)}% larger`}
            </span>
          </div>
        </div>
      )}

      <button
        className="primary-btn compress-btn"
        onClick={compressPdf}
        disabled={!file || loading}
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
            Compressing...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            Compress & Download
          </>
        )}
      </button>
    </section>
  )
}

export default CompressPdf
