import { useState } from 'react'
import { adminAPI } from '../../services/api'

const ManageFaculty = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [downloadingTemplate, setDownloadingTemplate] = useState(false)

  const handleFileChange = (e) => {
    const f = e.target.files[0]
    if (f && !f.name.endsWith('.xlsx')) {
      setError('Only .xlsx files are supported.')
      setFile(null)
      return
    }
    setError('')
    setFile(f)
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select an .xlsx file first.'); return }
    setUploading(true)
    setResult(null)
    setError('')
    try {
      const formData = new FormData()
      formData.append('faculty_file', file)
      const res = await adminAPI.importFaculty(formData)
      const data = res?.data ?? res
      setResult(data)
      setFile(null)
      // Reset the file input
      if (document.getElementById('faculty-xlsx-input')) {
        document.getElementById('faculty-xlsx-input').value = ''
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Upload failed. Please check the file format.')
    } finally {
      setUploading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const res = await adminAPI.downloadFacultyTemplate()
      const rawData = res?.data ?? res
      const blob = rawData instanceof Blob ? rawData : new Blob([rawData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'faculty_import_template.xlsx')
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      setError('Failed to download template: ' + (e.message || 'Error'))
    } finally {
      setDownloadingTemplate(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0 }}>👨‍🏫 Manage Faculty / Mentors</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
            Upload an Excel sheet to bulk-import or update faculty accounts
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          style={{ fontSize: '0.85rem' }}
        >
          {downloadingTemplate ? 'Downloading...' : '📥 Download Template'}
        </button>
      </div>

      {/* Upload Card */}
      <div style={{
        background: 'white', borderRadius: '14px', padding: '28px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.07)', marginBottom: '24px'
      }}>
        <h3 style={{ margin: '0 0 16px', color: '#333' }}>Upload Faculty Data (.xlsx)</h3>

        {/* Excel Format Info */}
        <div style={{
          background: '#f8f5ff', border: '1px solid #d8c9f8', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#5b3ba6', fontSize: '0.9rem' }}>
            📋 Required Excel Columns
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['employee_id', 'name', 'email', 'password', 'department'].map(col => (
              <span key={col} style={{
                background: col === 'password' || col === 'employee_id' || col === 'name' || col === 'email'
                  ? '#5b3ba6' : '#8b5fbf',
                color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600
              }}>
                {col}
                {['employee_id', 'name', 'email', 'password'].includes(col) ? ' *' : ''}
              </span>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.8rem' }}>
            * Required fields. <code>department</code> is optional.
            Re-uploading updates existing faculty (matched by employee_id).
          </p>
        </div>

        {/* File Input */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="faculty-xlsx-input"
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            style={{
              flex: 1, minWidth: '220px', padding: '10px', borderRadius: '8px',
              border: '2px dashed #d8c9f8', background: '#faf8ff', cursor: 'pointer'
            }}
          />
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={uploading || !file}
            style={{ padding: '10px 24px', minWidth: '140px' }}
          >
            {uploading ? '⏳ Importing...' : '⬆️ Import Faculty'}
          </button>
        </div>

        {file && (
          <p style={{ margin: '10px 0 0', color: '#5b3ba6', fontSize: '0.85rem' }}>
            📎 Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}

        {error && (
          <div style={{
            marginTop: '14px', background: '#fff0f0', border: '1px solid #f5c6cb',
            borderRadius: '8px', padding: '12px 16px', color: '#c0392b', fontSize: '0.9rem'
          }}>
            ❌ {error}
          </div>
        )}
      </div>

      {/* Result Summary */}
      {result && (
        <div style={{ background: 'white', borderRadius: '14px', padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#27ae60' }}>✅ Import Complete</h3>
          <p style={{ margin: '0 0 16px', color: '#444' }}>{result.message}</p>
          
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ flex: 1, background: '#f8fff9', border: '1px solid #c3e6cb', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#27ae60', fontWeight: 'bold' }}>{result.summary.imported}</div>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>New Added</div>
            </div>
            <div style={{ flex: 1, background: '#f4faff', border: '1px solid #b8daff', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#3498db', fontWeight: 'bold' }}>{result.summary.updated}</div>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Updated</div>
            </div>
            <div style={{ flex: 1, background: '#fff9f4', border: '1px solid #ffeeba', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.8rem', color: '#f39c12', fontWeight: 'bold' }}>{result.summary.skipped}</div>
              <div style={{ color: '#666', fontSize: '0.85rem' }}>Skipped (Errors)</div>
            </div>
          </div>

          {result.summary.errors && result.summary.errors.length > 0 && (
            <div style={{ background: '#fff0f0', border: '1px solid #f5c6cb', padding: '16px', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 12px', color: '#c0392b', fontSize: '0.9rem' }}>⚠️ Errors Encountered ({result.summary.errors.length})</h4>
              <div style={{ maxHeight: '200px', overflowY: 'auto', fontSize: '0.85rem', color: '#666' }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {result.summary.errors.map((err, i) => (
                    <li key={i} style={{ marginBottom: '6px' }}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ManageFaculty
