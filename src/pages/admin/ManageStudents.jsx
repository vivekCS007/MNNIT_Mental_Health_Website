import { useState } from 'react'
import { adminAPI } from '../../services/api'

const ManageStudents = () => {
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
      formData.append('students_file', file)
      const res = await adminAPI.importStudents(formData)
      const data = res?.data ?? res
      setResult(data)
      setFile(null)
      // Reset the file input
      if (document.getElementById('student-xlsx-input')) {
        document.getElementById('student-xlsx-input').value = ''
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
      const res = await adminAPI.downloadStudentTemplate()
      const rawData = res?.data ?? res
      const blob = rawData instanceof Blob ? rawData : new Blob([rawData], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'student_import_template.xlsx')
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
          <h2 style={{ margin: 0 }}>📊 Manage Students</h2>
          <p style={{ margin: '4px 0 0', color: '#666', fontSize: '0.9rem' }}>
            Upload an Excel sheet to bulk-import or update student accounts
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
        <h3 style={{ margin: '0 0 16px', color: '#333' }}>Upload Student Data (.xlsx)</h3>

        {/* Excel Format Info */}
        <div style={{
          background: '#f8f5ff', border: '1px solid #d8c9f8', borderRadius: '10px',
          padding: '14px 18px', marginBottom: '20px'
        }}>
          <p style={{ margin: '0 0 8px', fontWeight: '600', color: '#5b3ba6', fontSize: '0.9rem' }}>
            📋 Required Excel Columns
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {['registration_number', 'name', 'email', 'password', 'branch', 'course', 'year'].map(col => (
              <span key={col} style={{
                background: col === 'password' || col === 'registration_number' || col === 'name' || col === 'email'
                  ? '#5b3ba6' : '#8b5fbf',
                color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 600
              }}>
                {col}
                {['registration_number', 'name', 'email', 'password'].includes(col) ? ' *' : ''}
              </span>
            ))}
          </div>
          <p style={{ margin: '8px 0 0', color: '#666', fontSize: '0.8rem' }}>
            * Required fields. <code>branch</code>, <code>course</code>, <code>year</code> are optional.
            Re-uploading updates existing students (matched by registration_number).
          </p>
        </div>

        {/* File Input */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            id="student-xlsx-input"
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
            {uploading ? '⏳ Importing...' : '⬆️ Import Students'}
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
          <p style={{ color: '#444', marginBottom: '16px' }}>{result.message}</p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            {[
              { label: 'New Students', value: result.summary?.imported ?? 0, color: '#27ae60' },
              { label: 'Updated', value: result.summary?.updated ?? 0, color: '#3498db' },
              { label: 'Skipped', value: result.summary?.skipped ?? 0, color: '#e74c3c' },
            ].map(s => (
              <div key={s.label} style={{
                background: '#f9f9f9', borderRadius: '10px', padding: '16px',
                textAlign: 'center', borderTop: `3px solid ${s.color}`
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: s.color }}>{s.value}</div>
                <div style={{ color: '#666', fontSize: '0.82rem', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Errors */}
          {result.summary?.errors?.length > 0 && (
            <div>
              <p style={{ fontWeight: '600', color: '#e74c3c', marginBottom: '8px' }}>
                ⚠️ {result.summary.errors.length} row(s) had issues:
              </p>
              <div style={{
                background: '#fff8f8', border: '1px solid #f5c6cb', borderRadius: '8px',
                padding: '12px', maxHeight: '200px', overflowY: 'auto'
              }}>
                {result.summary.errors.map((e, i) => (
                  <p key={i} style={{ margin: '4px 0', fontSize: '0.85rem', color: '#c0392b' }}>• {e}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ManageStudents
