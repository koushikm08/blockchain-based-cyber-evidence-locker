'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Shield, Users, Trash2, Loader2, LogOut, LayoutDashboard,
  Search, RefreshCw, User, Settings, ArrowUpRight, BadgeCheck, Fingerprint
} from 'lucide-react'

interface UserItem {
  _id: string
  fullName: string
  email: string
  organization: string
  role: 'admin' | 'investigator' | 'law_enforcement'
  createdAt: string
}

const roleStyles: Record<string, { label: string; className: string; dot: string }> = {
  admin: { label: 'Administrator', className: 'bg-violet-50 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  investigator: { label: 'Investigator', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  law_enforcement: { label: 'Law Enforcement', className: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!localStorage.getItem('token')) {
      router.push('/signin')
    } else if (user.role !== 'admin') {
      router.push('/dashboard')
    } else {
      fetchUsers()
    }
  }, [router])

  const fetchUsers = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return
    setDeletingId(userId)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      })
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId))
      } else {
        alert('Failed to delete user')
      }
    } catch (err) {
      alert('Error deleting user')
    } finally {
      setDeletingId(null)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole })
      })
      if (response.ok) {
        setUsers(users.map(u => u._id === userId ? { ...u, role: newRole as any } : u))
      } else {
        alert('Failed to update role')
      }
    } catch (err) {
      alert('Error updating role')
    }
  }

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organization.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = [
    { label: 'Total Users', value: users.length, color: 'from-emerald-500 to-green-600', textColor: 'text-emerald-600', desc: 'registered accounts' },
    { label: 'Investigators', value: users.filter(u => u.role === 'investigator').length, color: 'from-blue-500 to-cyan-600', textColor: 'text-blue-600', desc: 'active investigators' },
    { label: 'Law Enforcement', value: users.filter(u => u.role === 'law_enforcement').length, color: 'from-amber-500 to-orange-600', textColor: 'text-amber-600', desc: 'officers' },
    { label: 'Administrators', value: users.filter(u => u.role === 'admin').length, color: 'from-violet-500 to-purple-600', textColor: 'text-violet-600', desc: 'system admins' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── SIDEBAR ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 bg-gray-950 flex-col z-40">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-900/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-base font-bold text-white">B-CEL</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <div className="text-xs font-bold text-gray-600 uppercase tracking-wider px-3 mb-3">Navigation</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium text-sm transition-all">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-sm">
            <Settings className="w-4 h-4 text-emerald-400" />
            User Management
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Administrator</p>
              <p className="text-xs text-gray-500">Full system access</p>
            </div>
          </div>
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/' }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 font-medium text-sm transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="lg:pl-64">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-gray-900">B-CEL Admin</span>
            </div>
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">User management & system control</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border bg-violet-100 text-violet-700 border-violet-200">
                Administrator
              </span>
              <button
                onClick={() => { localStorage.clear(); window.location.href = '/' }}
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
              <h2 className="text-2xl font-black text-gray-900 mb-1">User Management</h2>
              <p className="text-gray-500 text-sm">Manage system users, roles, and access permissions</p>
            </div>
            <button
              onClick={() => fetchUsers(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 hover:border-emerald-300 text-gray-600 hover:text-emerald-700 text-sm font-semibold transition-all hover:bg-emerald-50 disabled:opacity-50 flex-shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-400 transition-colors" />
                </div>
                <div className={`text-3xl font-black ${stat.textColor} mb-1`}>{stat.value}</div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.desc}</div>
              </div>
            ))}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Registered Users</h3>
                <p className="text-xs text-gray-500 mt-0.5">{filteredUsers.length} of {users.length} users</p>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                </div>
                <p className="text-gray-500 text-sm font-medium">Loading users...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <p className="text-red-500 font-medium">{error}</p>
                <button onClick={() => fetchUsers()} className="text-sm text-emerald-600 hover:underline font-medium">Try again</button>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {searchTerm ? `No users match "${searchTerm}"` : 'No users registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.map((user) => {
                      const roleStyle = roleStyles[user.role] || roleStyles.investigator
                      return (
                        <tr key={user._id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600 font-medium">{user.organization}</span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={user.role}
                              onChange={(e) => handleRoleChange(user._id, e.target.value)}
                              className="text-xs font-bold border-2 border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 hover:border-emerald-300 focus:border-emerald-500 focus:outline-none transition-all cursor-pointer"
                            >
                              <option value="admin">Administrator</option>
                              <option value="investigator">Investigator</option>
                              <option value="law_enforcement">Law Enforcement</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                month: 'short', day: 'numeric', year: 'numeric'
                              })}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={deletingId === user._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {deletingId === user._id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              Delete
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              B-CEL Admin Panel • Blockchain-Based Cyber Evidence Locker •{' '}
              <span className="text-emerald-500 font-semibold">v1.0</span>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
