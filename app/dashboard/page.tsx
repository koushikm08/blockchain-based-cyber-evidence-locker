'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Shield, Search, Eye, FileCheck, Loader2, Upload,
  LogOut, LayoutDashboard, CheckCircle2, Clock, AlertTriangle,
  Database, ChevronRight, ArrowUpRight, RefreshCw, User, Settings
} from 'lucide-react'
import Loading from './loading'

interface Evidence {
  id: string
  evidenceId: string
  fileName: string
  hash: string
  cid: string
  timestamp: string
  status: 'verified' | 'pending' | 'compromised'
}

export default function DashboardPage() {
  const router = useRouter()
  const [userRole, setUserRole] = useState('')
  const [userName, setUserName] = useState('')
  const [userOrg, setUserOrg] = useState('')
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEvidence, setFilteredEvidence] = useState<Evidence[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserRole(user.role || '')
    setUserName(user.fullName || 'User')
    setUserOrg(user.organization || '')
    fetchEvidence()
  }, [])

  useEffect(() => {
    const filtered = evidenceList.filter(
      (item) =>
        item.evidenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredEvidence(filtered)
  }, [searchTerm, evidenceList])

  const fetchEvidence = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/list`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (!response.ok) { setLoading(false); setRefreshing(false); return }
      const data = await response.json()
      setEvidenceList(data.evidence || [])
    } catch (err) {
      console.error('Error fetching evidence:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  const getRoleBadge = (role: string) => {
    const map: Record<string, string> = {
      investigator: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      law_enforcement: 'bg-blue-100 text-blue-700 border-blue-200',
      admin: 'bg-violet-100 text-violet-700 border-violet-200',
    }
    const labels: Record<string, string> = {
      investigator: 'Investigator',
      law_enforcement: 'Law Enforcement',
      admin: 'Administrator',
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${map[role] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
        {labels[role] || role}
      </span>
    )
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return { label: 'Verified', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' }
      case 'compromised':
        return { label: 'Compromised', icon: AlertTriangle, className: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' }
      default:
        return { label: 'Pending', icon: Clock, className: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' }
    }
  }

  const stats = [
    {
      label: 'Total Evidence',
      value: evidenceList.length,
      icon: Database,
      color: 'from-emerald-500 to-green-600',
      bg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      desc: 'files stored',
    },
    {
      label: 'Verified',
      value: evidenceList.filter(e => e.status === 'verified').length,
      icon: CheckCircle2,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50',
      textColor: 'text-blue-600',
      desc: 'integrity confirmed',
    },
    {
      label: 'Pending',
      value: evidenceList.filter(e => e.status === 'pending').length,
      icon: Clock,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      textColor: 'text-amber-600',
      desc: 'awaiting verification',
    },
    {
      label: 'Compromised',
      value: evidenceList.filter(e => e.status === 'compromised').length,
      icon: AlertTriangle,
      color: 'from-red-500 to-rose-600',
      bg: 'bg-red-50',
      textColor: 'text-red-600',
      desc: 'requires attention',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── SIDEBAR (desktop) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-950 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white">B-CEL</span>
              <p className="text-xs text-gray-500">Evidence Locker</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-3">Navigation</div>

          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm">
            <LayoutDashboard className="w-4 h-4 text-emerald-400" />
            Dashboard
          </Link>

          {userRole !== 'law_enforcement' && (
            <Link href="/upload" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium text-sm transition-all">
              <Upload className="w-4 h-4" />
              Upload Evidence
            </Link>
          )}

          <Link href="/verify" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium text-sm transition-all">
            <FileCheck className="w-4 h-4" />
            Verify Evidence
          </Link>

          <Link href="/about" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium text-sm transition-all">
            <Database className="w-4 h-4" />
            About
          </Link>

          {userRole === 'admin' && (
            <>
              <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-3 mt-6">Admin</div>
              <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium text-sm transition-all">
                <Settings className="w-4 h-4" />
                Admin Panel
              </Link>
            </>
          )}
        </nav>

        {/* User profile */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{userOrg}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 font-medium text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            {/* Mobile logo */}
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">B-CEL</span>
            </div>

            {/* Page title (desktop) */}
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
              <p className="text-xs text-gray-500">Welcome back, {userName}</p>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              {getRoleBadge(userRole)}
              <button
                onClick={handleLogout}
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Page header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-1">Evidence Overview</h2>
              <p className="text-gray-500 text-sm">Monitor and manage all stored digital evidence</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                onClick={() => fetchEvidence(true)}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 text-sm font-semibold transition-all hover:bg-emerald-50 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {userRole !== 'law_enforcement' && (
                <Link
                  href="/upload"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white text-sm font-bold shadow-md shadow-emerald-200 hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  <Upload className="w-4 h-4" />
                  Upload Evidence
                </Link>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all duration-200 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                  </div>
                  <div className={`text-3xl font-black ${stat.textColor} mb-1`}>{stat.value}</div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.desc}</div>
                </div>
              )
            })}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {userRole !== 'law_enforcement' && (
              <Link href="/upload" className="group flex items-center gap-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-5 hover:from-emerald-600 hover:to-green-700 transition-all hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold">Upload New Evidence</p>
                  <p className="text-emerald-100 text-sm">Securely store a new file on blockchain</p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link href="/verify" className="group flex items-center gap-4 bg-white border-2 border-gray-100 hover:border-emerald-200 rounded-2xl p-5 transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-bold">Verify Evidence</p>
                <p className="text-gray-500 text-sm">Check integrity against blockchain record</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

          {/* Evidence Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Evidence Records</h3>
                <p className="text-xs text-gray-500 mt-0.5">{filteredEvidence.length} of {evidenceList.length} records</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search evidence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            <Suspense fallback={<Loading />}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium">Loading evidence records...</p>
                </div>
              ) : filteredEvidence.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Database className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {searchTerm ? 'No results found' : 'No evidence yet'}
                    </h4>
                    <p className="text-gray-500 text-sm max-w-xs">
                      {searchTerm
                        ? `No evidence matches "${searchTerm}". Try a different search.`
                        : 'Start by uploading your first piece of digital evidence to the blockchain.'}
                    </p>
                  </div>
                  {!searchTerm && userRole !== 'law_enforcement' && (
                    <Link
                      href="/upload"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 mt-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload First Evidence
                    </Link>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Evidence ID</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">File Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredEvidence.map((evidence) => {
                        const statusConfig = getStatusConfig(evidence.status)
                        const StatusIcon = statusConfig.icon
                        return (
                          <tr key={evidence.id} className="hover:bg-gray-50/80 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                                {evidence.evidenceId}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  <Database className="w-3.5 h-3.5 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                                  {evidence.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.className}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                                {statusConfig.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-500">
                                {new Date(evidence.timestamp).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric'
                                })}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Link href={`/verify?id=${evidence.evidenceId}`}>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 text-xs font-semibold transition-all hover:bg-emerald-50">
                                    <Eye className="w-3.5 h-3.5" />
                                    View
                                  </button>
                                </Link>
                                <Link href={`/verify?id=${evidence.evidenceId}`}>
                                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-all shadow-sm">
                                    <FileCheck className="w-3.5 h-3.5" />
                                    Verify
                                  </button>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Suspense>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              B-CEL Dashboard • Blockchain-Based Cyber Evidence Locker •{' '}
              <span className="text-emerald-500 font-semibold">v1.0</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
