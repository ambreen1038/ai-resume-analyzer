import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function Analyzer() {
  const [file, setFile] = useState(null)
  const [jobDesc, setJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) setFile(accepted[0])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleAnalyze = async () => {
    if (!file) return setError('Please upload your resume PDF.')
    if (!jobDesc.trim()) return setError('Please paste the job description.')
    setError('')
    setLoading(true)

    try {
      const form = new FormData()
      form.append('resume', file)
      form.append('job_description', jobDesc)

      const { data } = await axios.post('https://ai-resume-analyzer-3ua9.onrender.com/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      sessionStorage.setItem('analysisResult', JSON.stringify(data))
      navigate('/results')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-semibold text-indigo-400 tracking-widest uppercase mb-3">AI Resume Analyzer</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Upload & <span className="gradient-text">Analyze</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Drop your resume and paste the job description. Our AI will analyze your match in seconds.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* Left — Resume Upload */}
          <div>
            <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs font-bold">1</span>
              Upload Resume (PDF)
            </div>
            <div
              {...getRootProps()}
              className={`rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all min-h-[280px] flex flex-col items-center justify-center
                ${isDragActive
                  ? 'border-indigo-500 bg-indigo-500/10'
                  : file
                    ? 'border-green-500/50 bg-green-500/5'
                    : 'border-indigo-500/30 bg-[#0c0c1e] hover:border-indigo-500/60 hover:bg-indigo-500/5'
                }`}
            >
              <input {...getInputProps()} />
              {file ? (
                <>
                  <div className="text-5xl mb-4">✅</div>
                  <p className="font-semibold text-green-400">{file.name}</p>
                  <p className="text-slate-500 text-sm mt-2">{(file.size / 1024).toFixed(1)} KB · Click to replace</p>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-4">📄</div>
                  <p className="font-semibold text-slate-300 mb-2">
                    {isDragActive ? 'Drop it here!' : 'Drag & drop your resume'}
                  </p>
                  <p className="text-slate-500 text-sm">or click to browse</p>
                  <p className="text-slate-600 text-xs mt-4">PDF only · Max 5MB</p>
                </>
              )}
            </div>
          </div>

          {/* Right — Job Description */}
          <div>
            <div className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-xs font-bold">2</span>
              Paste Job Description
            </div>
            <textarea
              value={jobDesc}
              onChange={e => setJobDesc(e.target.value)}
              placeholder="Paste the full job description here...&#10;&#10;Include requirements, responsibilities, and qualifications for the best analysis."
              className="w-full min-h-[280px] rounded-2xl bg-[#0c0c1e] border border-indigo-500/30 text-slate-300 placeholder-slate-600 p-5 text-sm resize-none outline-none focus:border-indigo-500/60 transition-colors font-sans leading-relaxed"
            />
            <div className="text-right text-xs text-slate-600 mt-1">{jobDesc.length} characters</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full py-5 rounded-2xl gradient-bg text-white font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Analyzing your resume...
            </span>
          ) : (
            '🚀 Analyze Now'
          )}
        </button>

        {loading && (
          <p className="text-center text-slate-500 text-sm mt-4 animate-pulse">
            Extracting resume text → Running AI analysis → Building your report...
            <br />
            <span className="text-xs text-slate-600 mt-1 block">First request may take ~30 seconds to wake up the server.</span>
          </p>
        )}
      </div>
    </div>
  )
}
