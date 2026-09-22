import { useState } from 'react'
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

  function handleFileChange(e) {
    setFile(e.target.files[0] || null)
    setResult(null)
  }

  async function compressPdf() {
    setLoading(true)
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
      alert('Could not compress this PDF.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const percent = result
    ? Math.round((1 - result.after / result.before) * 100)
    : 0

  return (
    <section>
      <button className="back-btn" onClick={() => onNavigate('home')}>
        &larr; Back to Home
      </button>

      <h2>Compress PDF</h2>
      <p className="subtitle">
        Reduce PDF file size by converting each page into an optimized image.
      </p>

      <input
        className="file-input"
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
      />

      {file && (
        <>
          <p className="hint">
            {file.name} — {formatSize(file.size)}
          </p>

          <div className="level-options">
            {LEVELS.map((l) => (
              <label className="level-option" key={l.id}>
                <input
                  type="radio"
                  name="level"
                  checked={level === l.id}
                  onChange={() => setLevel(l.id)}
                />
                {l.label}
              </label>
            ))}
          </div>

          <p className="hint">
            Note: pages are converted to images, so text in the new PDF will not
            be selectable.
          </p>
        </>
      )}

      {result && (
        <p className="result">
          {formatSize(result.before)} &rarr; {formatSize(result.after)} (
          {percent >= 0 ? `${percent}% smaller` : 'larger than original'})
        </p>
      )}

      <button
        className="primary-btn"
        onClick={compressPdf}
        disabled={!file || loading}
      >
        {loading ? 'Compressing...' : 'Compress & Download'}
      </button>
    </section>
  )
}

export default CompressPdf
