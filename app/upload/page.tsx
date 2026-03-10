'use client'

import React from "react"

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Upload, File, CheckCircle, AlertCircle, Loader2, Copy, ArrowLeft, Shield } from 'lucide-react'
import { extractResponseError } from '@/lib/validation'

export default function UploadPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [uploadData, setUploadData] = useState<{
    evidenceId: string
    hash: string
    cid: string
    timestamp: string
    blockchainTx: string
    smartContractId: number
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [copied, setCopied] = useState<string>('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (user.role === 'law_enforcement') {
      router.push('/dashboard')
    }
  }, [router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.add('bg-primary/10', 'border-primary')
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('bg-primary/10', 'border-primary')
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.classList.remove('bg-primary/10', 'border-primary')
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evidence/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      console.log('Upload response status:', response.status)
      console.log('Upload response headers:', response.headers.get('content-type'))

      // Parse response data - be defensive about missing content-type header
      // (Next.js rewrites may not preserve headers properly)
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError)
        const textData = await response.text()
        console.error('Response text:', textData.substring(0, 200))
        setError(`Server error: Invalid response format. Status: ${response.status}`)
        setLoading(false)
        return
      }
      console.log('Upload response data:', data)

      if (!response.ok) {
        const errorMessage = extractResponseError(data)
        console.error('Upload failed with status', response.status, ':', errorMessage)
        setError(errorMessage)
        setLoading(false)
        return
      }

      // Validate that we have the required fields
      if (!data.evidenceId || !data.hash || !data.cid) {
        console.error('Invalid response data - missing required fields:', data)
        setError('Server returned incomplete data. Please try again.')
        setLoading(false)
        return
      }

      setUploadData({
        evidenceId: data.evidenceId,
        hash: data.hash,
        cid: data.cid,
        timestamp: data.timestamp || new Date().toISOString(),
        blockchainTx: data.blockchainTx || '',
        smartContractId: data.smartContractId || 0,
      })
      setSuccess(true)
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      console.error('Upload error caught:', err)
      if (err instanceof SyntaxError) {
        setError('Server returned invalid data. Please try again.')
      } else {
        setError('An error occurred during upload. Please try again.')
      }
    } finally {
      setLoading(false)
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
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => {
              localStorage.clear()
              router.push('/')
            }}
            className="border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          >
            Sign Out
          </Button>
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
          <div className="text-sm text-muted-foreground">Upload / Evidence</div>
        </div>

        {/* Success State */}
        {success && uploadData && (
          <div className="mb-8">
            <Alert className="border-green-200 bg-green-50 mb-6 shadow-sm">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <span className="font-semibold">Success!</span> Your evidence has been securely stored on IPFS and recorded on the blockchain.
              </AlertDescription>
            </Alert>

            {/* Success Card with Details */}
            <Card className="border-green-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Upload Complete
                </CardTitle>
                <CardDescription className="text-green-700">Save these details for future verification and auditing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* Evidence ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Evidence ID</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors">
                    <code className="flex-1 text-sm font-mono text-green-600 break-all">
                      {uploadData.evidenceId || 'Loading...'}
                    </code>
                    {uploadData.evidenceId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(uploadData.evidenceId, 'id')}
                        className="text-slate-500 hover:text-green-600 hover:bg-slate-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {copied === 'id' && <p className="text-xs text-green-600 font-medium">Copied!</p>}
                </div>

                {/* SHA-256 Hash */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">SHA-256 Hash</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors">
                    <code className="flex-1 text-sm font-mono text-slate-600 break-all">
                      {uploadData.hash || 'Loading...'}
                    </code>
                    {uploadData.hash && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(uploadData.hash, 'hash')}
                        className="text-slate-500 hover:text-green-600 hover:bg-slate-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {copied === 'hash' && <p className="text-xs text-green-600 font-medium">Copied!</p>}
                </div>

                {/* IPFS CID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">IPFS Content ID (CID)</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors">
                    <code className="flex-1 text-sm font-mono text-slate-600 break-all">
                      {uploadData.cid || 'Loading...'}
                    </code>
                    {uploadData.cid && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(uploadData.cid, 'cid')}
                        className="text-slate-500 hover:text-green-600 hover:bg-slate-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {copied === 'cid' && <p className="text-xs text-green-600 font-medium">Copied!</p>}
                </div>

                {/* Blockchain Tx */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Transaction Hash</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300 hover:bg-slate-100 transition-colors">
                    <code className="flex-1 text-sm font-mono text-slate-600 break-all">
                      {uploadData.blockchainTx || 'Pending...'}
                    </code>
                    {uploadData.blockchainTx && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(uploadData.blockchainTx, 'tx')}
                        className="text-slate-500 hover:text-green-600 hover:bg-slate-200"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {copied === 'tx' && <p className="text-xs text-green-600 font-medium">Copied!</p>}
                </div>

                {/* Smart Contract ID */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Smart Contract ID</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300">
                    <span className="text-sm font-mono text-slate-600">{uploadData.smartContractId || 0}</span>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Blockchain Timestamp</label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-300">
                    <span className="text-sm text-slate-600">{new Date(uploadData.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all flex-1"
                  >
                    View Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setSuccess(false)
                      setUploadData(null)
                    }}
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50 flex-1"
                  >
                    Upload Another File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upload Form */}
        {!success && (
          <div>
            {/* Page Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-foreground mb-2">Upload Evidence</h1>
              <p className="text-muted-foreground">Securely submit and store digital evidence on the blockchain</p>
            </div>

            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <CardTitle>Select Evidence File</CardTitle>
                <CardDescription>Choose a digital file to be cryptographically hashed and stored</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">{error}</AlertDescription>
                  </Alert>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-green-300 rounded-xl p-12 text-center cursor-pointer transition-all hover:border-green-500 hover:bg-green-50 bg-white"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Drag and drop your evidence file</h3>
                  <p className="text-muted-foreground mb-4">Or click to browse your computer</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={loading}
                  />
                  <Badge className="bg-green-100 text-green-700 border-green-300 hover:bg-green-100">
                    Supported: All file types
                  </Badge>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <File className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground break-all">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          <span className="text-green-600 font-medium">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span> • Ready to upload
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-slate-400 disabled:to-slate-400 text-white h-12 shadow-md hover:shadow-lg transition-all"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading and Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Evidence
                    </>
                  )}
                </Button>

                {/* Info Box */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 space-y-3">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    What happens next?
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">1.</span>
                      <span>Your file is hashed using SHA-256 cryptographic algorithm</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">2.</span>
                      <span>The file is uploaded to IPFS decentralized storage network</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">3.</span>
                      <span>Evidence metadata and hash are recorded on the blockchain</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-green-600 font-bold">4.</span>
                      <span>You receive a unique Evidence ID for tracking and verification</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}
