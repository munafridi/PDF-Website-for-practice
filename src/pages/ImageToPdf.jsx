import { useState, useRef } from 'react'
import jsPDF from 'jspdf'
import { formatSize } from '../utils/formatSize'

function ImageToPdf({ onNavigate }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'image/png' || file.type === 'image/jpeg'
    )
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))
    setImages((prev) => [...prev, ...newImages])
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

    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === 'image/png' || file.type === 'image/jpeg'
    )

    if (files.length === 0) {
      setError('Please upload only JPG or PNG images.')
      return
    }

    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9),
    }))
    setImages((prev) => [...prev, ...newImages])
    setError(null)
  }

  function removeImage(index) {
    URL.revokeObjectURL(images[index].url)
    setImages(images.filter((_, i) => i !== index))
    setError(null)
  }

  function clearAll() {
    images.forEach((img) => URL.revokeObjectURL(img.url))
    setImages([])
    setError(null)
    setSuccess(false)
  }

  function handleDragStart(index) {
    setDraggedIndex(index)
  }

  function handleDragOver(e, index) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const draggedItem = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedItem)
    setImages(newImages)
    setDraggedIndex(index)
  }

  function handleDragEnd() {
    setDraggedIndex(null)
  }

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  function getImageSize(src) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.onerror = reject
      img.src = src
    })
  }

  async function downloadPdf() {
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < images.length; i++) {
        const dataUrl = await readAsDataURL(images[i].file)
        const { width, height } = await getImageSize(dataUrl)

        const scale = Math.min(pageWidth / width, pageHeight / height)
        const w = width * scale
        const h = height * scale
        const x = (pageWidth - w) / 2
        const y = (pageHeight - h) / 2

        if (i > 0) pdf.addPage()
        const format = images[i].file.type === 'image/png' ? 'PNG' : 'JPEG'
        pdf.addImage(dataUrl, format, x, y, w, h)
      }

      pdf.save('images.pdf')
      setSuccess(true)
    } catch (error) {
      setError('Could not create PDF. Make sure the files are valid images.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="image-to-pdf-section">
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Image to PDF</h2>
      <p className="subtitle">
        Upload JPG or PNG images and download them as one PDF.
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
          <p className="drop-hint">JPG or PNG images only</p>
        </div>
        <input
          ref={fileInputRef}
          className="file-input-hidden"
          type="file"
          accept="image/png, image/jpeg"
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

      {images.length > 0 && (
        <>
          <div className="images-header">
            <h3>Uploaded Images ({images.length})</h3>
            <button className="clear-btn" onClick={clearAll}>
              Clear All
            </button>
          </div>

          <div className="image-list">
            {images.map((img, index) => (
              <div
                key={img.id}
                className={`image-item ${draggedIndex === index ? 'image-item-dragging' : ''}`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                <div className="image-drag-handle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM8 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0zM14 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
                  </svg>
                </div>
                <img src={img.url} alt={img.file.name} className="image-thumbnail" />
                <div className="image-info">
                  <p className="image-name">{img.file.name}</p>
                  <p className="image-size">{formatSize(img.file.size)}</p>
                </div>
                <button
                  className="image-remove-btn"
                  onClick={() => removeImage(index)}
                  title="Remove"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {success && (
        <div className="success-message">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          PDF created successfully!
        </div>
      )}

      <button
        className="primary-btn convert-btn"
        onClick={downloadPdf}
        disabled={images.length === 0 || loading}
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
            Convert to PDF
          </>
        )}
      </button>
    </section>
  )
}

export default ImageToPdf
