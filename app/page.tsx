'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Database, Link2, FileCheck, ArrowRight, ChevronRight, Check, Zap, Globe, Eye, Users, BadgeCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: '100%', label: 'Tamper-Proof' },
  { value: 'SHA-256', label: 'Encryption Standard' },
  { value: 'IPFS', label: 'Decentralized Storage' },
  { value: '24/7', label: 'Availability' },
]

const features = [
  {
    icon: Lock,
    title: 'Cryptographic Integrity',
    description: 'Every file is fingerprinted with SHA-256 hashing. Any tampering is instantly detectable — guaranteed.',
    color: 'from-emerald-500 to-green-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Database,
    title: 'Decentralized Storage',
    description: 'Evidence lives on IPFS — a distributed network with no single point of failure, accessible globally.',
    color: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Link2,
    title: 'Immutable Blockchain',
    description: 'Metadata and hashes are recorded on Ethereum smart contracts. Once written, nothing can be changed.',
    color: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Eye,
    title: 'Instant Verification',
    description: 'Auditors verify evidence authenticity in seconds by querying the blockchain — no manual checks needed.',
    color: 'from-orange-500 to-amber-600',
    bg: 'bg-orange-50',
  },
  {
    icon: Users,
    title: 'Role-Based Access',
    description: 'Investigators, law enforcement, and admins each have precisely scoped permissions and access controls.',
    color: 'from-rose-500 to-pink-600',
    bg: 'bg-rose-50',
  },
  {
    icon: BadgeCheck,
    title: 'Full Audit Trail',
    description: 'Every action is timestamped and logged on-chain. Complete chain of custody, always provable in court.',
    color: 'from-teal-500 to-emerald-600',
    bg: 'bg-teal-50',
  },
]

const steps = [
  {
    number: '01',
    title: 'Upload Evidence',
    description: 'Authenticated investigators securely upload digital evidence files through the encrypted interface.',
    icon: FileCheck,
  },
  {
    number: '02',
    title: 'Hash & Store on IPFS',
    description: 'The system computes a SHA-256 hash and uploads the file to the IPFS distributed network.',
    icon: Database,
  },
  {
    number: '03',
    title: 'Record on Blockchain',
    description: 'Evidence metadata, hash, and timestamp are permanently written to an Ethereum smart contract.',
    icon: Link2,
  },
  {
    number: '04',
    title: 'Verify & Audit',
    description: 'Any authorized party can instantly verify evidence integrity by querying the blockchain record.',
    icon: BadgeCheck,
  },
]

const roles = [
  {
    title: 'Investigators',
    description: 'Upload, manage, and track digital evidence with full chain-of-custody documentation.',
    perms: ['Upload evidence files', 'View own evidence', 'Generate evidence IDs', 'Access dashboard'],
    color: 'border-emerald-200 bg-gradient-to-br from-white to-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Law Enforcement',
    description: 'Review and verify evidence submitted by investigators for case proceedings.',
    perms: ['View all evidence', 'Verify file integrity', 'Generate audit reports', 'Access dashboard'],
    color: 'border-blue-200 bg-gradient-to-br from-white to-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    title: 'Administrators',
    description: 'Full system oversight including user management and platform configuration.',
    perms: ['Full system access', 'Manage all users', 'View system logs', 'Configure settings'],
    color: 'border-violet-200 bg-gradient-to-br from-white to-violet-50',
    badge: 'bg-violet-100 text-violet-700',
  },
]

