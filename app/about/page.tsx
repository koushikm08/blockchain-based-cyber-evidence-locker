'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield, Lock, Database, Link2, Zap, ChevronLeft,
  CheckCircle2, ArrowRight, Globe, Users, BadgeCheck,
  FileCheck, Eye, Fingerprint, LayoutDashboard, LogOut,
  Hash, Server, Cpu, GitBranch, Award, BookOpen
} from 'lucide-react'

export default function AboutPage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (token && user?.role) {
      setIsLoggedIn(true)
      setUserRole(user.role || '')
      setUserName(user.fullName || 'User')
    }
  }, [])

  const handleBack = () => {
    router.back()
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  const getDashboardLink = () => {
    if (userRole === 'admin') return '/admin'
    return '/dashboard'
  }

  const techStack = [
    { icon: Hash, label: 'SHA-256', desc: 'Cryptographic hashing', color: 'from-emerald-500 to-green-600', bg: 'bg-emerald-950/50', border: 'border-emerald-500/20' },
    { icon: Globe, label: 'IPFS', desc: 'Decentralized storage', color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-950/50', border: 'border-blue-500/20' },
    { icon: Link2, label: 'Ethereum', desc: 'Smart contracts', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-950/50', border: 'border-violet-500/20' },
    { icon: Server, label: 'Node.js', desc: 'Backend API', color: 'from-orange-500 to-amber-600', bg: 'bg-orange-950/50', border: 'border-orange-500/20' },
    { icon: Database, label: 'MongoDB', desc: 'User data store', color: 'from-teal-500 to-emerald-600', bg: 'bg-teal-950/50', border: 'border-teal-500/20' },
    { icon: Cpu, label: 'Solidity', desc: 'Smart contract language', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-950/50', border: 'border-rose-500/20' },
  ]

  const features = [
    {
      icon: Lock,
      title: 'Cryptographic Integrity',
      description: 'Every evidence file is fingerprinted with SHA-256 hashing. Any tampering — even a single byte — is instantly detectable.',
      color: 'from-emerald-500 to-green-600',
    },
    {
      icon: Database,
      title: 'Decentralized Storage',
      description: 'Files live on IPFS — a distributed peer-to-peer network with no single point of failure, replicated globally.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Link2,
      title: 'Immutable Blockchain',
      description: 'Metadata, hashes, and timestamps are permanently recorded on Ethereum smart contracts. Once written, nothing changes.',
      color: 'from-violet-500 to-purple-600',
    },
    {
      icon: Eye,
      title: 'Instant Verification',
      description: 'Auditors verify evidence authenticity in seconds by querying the blockchain — no manual checks, no disputes.',
      color: 'from-orange-500 to-amber-600',
    },
    {
      icon: Users,
      title: 'Role-Based Access',
      description: 'Investigators, law enforcement, and admins each have precisely scoped permissions and access controls.',
      color: 'from-rose-500 to-pink-600',
    },
    {
      icon: BadgeCheck,
      title: 'Full Audit Trail',
      description: 'Every action is timestamped and logged on-chain. Complete chain of custody, always provable in court.',
      color: 'from-teal-500 to-emerald-600',
    },
  ]

  const steps = [
    {
      number: '01',
      icon: FileCheck,
      title: 'Investigator Uploads Evidence',
      description: 'Authenticated user submits a digital evidence file through the secure, encrypted interface.',
    },
    {
      number: '02',
      icon: Hash,
      title: 'SHA-256 Hash Computed',
      description: 'System generates a unique 256-bit cryptographic fingerprint of the file — any modification changes this hash.',
    },
    {
      number: '03',
      icon: Globe,
      title: 'IPFS Upload & CID Generated',
      description: 'File is uploaded to the IPFS distributed network, receiving a unique Content Identifier (CID) for retrieval.',
    },
    {
      number: '04',
      icon: Link2,
      title: 'Blockchain Recording',
      description: 'Evidence metadata (ID, hash, CID, timestamp, uploader) is permanently written to an Ethereum smart contract.',
    },
    {
      number: '05',
      icon: BadgeCheck,
      title: 'Auditor Verification',
      description: 'Any authorized party queries the Evidence ID — system verifies hash against blockchain and IPFS, confirming integrity.',
    },
  ]

  const roles = [
    {
      icon: Fingerprint,
      title: 'Investigators',
      description: 'Upload, manage, and track digital evidence with full chain-of-custody documentation.',
      perms: ['Upload evidence files', 'View own evidence', 'Generate evidence IDs', 'Access dashboard'],
      color: 'from-emerald-500 to-green-600',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
      badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      icon: Users,
      title: 'Law Enforcement',
      description: 'Review and verify evidence submitted by investigators for case proceedings.',
      perms: ['View all evidence', 'Verify file integrity', 'Generate audit reports', 'Access dashboard'],
      color: 'from-blue-500 to-cyan-600',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
      badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    },
    {
      icon: BadgeCheck,
      title: 'Administrators',
      description: 'Full system oversight including user management and platform configuration.',
      perms: ['Full system access', 'Manage all users', 'View system logs', 'Configure settings'],
      color: 'from-violet-500 to-purple-600',
      border: 'border-violet-500/30',
      bg: 'bg-violet-500/10',
      badge: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    },
  ]

  const specs = [
    {
      icon: Lock,
      title: 'Cryptography',
      items: [
        { label: 'Algorithm', value: 'SHA-256 (NIST FIPS 180-4)' },
        { label: 'Output', value: '256-bit hexadecimal string' },
        { label: 'Collision Resistance', value: 'Computationally infeasible' },
      ],
    },
    {
      icon: Database,
      title: 'Storage',
      items: [
        { label: 'Network', value: 'IPFS peer-to-peer' },
        { label: 'Redundancy', value: 'Multi-node replication' },
        { label: 'Retention', value: 'Permanent with pinning' },
      ],
    },
    {
      icon: Link2,
      title: 'Blockchain',
      items: [
        { label: 'Platform', value: 'Ethereum (Ganache local)' },
        { label: 'Language', value: 'Solidity smart contracts' },
        { label: 'Consensus', value: 'Proof of Stake (PoS)' },
      ],
    },
    {
      icon: Zap,
      title: 'Performance',
      items: [
        { label: 'Upload Time', value: '5–30 seconds' },
        { label: 'Verification', value: 'Instant hash check' },
        { label: 'File Size', value: 'Up to several GB' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden">

      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 bg-gray-950/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Left: Back button + Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white transition-colors group px-3 py-2 rounded-xl hover:bg-white/5"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back
            </button>
            <div className="w-px h-5 bg-white/10" />
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-105 transition-transform">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white">B-CEL</span>
            </Link>
          </div>

          {/* Right: Auth-aware actions */}
          <div className="flex items-center gap-3">
            {mounted && isLoggedIn ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-red-400 transition-colors px-4 py-2 rounded-xl hover:bg-red-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/signin"
                  className="text-sm font-semibold text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-xl hover:bg-white/5"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/50 transition-all hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative py-24 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff06_1px,transparent_1px),linear-gradient(to_bottom,#ffffff06_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-500/8 rounded-full blur-3xl" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-8">
            <BookOpen className="w-4 h-4" />
            About the Platform
          </div>

          <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
            About{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              B-CEL
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed font-light mb-10">
            A comprehensive <strong className="text-white font-semibold">blockchain-based</strong> solution for secure, immutable, and transparent digital evidence management in modern law enforcement.
          </p>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '100%', label: 'Tamper-Proof' },
              { value: 'SHA-256', label: 'Encryption' },
              { value: 'IPFS', label: 'Decentralized' },
              { value: '24/7', label: 'Availability' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 hover:bg-white/8 hover:border-emerald-500/20 transition-all">
                <div className="text-2xl font-black text-emerald-400 mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM & SOLUTION ── */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Problem */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 hover:border-red-500/30 transition-all">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                The Problem
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Traditional systems fail</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Conventional evidence storage faces critical vulnerabilities that compromise legal proceedings:
              </p>
              <ul className="space-y-4">
                {[
                  { title: 'Centralized vulnerability', desc: 'Single point of failure and potential tampering' },
                  { title: 'Chain of custody issues', desc: 'Difficult to track evidence access and modifications' },
                  { title: 'Data loss risk', desc: 'Evidence can be permanently deleted or corrupted' },
                  { title: 'Lack of transparency', desc: 'Limited audit capabilities for verification' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-sm">{item.title}:</span>
                      <span className="text-gray-400 text-sm ml-1">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-8 hover:border-emerald-500/30 transition-all">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                Our Solution
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Blockchain solves it all</h2>
              <p className="text-gray-400 mb-6 leading-relaxed">
                B-CEL leverages blockchain and IPFS technology to provide unbreakable evidence integrity:
              </p>
              <ul className="space-y-4">
                {[
                  { title: 'Immutable records', desc: 'Evidence cannot be altered once stored on-chain' },
                  { title: 'Complete transparency', desc: 'Full audit trail with cryptographic timestamps' },
                  { title: 'Decentralized storage', desc: 'Redundant copies across global IPFS nodes' },
                  { title: 'Cryptographic verification', desc: 'SHA-256 integrity checking on every file' },
                ].map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-white font-semibold text-sm">{item.title}:</span>
                      <span className="text-gray-400 text-sm ml-1">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── TECH STACK ── */}
      <section className="py-20 px-6 bg-gray-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Cpu className="w-4 h-4" />
              Technology Stack
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built with{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                enterprise-grade
              </span>{' '}
              tech
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Every component is chosen for reliability, security, and performance in high-stakes environments.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {techStack.map((tech) => {
              const Icon = tech.icon
              return (
                <div
                  key={tech.label}
                  className={`${tech.bg} border ${tech.border} rounded-2xl p-5 flex flex-col items-center text-center gap-3 hover:scale-105 transition-all duration-300 group cursor-default`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{tech.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{tech.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Zap className="w-4 h-4" />
              Core Capabilities
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Built for the{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                highest stakes
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
              Every feature is designed around one principle: evidence stored here cannot be disputed.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:bg-white/8 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 px-6 bg-gray-900/50 border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3rem_3rem]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <GitBranch className="w-4 h-4" />
              Evidence Flow
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              How it{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                works
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">
              From upload to court-ready verification in five transparent steps.
            </p>
          </div>

          <div className="space-y-4">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group flex gap-6 bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 hover:border-emerald-500/20 transition-all duration-300"
                >
                  {/* Step number */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50 group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px flex-1 min-h-[20px] bg-gradient-to-b from-emerald-500/30 to-transparent" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-black text-emerald-500/60 uppercase tracking-widest">Step {step.number}</span>
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{step.description}</p>
                  </div>

                  {/* Hash example for step 2 */}
                  {i === 1 && (
                    <div className="hidden md:flex flex-shrink-0 items-center">
                      <div className="bg-emerald-950/80 border border-emerald-500/20 rounded-xl px-4 py-3">
                        <p className="text-xs text-emerald-500/60 mb-1 font-mono">SHA-256</p>
                        <p className="text-xs font-mono text-emerald-400 break-all max-w-[200px]">
                          a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f...
                        </p>
                      </div>
                    </div>
                  )}
                  {i === 2 && (
                    <div className="hidden md:flex flex-shrink-0 items-center">
                      <div className="bg-blue-950/80 border border-blue-500/20 rounded-xl px-4 py-3">
                        <p className="text-xs text-blue-500/60 mb-1 font-mono">IPFS CID</p>
                        <p className="text-xs font-mono text-blue-400 break-all max-w-[200px]">
                          QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8...
                        </p>
                      </div>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="hidden md:flex flex-shrink-0 items-center">
                      <div className="bg-violet-950/80 border border-violet-500/20 rounded-xl px-4 py-3">
                        <p className="text-xs text-violet-500/60 mb-1 font-mono">Block</p>
                        <p className="text-xs font-mono text-violet-400">
                          #18,523,482 • Tx: 0x3f7d...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Users className="w-4 h-4" />
              Access Control
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              The right access,{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                for every role
              </span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto text-lg font-light">
              Granular role-based permissions ensure each user sees exactly what they need — nothing more.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon
              return (
                <div
                  key={role.title}
                  className={`border ${role.border} ${role.bg} rounded-3xl p-8 hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${role.badge} mb-6`}>
                    <Icon className="w-3.5 h-3.5" />
                    {role.title}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-3">{role.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed text-sm">{role.description}</p>
                  <ul className="space-y-3">
                    {role.perms.map((perm) => (
                      <li key={perm} className="flex items-center gap-3 text-sm text-gray-300">
                        <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${role.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        </div>
                        {perm}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── TECHNICAL SPECS ── */}
      <section className="py-24 px-6 bg-gray-900/50 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-gray-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Award className="w-4 h-4" />
              Technical Specifications
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Under the{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                hood
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {specs.map((spec) => {
              const Icon = spec.icon
              return (
                <div key={spec.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-white/8 transition-all">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-white">{spec.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {spec.items.map((item) => (
                      <div key={item.label}>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                        <p className="text-sm text-gray-300 font-medium">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SECURITY & COMPLIANCE ── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              Security & Compliance
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Enterprise-grade{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                security
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-emerald-400" />
                Security Measures
              </h3>
              <ul className="space-y-4">
                {[
                  'End-to-end encryption for data transmission',
                  'JWT-based authentication with secure tokens',
                  'Role-based access control (RBAC)',
                  'Immutable audit logs on blockchain',
                  'Regular security audits and penetration testing',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/20 transition-all">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                Compliance Standards
              </h3>
              <ul className="space-y-4">
                {[
                  'NIST Cybersecurity Framework',
                  'Chain of Custody (CoC) standards',
                  'Federal Rules of Evidence (FRE)',
                  'ISO/IEC 27001 Information Security',
                  'GDPR and data protection compliance',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-gray-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gradient-to-br from-emerald-600 via-green-600 to-teal-700 relative overflow-hidden">
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
            {mounted && isLoggedIn ? (
              <Link
                href={getDashboardLink()}
                className="group inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-5 h-5" />
                Go to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2 bg-white text-emerald-700 hover:bg-emerald-50 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Create Your Account
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signin"
                  className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 hover:bg-white/20 text-white font-bold text-lg px-8 py-4 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 border-t border-white/10 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">B-CEL</span>
          </div>
          <p className="text-sm text-gray-600 text-center">
            © 2026 B-CEL. Blockchain-Based Cyber Evidence Locker. For authorized law enforcement use only.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-500 font-medium">System Operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
