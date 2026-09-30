import { useState, useRef } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatSize } from '../utils/formatSize'

function MergePdf({ onNavigate }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files).filter(
      (file) => file.type === 'application/pdf'
    )
    if (newFiles.length === 0) {
      setError('Please upload only PDF files.')
      return
    }
    setFiles((prev) => [...prev, ...newFiles])
    setError(null)
    e.target.value = ''
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

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'application/pdf'
    )

    if (droppedFiles.length === 0) {
      setError('Please upload only PDF files.')
      return
    }

    setFiles((prev) => [...prev, ...droppedFiles])
    setError(null)
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
    setError(null)
  }

  function clearAll() {
    setFiles([])
    setError(null)
    setSuccess(false)
  }

  function handleDragStart(index) {
    setDraggedIndex(index)
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedItem = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedItem)
    setFiles(newFiles)
    setDraggedIndex(index)
  }

  function handleDragEnd() {
    setDraggedIndex(null)
  }

  async function mergePdfs() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const mergedPdf = await PDFDocument.create()

      for (const file of files) {
        const bytes = await file.arrayBuffer()
        const pdf = await PDFDocument.load(bytes)
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
        pages.forEach((page) => mergedPdf.addPage(page))
      }

      const mergedBytes = await mergedPdf.save()
      const blob = new Blob([mergedBytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = 'merged.pdf'
      link.click()

      URL.revokeObjectURL(url)
      setSuccess(true)
    } catch (error) {
      setError('Could not merge these files. Make sure they are valid PDFs.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="merge-pdf-section">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Merge PDF</h2>
      <p className="subtitle">
        Upload two or more PDF files and combine them into one PDF.
      </p>

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
          <p className="drop-hint">PDF files only</p>
        </div>
        <input
          ref={fileInputRef}
          className="file-input-hidden"
          type="file"
          accept="application/pdf"
          multiple
          onChange={handleFileChange}
        />
      </div>

      {error && (
        <div className="error-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {files.length > 0 && (
        <>
          <div className="pdfs-header">
            <h3>PDF Files ({files.length})</h3>
            <button className="clear-btn" onClick={clearAll}>
              Clear All
            </button>
          </div>

          <div className="pdf-list">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={`pdf-item ${draggedIndex === index ? 'pdf-item-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="pdf-drag-handle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                  </svg>
                </div>
                <div className="pdf-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="pdf-info">
                  <p className="pdf-name">{file.name}</p>
                  <p className="pdf-size">{formatSize(file.size)}</p>
                </div>
                <button
                  className="pdf-remove-btn"
                  onClick={() => removeFile(index)}
                  title="Remove"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <button
            className="secondary-btn add-more-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add More Files
          </button>
        </>
      )}

      {files.length === 1 && (
        <p className="hint">Add at least one more PDF to merge.</p>
      )}

      {success && (
        <div className="success-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          PDFs merged successfully!
        </div>
      )}

      <button
        className="primary-btn merge-btn"
        onClick={mergePdfs}
        disabled={files.length < 2 || loading}
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
            Merging PDFs...
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Merge PDFs
          </>
        )}
      </button>
    </section>
  )
}

export default MergePdf
