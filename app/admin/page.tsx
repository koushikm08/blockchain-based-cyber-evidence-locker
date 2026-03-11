'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Users, Trash2, Edit, Loader2, LogOut, LayoutDashboard, ArrowLeft } from 'lucide-react'

interface User {
    _id: string
    fullName: string
    email: string
    organization: string
    role: 'admin' | 'investigator' | 'law_enforcement'
    createdAt: string
}

export default function AdminDashboardPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        if (!user.token && !localStorage.getItem('token')) {
            router.push('/signin')
        } else if (user.role !== 'admin') {
            router.push('/dashboard')
        } else {
            fetchUsers()
        }
    }, [router])

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data.users || [])
        } catch (err) {
            setError('Failed to load users')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
            })

            if (response.ok) {
                setUsers(users.filter(u => u._id !== userId))
            } else {
                alert('Failed to delete user')
            }
        } catch (err) {
            console.error(err)
            alert('Error deleting user')
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
            console.error(err)
            alert('Error updating role')
        }
    }

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organization.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return <Badge className="bg-red-500/10 text-red-500 border-red-500/30">Admin</Badge>
            case 'investigator':
                return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Investigator</Badge>
            case 'law_enforcement':
                return <Badge className="bg-green-500/10 text-green-500 border-green-500/30">Law Enforcement</Badge>
            default:
                return <Badge variant="outline">{role}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="text-lg font-bold text-foreground">B-CEL</div>
                            <div className="text-xs text-muted-foreground">Admin Panel</div>
                        </div>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                            <LayoutDashboard className="w-4 h-4" /> User Dashboard
                        </Link>
                        <Button onClick={() => { localStorage.clear(); window.location.href = '/' }} size="sm" variant="outline" className="border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300">
                            <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                    </nav>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                {/* Back Button */}
                <div className="mb-8 flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="gap-2 text-muted-foreground hover:text-foreground hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div className="text-sm text-muted-foreground">Admin / User Management</div>
                </div>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-foreground mb-2">User Management</h1>
                        <p className="text-muted-foreground">Manage system users, roles, and access permissions</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-muted-foreground" />
                        <span className="text-lg font-semibold">{users.length} Users</span>
                    </div>
                </div>

                {/* Search */}
                <Card className="border-slate-200 mb-8 shadow-md">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5" />
                            Search Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="relative">
                            <Users className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search users by name, email, or organization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-slate-300 focus-visible:ring-green-500 focus-visible:border-green-500"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                {loading ? (
                    <Card className="border-slate-200 shadow-md">
                        <CardContent className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        </CardContent>
                    </Card>
                ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden shadow-md bg-white">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Organization</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
                                    <th className="px-6 py-3 text-right text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map(user => (
                                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-foreground">{user.fullName}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">{user.organization}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                className="bg-white border border-slate-300 rounded px-3 py-1.5 text-sm font-medium text-foreground hover:border-slate-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                            >
                                                <option value="admin">Admin</option>
                                                <option value="investigator">Investigator</option>
                                                <option value="law_enforcement">Law Enforcement</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredUsers.length === 0 && (
                            <div className="p-8 text-center text-muted-foreground bg-slate-50">No users found matching search.</div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
