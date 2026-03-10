'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Shield, Plus, Search, Eye, FileCheck, Loader2, Upload, ArrowLeft, LogOut } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
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
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredEvidence, setFilteredEvidence] = useState<Evidence[]>([])
  const searchParams = useSearchParams()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserRole(user.role || '')
    setUserName(user.fullName || 'User')
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

  const fetchEvidence = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/list`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        console.error('Failed to fetch evidence')
        setLoading(false)
        return
      }

      const data = await response.json()
      setEvidenceList(data.evidence || [])
    } catch (err) {
      console.error('Error fetching evidence:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-50 text-green-700 border-green-200 shadow-sm">✓ Verified</Badge>
      case 'compromised':
        return <Badge className="bg-red-50 text-red-700 border-red-200 shadow-sm">✗ Compromised</Badge>
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 shadow-sm">⏳ Pending</Badge>
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
              <div className="text-xs text-muted-foreground">Cyber Evidence Locker</div>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {userRole === 'admin' && (
              <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Admin Panel
              </Link>
            )}
            {userRole !== 'law_enforcement' && (
              <Link href="/upload" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Upload
              </Link>
            )}
            <Link href="/verify" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Verify
            </Link>
            <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleLogout}
            className="border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
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
          <div className="text-sm text-muted-foreground">Dashboard / {userName}</div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Evidence</h1>
          <p className="text-muted-foreground">Monitor, manage, and verify all your stored digital evidence</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Total Evidence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{evidenceList.length}</div>
              <p className="text-xs text-muted-foreground mt-1">files stored</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Verified</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {evidenceList.filter((e) => e.status === 'verified').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">integrity confirmed</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {evidenceList.filter((e) => e.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">awaiting verification</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardDescription className="text-muted-foreground">Compromised</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {evidenceList.filter((e) => e.status === 'compromised').length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {userRole !== 'law_enforcement' && (
            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all">
              <Link href="/upload" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Evidence
              </Link>
            </Button>
          )}
          <Button variant="outline" className="border-slate-300 hover:bg-slate-50">
            <Link href="/verify" className="flex items-center gap-2">
              <FileCheck className="w-4 h-4" />
              Verify Evidence
            </Link>
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="border-slate-200 mb-8 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Search Evidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by Evidence ID or file name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-300 focus-visible:ring-green-500 focus-visible:border-green-500"
              />
            </div>
          </CardContent>
        </Card>

        {/* Evidence Table */}
        <Suspense fallback={<Loading />}>
          {loading ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mr-3" />
                <span className="text-muted-foreground">Loading evidence...</span>
              </CardContent>
            </Card>
          ) : filteredEvidence.length === 0 ? (
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileCheck className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Evidence Found</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                  {searchTerm
                    ? 'No evidence matches your search. Try a different query.'
                    : 'You haven\'t uploaded any evidence yet. Start by uploading your first piece of digital evidence.'}
                </p>
                {!searchTerm && userRole !== 'law_enforcement' && (
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Link href="/upload">Upload Your First Evidence</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-sm bg-white">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Evidence ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">File Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Timestamp</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredEvidence.map((evidence) => (
                    <tr key={evidence.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono text-green-600">{evidence.evidenceId}</td>
                      <td className="px-6 py-4 text-sm text-foreground max-w-xs truncate">{evidence.fileName}</td>
                      <td className="px-6 py-4 text-sm">{getStatusBadge(evidence.status)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(evidence.timestamp).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <Link href={`/verify?id=${evidence.evidenceId}`}>
                            <Button size="sm" variant="outline" className="border-slate-300 text-green-600 hover:bg-green-50 hover:border-green-300">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Link href={`/verify?id=${evidence.evidenceId}`}>
                            <Button size="sm" className="bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 hover:from-green-100 hover:to-emerald-100 border border-green-200">
                              <FileCheck className="w-4 h-4 mr-1" />
                              Verify
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Suspense>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>B-CEL Dashboard • Blockchain-Based Cyber Evidence Locker • <span className="text-green-600">v1.0</span></p>
        </div>
      </main>
    </div>
  )
}
