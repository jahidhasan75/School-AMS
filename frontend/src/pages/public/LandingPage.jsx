import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Shield, BarChart2, Clock, Users, CheckCircle, Menu, X, Sun, Moon, ChevronRight } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const features = [
  { icon: <Clock className="w-7 h-7 text-blue-600" />, title: 'Online Attendance', desc: 'GPS-verified digital attendance from any device, anywhere within school premises.' },
  { icon: <Users className="w-7 h-7 text-purple-600" />, title: 'Leave Management', desc: 'Apply, approve, and track leave requests with an automated workflow and instant notifications.' },
  { icon: <BarChart2 className="w-7 h-7 text-sky-600" />, title: 'Reports & Analytics', desc: 'Visual dashboards and detailed reports — daily, monthly, yearly — with export options.' },
  { icon: <Shield className="w-7 h-7 text-green-600" />, title: 'Secure & Reliable', desc: 'JWT authentication, bcrypt passwords, GPS verification, and full audit trails.' },
]

const steps = [
  { step: '01', title: 'Teacher Logs In', desc: 'Secure login with email and password' },
  { step: '02', title: 'GPS Verification', desc: 'Browser verifies teacher is within school radius' },
  { step: '03', title: 'Mark Attendance', desc: 'One tap check-in with auto status calculation' },
]

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0B1224] dark:from-[#0B1224] dark:via-[#0B1224] dark:to-[#0B1224] transition-colors duration-300">

      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-[#151F35]/90 backdrop-blur-xl shadow-lg' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">School <span className="text-blue-600">AMS</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">How It Works</a>
              <a href="#about" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">About</a>
              <a href="#contact" className="text-sm font-medium text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-blue-900/20 transition-all">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm px-5 py-2">Login</button>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 dark:text-gray-400">
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-gray-500 dark:text-gray-400">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#151F35]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-700 px-4 py-4 space-y-3">
            {['Features','How It Works','About','Contact'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(' ','-')}`} onClick={() => setMenuOpen(false)}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 py-1">{item}</a>
            ))}
            <button onClick={() => navigate('/login')} className="btn-primary w-full text-sm py-2.5 mt-2">Login</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[85vh]">
          {/* Left */}
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              Smart School Attendance System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6">
              School Teacher<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Attendance</span><br />
              Management
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
              A smart and secure digital solution to manage teacher attendance, leaves, and reports with real-time GPS monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => navigate('/login')} className="btn-primary flex items-center justify-center gap-2 py-3 px-6 text-base">
                <Users className="w-5 h-5" /> Teacher Login
              </button>
              <button onClick={() => navigate('/login')} className="flex items-center justify-center gap-2 py-3 px-6 text-base font-semibold rounded-lg border-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                <Shield className="w-5 h-5" /> Admin Login
              </button>
            </div>
            <div className="flex items-center gap-6 mt-10">
              {[{ n:'500+', l:'Teachers' }, { n:'10+', l:'Schools' }, { n:'99.9%', l:'Uptime' }].map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.n}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — School building illustration */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-lg">
              {/* Floating cards */}
              <div className="absolute -top-4 -left-4 glass-card p-4 z-10 w-48">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Present Today</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">42/50</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 glass-card p-4 z-10 w-52">
                <div className="text-xs text-gray-500 mb-1">Attendance Rate</div>
                <div className="text-2xl font-bold text-blue-600">94.5%</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{width:'94.5%'}}></div>
                </div>
              </div>

              {/* School building SVG */}
              <div className="glass-card p-8 aspect-square flex items-center justify-center">
                <svg viewBox="0 0 400 350" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                  {/* Sky */}
                  <rect width="400" height="350" fill="url(#skyGrad)" rx="12"/>
                  <defs>
                    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#DBEAFE"/>
                      <stop offset="100%" stopColor="#EDE9FE"/>
                    </linearGradient>
                  </defs>
                  {/* Ground */}
                  <rect x="0" y="280" width="400" height="70" fill="#16A34A" opacity="0.3"/>
                  <rect x="0" y="300" width="400" height="50" fill="#15803D" opacity="0.2"/>
                  {/* Main building */}
                  <rect x="60" y="120" width="280" height="180" fill="#1D4ED8" rx="4"/>
                  <rect x="60" y="120" width="280" height="180" fill="white" opacity="0.15" rx="4"/>
                  {/* Roof */}
                  <polygon points="40,125 200,50 360,125" fill="#1E40AF"/>
                  {/* Flag pole */}
                  <rect x="197" y="40" width="3" height="60" fill="#374151"/>
                  <polygon points="200,40 220,50 200,60" fill="#EF4444"/>
                  {/* School sign */}
                  <rect x="120" y="130" width="160" height="30" fill="white" rx="4" opacity="0.9"/>
                  <text x="200" y="151" textAnchor="middle" fill="#1D4ED8" fontSize="12" fontWeight="bold">DHAKA MODEL SCHOOL</text>
                  {/* Door */}
                  <rect x="165" y="230" width="70" height="70" fill="#1E40AF" rx="4"/>
                  <rect x="175" y="240" width="23" height="50" fill="#BFDBFE" rx="2"/>
                  <rect x="202" y="240" width="23" height="50" fill="#BFDBFE" rx="2"/>
                  {/* Windows row */}
                  {[80,135,245,300].map(x => (
                    <g key={x}>
                      <rect x={x} y="180" width="45" height="35" fill="#BFDBFE" rx="3"/>
                      <line x1={x+22} y1="180" x2={x+22} y2="215" stroke="#93C5FD" strokeWidth="1.5"/>
                      <line x1={x} y1="197" x2={x+45} y2="197" stroke="#93C5FD" strokeWidth="1.5"/>
                    </g>
                  ))}
                  {/* Trees */}
                  <circle cx="30" cy="270" r="20" fill="#16A34A" opacity="0.8"/>
                  <rect x="27" y="285" width="6" height="20" fill="#854D0E" opacity="0.6"/>
                  <circle cx="370" cy="265" r="22" fill="#15803D" opacity="0.8"/>
                  <rect x="367" y="282" width="6" height="20" fill="#854D0E" opacity="0.6"/>
                  {/* Sun */}
                  <circle cx="350" cy="60" r="25" fill="#FCD34D" opacity="0.7"/>
                  <circle cx="350" cy="60" r="18" fill="#FBBF24"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Powerful Features</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">Everything a school needs to manage teacher attendance digitally and efficiently</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(f => (
            <div key={f.title} className="glass-card p-6 hover:-translate-y-1 transition-transform duration-200">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center mb-4">{f.icon}</div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 dark:bg-[#151F35]/40">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">How It Works</h2>
          <p className="text-gray-600 dark:text-gray-400">Simple three-step process for teachers to mark daily attendance</p>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="text-center relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-200 to-purple-200"></div>
              )}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <span className="text-2xl font-bold text-white">{s.step}</span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-card p-10 text-center max-w-3xl mx-auto">
          <GraduationCap className="w-16 h-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">About School AMS</h2>
          <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
            School AMS (Attendance Management System) is a modern, cloud-based platform designed specifically for Bangladeshi schools. 
            It digitizes the entire teacher attendance process — from daily check-in to monthly salary reports — 
            with GPS verification, QR scanning, and comprehensive analytics that school administrators can rely on.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/40 dark:bg-[#151F35]/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Get In Touch</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">Have questions? Contact the School AMS team.</p>
          <div className="glass-card p-8 text-left space-y-4">
            <input className="form-input" placeholder="Your Name" />
            <input className="form-input" type="email" placeholder="Email Address" />
            <textarea className="form-input resize-none h-28" placeholder="Your message..." />
            <button className="btn-primary w-full py-3">Send Message</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 text-center border-t border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white">School AMS</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} School AMS. All rights reserved.</p>
      </footer>
    </div>
  )
}