function AnimatedCounter({ target, suffix = '' }: { target: string; suffix?: string }) {
  return <span>{target}{suffix}</span>
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-gray-100'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">B-CEL</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#roles" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Roles</a>
            <Link href="/about" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">About</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/signin" className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors px-4 py-2 rounded-lg hover:bg-gray-100">
              Sign In
            </Link>
            <Link href="/register" className="text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-5 py-2.5 rounded-xl shadow-md shadow-emerald-200 hover:shadow-lg hover:shadow-emerald-300 transition-all duration-200 flex items-center gap-1.5">
              Get Started
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0fdf4_1px,transparent_1px),linear-gradient(to_bottom,#f0fdf4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_40%,transparent_100%)]" />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-300/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-300/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/30 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Blockchain-Secured Evidence Management
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-gray-900 mb-6 leading-[1.05]">
            Evidence that{' '}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                can't be touched
              </span>
              <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full opacity-60" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            B-CEL uses <strong className="text-gray-700 font-semibold">blockchain</strong> and <strong className="text-gray-700 font-semibold">IPFS</strong> to store digital evidence with cryptographic integrity — immutable, transparent, and court-admissible.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-2xl hover:shadow-emerald-300 transition-all duration-300 hover:-translate-y-0.5">
              Start Securing Evidence
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/about" className="inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-emerald-300 text-gray-700 hover:text-emerald-700 font-bold text-lg px-8 py-4 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              Learn How It Works
            </Link>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-2xl font-black text-emerald-600 mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="py-10 px-6 bg-gray-50 border-y border-gray-100">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">
            Built with enterprise-grade technology
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
            {['Ethereum Blockchain', 'IPFS Network', 'SHA-256 Hashing', 'JWT Auth', 'MongoDB', 'Node.js'].map((tech) => (
              <span key={tech} className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-default">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              Core Capabilities
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              Built for the{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                highest stakes
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              Every feature is designed around one principle: evidence that is stored here cannot be disputed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group relative bg-white border border-gray-100 rounded-3xl p-8 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Subtle gradient bg on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-transparent transition-all duration-300 rounded-3xl" />

                  <div className="relative">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-28 px-6 bg-gray-950 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Globe className="w-4 h-4" />
              The Process
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
              How it{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-light">
              From upload to court-ready verification in four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={step.number} className="relative group">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-full w-full h-px bg-gradient-to-r from-emerald-500/50 to-transparent z-10 -translate-y-1/2" style={{ width: 'calc(100% - 2rem)', left: 'calc(100% - 1rem)' }} />
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-5xl font-black text-emerald-500/30 leading-none">{step.number}</span>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-5 shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4" />
              Access Control
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight">
              The right access,{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                for every role
              </span>
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto font-light">
              Granular role-based permissions ensure each user sees exactly what they need — nothing more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {roles.map((role) => (
              <div key={role.title} className={`border-2 rounded-3xl p-8 ${role.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold mb-6 ${role.badge}`}>
                  {role.title}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">{role.title}</h3>
                <p className="text-gray-500 mb-6 leading-relaxed">{role.description}</p>
                <ul className="space-y-3">
                  {role.perms.map((perm) => (
                    <li key={perm} className="flex items-center gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      {perm}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-28 px-6 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 text-white text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <Shield className="w-4 h-4" />
            Trusted by Law Enforcement
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight leading-tight">
            Ready to secure your evidence?
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto font-light">
            Join investigators and law enforcement agencies using B-CEL to store evidence that holds up in court.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="group inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
              Create Your Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/signin" className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-gray-400 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">B-CEL</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                Blockchain-Based Cyber Evidence Locker. Immutable, transparent, and court-admissible digital evidence management.
              </p>
              <div className="mt-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs text-emerald-500 font-medium">System Operational</span>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Platform</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Features', href: '#features' },
                  { label: 'How It Works', href: '#how-it-works' },
                  { label: 'About', href: '/about' },
                ].map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-3">
                {[
                  { label: 'Sign In', href: '/signin' },
                  { label: 'Register', href: '/register' },
                  { label: 'Dashboard', href: '/dashboard' },
                ].map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">
              © 2026 B-CEL. Blockchain-Based Cyber Evidence Locker. For authorized law enforcement use only.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-600">Secured by blockchain technology</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span className="text-xs text-emerald-500 font-medium">Enterprise-grade encryption</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
