import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function ScoreRing({ score, label, color }) {
  const [displayed, setDisplayed] = useState(0)
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (displayed / 100) * circumference

  useEffect(() => {
    let start = 0
    const timer = setInterval(() => {
      start += 1
      setDisplayed(start)
      if (start >= score) clearInterval(timer)
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
          <span className="text-3xl font-black" style={{ color }}>{displayed}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold text-slate-400">{label}</span>
    </div>
  )
}

function SkillTags({ skills, color, bg }) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills?.map((s, i) => (
        <span
          key={i}
          className="px-3 py-1 rounded-full text-xs font-semibold font-mono"
          style={{ color, background: bg, border: `1px solid ${color}33` }}
        >
          {s}
        </span>
      ))}
    </div>
  )
}

export default function Results() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('analysisResult')
    if (!stored) { navigate('/analyze'); return }
    setData(JSON.parse(stored))
  }, [navigate])

  if (!data) return null

  const matchColor = data.match_score >= 70 ? '#22c55e' : data.match_score >= 50 ? '#f59e0b' : '#ef4444'
  const atsColor = data.ats_score >= 70 ? '#22c55e' : data.ats_score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-xs font-mono font-semibold text-indigo-400 tracking-widest uppercase mb-3">Analysis Complete</div>
          <h1 className="text-4xl font-black mb-4">Your <span className="gradient-text">Results</span></h1>
          <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">{data.summary}</p>
        </div>

        {/* Score rings */}
        <div className="glass-card rounded-2xl p-10 flex flex-wrap justify-center gap-16 mb-8">
          <ScoreRing score={data.match_score} label="Overall Match" color={matchColor} />
          <ScoreRing score={data.ats_score} label="ATS Score" color={atsColor} />
        </div>

        {/* Skills grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" />
              Matched Skills
              <span className="ml-auto text-xs font-mono text-green-400">{data.matched_skills?.length}</span>
            </h3>
            <SkillTags skills={data.matched_skills} color="#22c55e" bg="rgba(34,197,94,0.1)" />
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
              Missing Skills
              <span className="ml-auto text-xs font-mono text-red-400">{data.missing_skills?.length}</span>
            </h3>
            <SkillTags skills={data.missing_skills} color="#ef4444" bg="rgba(239,68,68,0.1)" />
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
              Key Strengths
              <span className="ml-auto text-xs font-mono text-indigo-400">{data.strengths?.length}</span>
            </h3>
            <SkillTags skills={data.strengths} color="#818cf8" bg="rgba(99,102,241,0.1)" />
          </div>
        </div>

        {/* AI Suggestions */}
        <div className="glass-card rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            🤖 <span>AI Recommendations</span>
          </h3>
          <div className="flex flex-col gap-4">
            {data.suggestions?.map((s, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20">
                <span className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-slate-300 text-sm leading-relaxed">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewrite suggestions */}
        {data.rewrite_suggestions?.length > 0 && (
          <div className="glass-card rounded-2xl p-8 mb-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              ✍️ <span>Rewrite Suggestions</span>
            </h3>
            <div className="flex flex-col gap-6">
              {data.rewrite_suggestions.map((r, i) => (
                <div key={i} className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                    <div className="text-xs font-mono text-red-400 mb-2 font-semibold">ORIGINAL</div>
                    <p className="text-slate-400 text-sm leading-relaxed">{r.original}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/20">
                    <div className="text-xs font-mono text-green-400 mb-2 font-semibold">IMPROVED</div>
                    <p className="text-slate-300 text-sm leading-relaxed">{r.improved}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            to="/analyze"
            className="px-8 py-3 rounded-xl gradient-bg text-white font-semibold hover:opacity-90 transition-all hover:-translate-y-1"
          >
            Analyze Another Resume
          </Link>
          <button
            onClick={() => window.print()}
            className="px-8 py-3 rounded-xl border border-indigo-500/30 text-slate-300 font-semibold hover:border-indigo-500/60 hover:text-white transition-all"
          >
            Print / Save as PDF
          </button>
        </div>
      </div>
    </div>
  )
}
