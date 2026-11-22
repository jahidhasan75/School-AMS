import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:bg-[#0B1224] py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">School <span className="text-blue-600">AMS</span></span>
        </Link>
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">We're here to help with any questions about School AMS.</p>
            <div className="space-y-5">
              {[
                { icon: Mail, label: 'Email', value: 'info@schoolams.demo' },
                { icon: Phone, label: 'Phone', value: '+880 1700-000000' },
                { icon: MapPin, label: 'Address', value: 'Dhaka, Bangladesh' },
              ].map(c => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <c.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{c.label}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{c.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Send a Message</h2>
            <input className="form-input" placeholder="Your Name" />
            <input className="form-input" type="email" placeholder="Email Address" />
            <input className="form-input" placeholder="Subject" />
            <textarea className="form-input resize-none h-28" placeholder="Message..." />
            <button className="btn-primary w-full py-2.5">Send Message</button>
          </div>
        </div>
      </div>
    </div>
  )
}
