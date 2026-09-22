import { useState } from 'react'
import { PDFDocument } from 'pdf-lib'
import { formatSize } from '../utils/formatSize'

function MergePdf({ onNavigate }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)

  function handleFileChange(e) {
    const newFiles = Array.from(e.target.files)
    setFiles((prev) => [...prev, ...newFiles])
    e.target.value = ''
  }

  function removeFile(index) {
    setFiles(files.filter((_, i) => i !== index))
  }

  async function mergePdfs() {
    setLoading(true)
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
    } catch (error) {
      alert('Could not merge these files. Make sure they are valid PDFs.')
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

      <h2>Merge PDF</h2>
      <p className="subtitle">
        Upload two or more PDF files and combine them into one PDF.
      </p>

      <input
        className="file-input"
        type="file"
        accept="application/pdf"
        multiple
        onChange={handleFileChange}
      />

      {files.length > 0 && (
        <div className="file-list">
          {files.map((file, index) => (
            <div className="file-row" key={index}>
              <span>
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatSize(file.size)}</span>
              </span>
              <button
                className="remove-file-btn"
                onClick={() => removeFile(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length === 1 && (
        <p className="hint">Add at least one more PDF to merge.</p>
      )}

      <button
        className="primary-btn"
        onClick={mergePdfs}
        disabled={files.length < 2 || loading}
      >
        {loading ? 'Merging...' : 'Merge & Download PDF'}
      </button>
    </section>
  )
}

export default MergePdf
