'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Database, Link2, Zap, FileStack } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/95 border-b border-primary/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">B-CEL</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-foreground mb-4">About B-CEL</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive blockchain-based solution for secure, immutable, and transparent digital evidence management in modern law enforcement
          </p>
        </div>

        {/* System Overview */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">The Problem</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Traditional evidence storage systems face significant challenges:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Centralized vulnerability:</strong> Single point of failure and potential tampering</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Chain of custody issues:</strong> Difficult to track evidence access and modifications</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Data loss risk:</strong> Evidence can be permanently deleted or corrupted</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <span><strong>Lack of transparency:</strong> Limited audit capabilities for verification</span>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Solution</h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                B-CEL leverages blockchain and IPFS technology to provide:
              </p>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span><strong>Immutable records:</strong> Evidence cannot be altered once stored</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span><strong>Complete transparency:</strong> Full audit trail with timestamps</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span><strong>Decentralized storage:</strong> Redundant copies across IPFS nodes</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">✓</span>
                  <span><strong>Cryptographic verification:</strong> SHA-256 integrity checking</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">System Architecture</h2>
            <p className="text-muted-foreground">How B-CEL components work together</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Component 1: SHA-256 */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Lock className="w-8 h-8 text-primary mb-3" />
                <CardTitle>SHA-256 Hashing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Each evidence file is processed through the SHA-256 cryptographic algorithm, generating a unique 256-bit fingerprint.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded p-3">
                  <p className="text-xs font-mono text-primary break-all">
                    a2f43d6c8e1b9f2c4d5e6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Key Features:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>One-way cryptographic function</li>
                    <li>Unique for each file</li>
                    <li>Any modification changes hash</li>
                    <li>Industry standard for integrity</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Component 2: IPFS */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Database className="w-8 h-8 text-primary mb-3" />
                <CardTitle>IPFS Storage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Evidence files are stored on the InterPlanetary File System (IPFS), a distributed peer-to-peer network providing redundancy and resilience.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded p-3">
                  <p className="text-xs text-primary">
                    CID: QmX7vF9k2mKzf3a4L7pQ9nW2bY5cZ8dX1eF4gH7jK9mN0o
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Benefits:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Content-addressed network</li>
                    <li>No single point of failure</li>
                    <li>Global accessibility</li>
                    <li>Automatic replication</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Component 3: Blockchain */}
            <Card className="border-primary/20 hover:border-primary/50 transition-colors">
              <CardHeader>
                <Link2 className="w-8 h-8 text-primary mb-3" />
                <CardTitle>Blockchain Records</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Evidence metadata, hashes, and timestamps are recorded on Ethereum smart contracts, creating an immutable audit trail.
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded p-3">
                  <p className="text-xs text-primary">
                    Block: #18,523,482 • Tx: 0x3f7d...
                  </p>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p><strong>Advantages:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Immutable records</li>
                    <li>Transparent verification</li>
                    <li>Smart contract logic</li>
                    <li>Public ledger</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Flow */}
        <section className="mb-16 bg-primary/5 border border-primary/20 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Evidence Upload & Verification Flow</h2>

          <div className="space-y-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Investigator Uploads Evidence</h4>
                <p className="text-sm text-muted-foreground">
                  Authenticated user submits digital evidence file through secure interface.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-foreground">File Hashing & IPFS Upload</h4>
                <p className="text-sm text-muted-foreground">
                  System computes SHA-256 hash of file and simultaneously uploads to IPFS network, receiving a unique Content ID (CID).
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Blockchain Recording</h4>
                <p className="text-sm text-muted-foreground">
                  Evidence metadata (ID, hash, CID, timestamp, uploader) is recorded in immutable smart contract.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-foreground">User Receives Evidence ID</h4>
                <p className="text-sm text-muted-foreground">
                  Unique Evidence ID generated and provided to investigator for tracking and sharing with auditors.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                5
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Auditor Verification</h4>
                <p className="text-sm text-muted-foreground">
                  Authorized auditor queries Evidence ID, system verifies hash against blockchain record and IPFS file, confirming integrity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Technical Specifications</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Cryptography
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Hashing Algorithm</p>
                  <p>SHA-256 (NIST FIPS 180-4 standard)</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Hash Output</p>
                  <p>256-bit fixed length hexadecimal string</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Collision Resistance</p>
                  <p>Computationally infeasible to find two files with same hash</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Storage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">File Storage</p>
                  <p>IPFS peer-to-peer network with content addressing</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Redundancy</p>
                  <p>Multiple geographic nodes automatically replicate content</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Retention</p>
                  <p>Permanent storage with pinning services for reliability</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="w-5 h-5 text-primary" />
                  Blockchain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Platform</p>
                  <p>Ethereum mainnet with ERC-20 compliance</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Smart Contracts</p>
                  <p>Solidity language with formal verification</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Consensus</p>
                  <p>Proof of Stake (PoS) with validator network</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-semibold text-foreground mb-1">Upload Speed</p>
                  <p>Typically 5-30 seconds depending on file size</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Verification</p>
                  <p>Instant hash verification against blockchain</p>
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">File Size</p>
                  <p>Supports files up to several gigabytes</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security & Compliance */}
        <section className="mb-16 bg-primary/5 border border-primary/20 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Security & Compliance</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">Security Measures</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>End-to-end encryption for data transmission</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Multi-factor authentication for users</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Role-based access control (RBAC)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Immutable audit logs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Regular security audits and penetration testing</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Compliance Standards</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>NIST Cybersecurity Framework</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Chain of Custody (CoC) standards</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>Federal Rules of Evidence (FRE)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>ISO/IEC 27001 Information Security</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-bold">✓</span>
                  <span>GDPR and data protection compliance</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-accent/10">
            <CardContent className="py-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Implement B-CEL?</h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join law enforcement agencies worldwide in leveraging blockchain technology for secure evidence management.
              </p>
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/register">Get Started Today</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-primary/10 py-8 px-4 bg-primary/5 mt-16">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2024 B-CEL. Blockchain-Based Cyber Evidence Locker. For authorized law enforcement use only.</p>
        </div>
      </footer>
    </div>
  )
}
