import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'

function QualityRing({ score }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference
  const color = score >= 70 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444'

  useState(() => {
    let s = 0
    const timer = setInterval(() => {
      s += 1
      setDisplayed(s)
      if (s >= score) clearInterval(timer)
    }, 18)
    return () => clearInterval(timer)
  }, [score])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={radius} fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
          <circle
            cx="65" cy="65" r={radius} fill="none"
            stroke={color} strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color }}>{displayed}</span>
          <span className="text-xs text-slate-500">/100</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-400">Resume Quality</span>
    </div>
  )
}

export default function QuickScan() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const onDrop = useCallback((accepted) => {
    if (accepted[0]) { setFile(accepted[0]); setResult(null) }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
  })

  const handleScan = async () => {
    if (!file) return setError('Please upload your resume PDF.')
    setError('')
    setLoading(true)
    try {
      const form = new FormData()
      form.append('resume', file)
      const { data } = await axios.post('https://ai-resume-analyzer-3ua9.onrender.com/detect-role', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const levelColor = {
    'Junior': '#22c55e',
    'Mid-Level': '#f59e0b',
    'Senior': '#6366f1',
    'Lead': '#a855f7',
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-semibold text-indigo-400 tracking-widest uppercase mb-3">Quick Scan</div>
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Detect Your <span className="gradient-text">Job Role</span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Upload your resume — AI instantly detects your target role, seniority level, and gives you a quality score. No job description needed.
          </p>
        </div>

        {/* Upload */}
        <div
          {...getRootProps()}
          className={`rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all mb-6
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
              <p className="text-slate-500 text-sm">PDF only · No job description needed</p>
            </>
          )}
        </div>

        {error && (
          <div className="mb-6 px-5 py-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            ⚠️ {error}
          </div>
        )}

        <button
          onClick={handleScan}
          disabled={loading || !file}
          className="w-full py-5 rounded-2xl gradient-bg text-white font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mb-12"
        >
          {loading ? (
            <span className="flex flex-col items-center justify-center gap-2">
              <span className="flex items-center gap-3">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Scanning resume...
              </span>
              <span className="text-xs opacity-60">First request may take ~30 seconds to wake up the server.</span>
            </span>
          ) : '🔍 Scan My Resume'}
        </button>

        {/* Results */}
        {result && (
          <div className="space-y-6">

            {/* Role + Level + Quality */}
            <div className="glass-card rounded-2xl p-8 flex flex-wrap gap-8 items-center justify-between">
              <div>
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest mb-2">Detected Role</div>
                <div className="text-3xl font-black gradient-text mb-3">{result.detected_role}</div>
                <div className="flex items-center gap-3">
                  <span
                    className="px-4 py-1.5 rounded-full text-sm font-bold"
                    style={{
                      color: levelColor[result.seniority_level] || '#6366f1',
                      background: `${levelColor[result.seniority_level]}18` || 'rgba(99,102,241,0.1)',
                      border: `1px solid ${levelColor[result.seniority_level]}44` || '1px solid rgba(99,102,241,0.3)'
                    }}
                  >
                    {result.seniority_level}
                  </span>
                  <span className="text-slate-400 text-sm">· {result.years_of_experience}</span>
                </div>
                <p className="text-slate-400 text-sm mt-4 max-w-md leading-relaxed">{result.candidate_summary}</p>
              </div>
              <QualityRing score={result.resume_quality_score} />
            </div>

            {/* Top Skills + Industries */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                  Top Skills Detected
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.top_skills?.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-indigo-500/10 border border-indigo-500/25 text-indigo-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400 inline-block" />
                  Best Fit Industries
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.industries?.map((ind, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold font-mono bg-purple-500/10 border border-purple-500/25 text-purple-300">
                      {ind}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="glass-card rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                ⚡ <span>Quick Improvement Tips</span>
              </h3>
              <div className="flex flex-col gap-4">
                {result.quick_tips?.map((tip, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                    <span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 text-sm leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <p className="text-slate-400 mb-4 text-sm">Want a full analysis against a specific job?</p>
              <a
                href="/analyze"
                className="inline-block px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all hover:-translate-y-1"
              >
                Full Resume Analysis →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
