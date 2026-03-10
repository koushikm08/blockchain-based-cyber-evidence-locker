'use client'

import React, { Suspense, useEffect } from "react"
import Loading from './loading'

import { useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, AlertCircle, Search, Loader2, Copy, X, Download, ArrowLeft, Shield } from 'lucide-react'
import { extractResponseError } from '@/lib/validation'

interface EvidenceData {
  id: string
  evidenceId: string
  hash: string
  cid: string
  timestamp: string
  status: 'verified' | 'compromised' | 'pending'
  fileName: string
  uploadedBy: string
  hashMatch?: boolean
  blockchainVerified?: boolean
  ipfsAvailable?: boolean
  verificationDetails?: {
    blockNumber: number
    blockchainTx: string
    lastVerified: string
    verificationCount: number
    smartContractId: number
    blockchainHash?: string
    databaseHash?: string
    ipfsHash?: string
  }
}

export default function VerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [evidenceId, setEvidenceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [evidence, setEvidence] = useState<EvidenceData | null>(null)
  const [searched, setSearched] = useState(false)
  const [copied, setCopied] = useState<string>('')
  const [initialized, setInitialized] = useState(false)
  const [userRole, setUserRole] = useState('')
  const [downloading, setDownloading] = useState(false)

  // Auto-load evidence if ID provided in query parameter
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    setUserRole(user.role || '')
    
    const idParam = searchParams.get('id')
    if (idParam && !initialized) {
      setEvidenceId(idParam)
      setInitialized(true)
      // Trigger search automatically
      performSearch(idParam)
    }
  }, [searchParams, initialized])

  const performSearch = async (id: string) => {
    setLoading(true)
    setError('')
    setEvidence(null)
    setSearched(true)

    if (!id.trim()) {
      setError('Please enter an Evidence ID')
      setLoading(false)
      setSearched(false)
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        const errorMessage = extractResponseError(data)
        setError(errorMessage)
        setLoading(false)
        return
      }

      setEvidence(data)
    } catch (err) {
      setError('An error occurred while searching. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    performSearch(evidenceId)
  }

  const handleTamper = async () => {
    if (!evidence) return;

    try {
      setLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/tamper/${evidence.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        // Re-verify to show the result
        // We'll reset error and reload
        setError('');
        // Trigger verification again
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/verify/${evidence.evidenceId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await verifyRes.json();
        setEvidence(data);
      } else {
        const errorData = await response.json();
        const errorMessage = extractResponseError(errorData);
        setError(errorMessage);
      }
    } catch (err) {
      setError('An error occurred while simulating attack.');
    } finally {
      setLoading(false);
    }
  }

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(field)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleReset = () => {
    setEvidenceId('')
    setEvidence(null)
    setError('')
    setSearched(false)
  }

  const handleDownload = async () => {
    if (!evidence) return
    
    try {
      setDownloading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/download/${evidence.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        const data = await response.json()
        const errorMessage = extractResponseError(data)
        setError(errorMessage)
        return
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = evidence.fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download evidence file. Please try again.')
      console.error('Download error:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/90 border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-foreground">B-CEL</div>
              <div className="text-xs text-muted-foreground">Cyber Evidence Locker</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Back Button */}
        <div className="mb-8 flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2 text-muted-foreground hover:text-foreground hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="text-sm text-muted-foreground">Verify / Evidence</div>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Verify Evidence</h1>
          <p className="text-muted-foreground">Authenticate evidence integrity using blockchain and IPFS records</p>
        </div>

        {/* Search Form */}
        <Card className="border-slate-200 mb-8 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle>Search Evidence</CardTitle>
            <CardDescription>Enter an Evidence ID to verify authenticity and integrity</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Evidence ID (e.g., EV-2024-00001)"
                  value={evidenceId}
                  onChange={(e) => {
                    setEvidenceId(e.target.value)
                    setError('')
                  }}
                  disabled={loading}
                  className="border-slate-300 focus-visible:ring-green-500 focus-visible:border-green-500"
                />
                <Button
                  type="submit"
                  disabled={loading || !evidenceId.trim()}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searched && evidence && (
          <div className="space-y-6">
            {/* Status Banner */}
            <Alert className={`border-2 ${evidence.status === 'verified' ? 'border-primary/50 bg-primary/5' : 'border-destructive/50 bg-destructive/5'}`}>
              <div className="flex items-center gap-2">
                {evidence.status === 'verified' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <AlertDescription className="text-primary font-semibold">
                      ✓ Evidence Verified - Integrity Confirmed
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <AlertDescription className="text-destructive font-semibold">
                      ⚠ Evidence Compromised - Tampering Detected
                    </AlertDescription>
                  </>
                )}
              </div>
            </Alert>

            {/* Evidence Details Card */}
            <Card className="border-primary/30">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Evidence Details</CardTitle>
                    <CardDescription>Complete information from blockchain records</CardDescription>
                  </div>
                  <Badge
                    className={`${evidence.status === 'verified'
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                  >
                    {evidence.status === 'verified' ? '✓ Verified' : '✗ Compromised'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Evidence ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Evidence ID</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <code className="flex-1 text-sm font-mono text-foreground">{evidence.evidenceId}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(evidence.evidenceId, 'id')}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* File Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">File Name</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <span className="text-sm text-foreground">{evidence.fileName}</span>
                  </div>
                </div>

                {/* Uploaded By */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Uploaded By</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <span className="text-sm text-foreground">{evidence.uploadedBy}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Blockchain Timestamp</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <span className="text-sm text-foreground">{evidence.timestamp}</span>
                  </div>
                </div>

                {/* SHA-256 Hash */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">SHA-256 Hash</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">{evidence.hash}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(evidence.hash, 'hash')}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* IPFS CID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">IPFS Content ID (CID)</label>
                  <div className="flex items-center gap-2 bg-muted p-3 rounded-lg border border-primary/20">
                    <code className="flex-1 text-sm font-mono text-foreground break-all">{evidence.cid}</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(evidence.cid, 'cid')}
                      className="text-primary hover:bg-primary/10"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Verification Info */}
                <div className="bg-secondary/30 border border-primary/20 rounded-lg p-4">
                  <h4 className="font-semibold text-foreground mb-2">Verification Information</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      {evidence.hashMatch ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                      Hash Integrity: {evidence.hashMatch ? "Confirmed" : "FAILED (File content does not match DB record)"}
                    </li>
                    <li className="flex items-center gap-2">
                      {evidence.blockchainVerified ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-destructive" />}
                      Blockchain Record: {evidence.blockchainVerified ? "Matched" : "MISMATCH (DB record does not match Blockchain)"}
                    </li>
                    <li className="flex items-center gap-2">
                      {evidence.ipfsAvailable ? <CheckCircle className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-yellow-500" />}
                      IPFS Availability: {evidence.ipfsAvailable ? "Available" : "Unavailable"}
                    </li>
                    <li className="pt-2 text-xs">
                      Block Number: {evidence.verificationDetails?.blockNumber || 'N/A'} <br />
                      Tx Hash: <span className="font-mono">{evidence.verificationDetails?.blockchainTx?.substring(0, 20)}...</span> <br />
                      Smart Contract ID: {evidence.verificationDetails?.smartContractId}
                    </li>
                  </ul>

                  {evidence.status === 'compromised' && (
                    <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded text-xs font-mono space-y-2">
                      <p className="font-bold text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> TAMPERING DETECTED:
                      </p>
                      <div className="grid grid-cols-1 gap-1">
                        <div>
                          <span className="font-semibold text-foreground/70">Blockchain Hash (Immutable):</span>
                          <div className="break-all text-primary">{evidence.verificationDetails?.blockchainHash || 'Loading...'}</div>
                        </div>
                        <div className="mt-1">
                          <span className="font-semibold text-foreground/70">Database Hash (Compromised):</span>
                          <div className="break-all text-destructive">{evidence.verificationDetails?.databaseHash}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    asChild
                    className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1"
                  >
                    <a href="/dashboard">View Dashboard</a>
                  </Button>
                  <Button onClick={handleReset} variant="outline" className="flex-1 bg-transparent">
                    Search Another
                  </Button>
                  {evidence.status === 'verified' && (userRole === 'admin' || userRole === 'law_enforcement') && (
                    <Button 
                      onClick={handleDownload}
                      disabled={downloading}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      {downloading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Download File
                        </>
                      )}
                    </Button>
                  )}
                  {evidence.status !== 'compromised' && (
                    <Button onClick={handleTamper} variant="destructive" className="flex-1">
                      Simulate Attack (Demo)
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {searched && !evidence && !loading && (
          <Card className="border-primary/20">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Evidence Found</h3>
              <p className="text-muted-foreground text-center mb-4">
                The Evidence ID "{evidenceId}" was not found in the system. Please verify the ID and try again.
              </p>
              <Button onClick={handleReset} variant="outline">
                Try Another Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {!searched && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">How to Verify Evidence</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">What is Verification?</h4>
                <p className="text-sm text-muted-foreground">
                  Verification ensures that evidence has not been tampered with and remains in its original state. Our system checks the SHA-256 hash against blockchain records to confirm authenticity.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Where to Find Evidence ID?</h4>
                <p className="text-sm text-muted-foreground">
                  Evidence IDs are provided at upload or can be found in your dashboard when you view previously uploaded evidence.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">What Does Status Mean?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <span className="font-medium text-primary">Verified:</span> Evidence is authentic and unmodified</li>
                  <li>• <span className="font-medium text-destructive">Compromised:</span> Evidence has been altered</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
