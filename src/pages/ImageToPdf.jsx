import { useState } from 'react'
import jsPDF from 'jspdf'

function ImageToPdf({ onNavigate }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  function handleFileChange(e) {
    const files = Array.from(e.target.files).filter(
      (file) => file.type === 'image/png' || file.type === 'image/jpeg'
    )
    const newImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setImages((prev) => [...prev, ...newImages])
    e.target.value = ''
  }

  function removeImage(index) {
    URL.revokeObjectURL(images[index].url)
    setImages(images.filter((_, i) => i !== index))
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
    } catch (error) {
      alert('Could not create PDF. Make sure the files are valid images.')
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

      <h2>Image to PDF</h2>
      <p className="subtitle">
        Upload JPG or PNG images and download them as one PDF.
      </p>

      <input
        className="file-input"
        type="file"
        accept="image/png, image/jpeg"
        multiple
        onChange={handleFileChange}
      />

      {images.length > 0 && (
        <div className="preview-grid">
          {images.map((img, index) => (
            <div className="preview-item" key={img.url}>
              <img src={img.url} alt={img.file.name} />
              <button
                className="remove-btn"
                onClick={() => removeImage(index)}
                title="Remove"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        className="primary-btn"
        onClick={downloadPdf}
        disabled={images.length === 0 || loading}
      >
        {loading ? 'Creating PDF...' : 'Download PDF'}
      </button>
    </section>
  )
}

export default ImageToPdf
