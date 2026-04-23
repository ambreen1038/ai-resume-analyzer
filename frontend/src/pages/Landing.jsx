import { Link } from 'react-router-dom'
import { useEffect, useRef } from 'react'

const steps = [
  { icon: '📄', title: 'Upload Resume', desc: 'Drop your PDF resume — we extract all the text instantly.' },
  { icon: '📋', title: 'Paste Job Description', desc: 'Copy the JD from any job posting and paste it in.' },
  { icon: '🤖', title: 'Get AI Feedback', desc: 'Advanced AI analyzes your fit and gives actionable suggestions.' },
]

const features = [
  { icon: '🎯', title: 'Match Score', desc: 'See exactly how well your resume matches the job description.' },
  { icon: '🔍', title: 'Skill Gap Analysis', desc: 'Identify missing skills recruiters are looking for.' },
  { icon: '✍️', title: 'Rewrite Suggestions', desc: 'AI rewrites weak bullet points with stronger impact.' },
  { icon: '🤖', title: 'ATS Score', desc: 'Know if your resume will pass automated screening systems.' },
]

export default function Landing() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let W, H, pts
    const NUM = 50
    const COLORS = ['#6366f1', '#a855f7', '#06b6d4']

    function init() {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      pts = Array.from({ length: NUM }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        c: COLORS[Math.floor(Math.random() * COLORS.length)]
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(99,102,241,${0.12 * (1 - d / 120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(pts[i].x, pts[i].y)
            ctx.lineTo(pts[j].x, pts[j].y)
            ctx.stroke()
          }
        }
      }
      pts.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.c + '88'
        ctx.fill()
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
      })
      requestAnimationFrame(draw)
    }

    init(); draw()
    window.addEventListener('resize', init)
    return () => window.removeEventListener('resize', init)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-sm text-slate-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse-slow" />
            Powered by Advanced AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6 tracking-tight">
            Get Your Resume
            <br />
            <span className="gradient-text">AI-Analyzed</span>
            <br />
            in Seconds
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload your resume, paste a job description — get an instant match score,
            skill gap analysis, and AI-powered rewrite suggestions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="px-8 py-4 rounded-xl gradient-bg text-white font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/30"
            >
              Analyze My Resume →
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-xl border border-indigo-500/30 text-slate-300 font-semibold text-lg hover:border-indigo-500/60 hover:text-white transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            {[['Free', 'No signup needed'], ['< 10s', 'Analysis time'], ['AI-Powered', 'Analysis']].map(([val, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold gradient-text">{val}</div>
                <div className="text-sm text-slate-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 px-6 bg-[#0c0c1e]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono font-semibold text-indigo-400 tracking-widest uppercase mb-3">How It Works</div>
            <h2 className="text-4xl font-bold">Three simple steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="glass-card rounded-2xl p-8 text-center hover:border-indigo-500/40 transition-all hover:-translate-y-1 group">
                <div className="text-5xl mb-5">{step.icon}</div>
                <div className="text-xs font-mono text-indigo-400 mb-2">Step {i + 1}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono font-semibold text-indigo-400 tracking-widest uppercase mb-3">Features</div>
            <h2 className="text-4xl font-bold">Everything you need to land the job</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-7 flex gap-5 hover:border-indigo-500/40 transition-all hover:-translate-y-1">
                <div className="text-4xl flex-shrink-0">{f.icon}</div>
                <div>
                  <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#0c0c1e]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to optimize your resume?</h2>
          <p className="text-slate-400 mb-10">It's free. No account required. Get your results in seconds.</p>
          <Link
            to="/analyze"
            className="inline-block px-10 py-4 rounded-xl gradient-bg text-white font-bold text-lg hover:opacity-90 transition-all hover:-translate-y-1 shadow-lg shadow-indigo-500/30"
          >
            Start Analyzing →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-indigo-500/10">
        Built with React + FastAPI + AI
      </footer>
    </div>
  )
}
