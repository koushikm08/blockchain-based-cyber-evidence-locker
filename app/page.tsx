'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Lock, Database, Link2, Headset as ChainAsset, FileCheck, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-green-600">B-CEL</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/signin" className="text-base font-medium text-gray-600 hover:text-green-600 transition">
              Sign In
            </Link>
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold">
              <Link href="/register">Register</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-linear-to-br from-white via-green-50 to-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-30 -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20 -z-10" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 text-balance">
            Blockchain-Based Cyber Evidence Locker
          </h1>

          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto text-balance leading-relaxed">
            Secure, immutable, and transparent evidence storage using cutting-edge Blockchain and IPFS technology. Built for modern law enforcement and digital investigations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8">
              <Link href="/register">Start Uploading Evidence</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-lg text-gray-600">Everything you need for secure evidence management</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Immutable Storage */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <ChainAsset className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Immutable Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Evidence stored on blockchain cannot be altered or deleted, ensuring complete chain of custody integrity.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2: IPFS Integration */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <Database className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Decentralized Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Files are stored on IPFS, providing redundancy and resilience across multiple nodes worldwide.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3: SHA-256 Hashing */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <Lock className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Cryptographic Integrity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  All evidence is verified using SHA-256 hashing to ensure data integrity and detect tampering.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4: Verification */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <FileCheck className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Easy Verification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Auditors can instantly verify evidence authenticity by checking hashes and timestamps on the blockchain.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5: Transparent Audit Trail */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <Link2 className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Complete Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Full transparency with timestamps and blockchain records of all evidence transactions and access logs.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6: Scalability */}
            <Card className="border-green-200 hover:border-green-400 shadow-lg hover:shadow-xl transition-all bg-linear-to-br from-white to-green-50">
              <CardHeader>
                <Shield className="w-8 h-8 text-green-600 mb-3" />
                <CardTitle className="text-gray-900">Enterprise Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Designed for large-scale law enforcement operations with support for thousands of cases and evidence items.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Flow */}
      <section className="py-16 px-4 bg-linear-to-br from-green-50 to-white border-y border-green-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Simple 4-step process for secure evidence management</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 md:gap-2">
            {/* Step 1 */}
            <div className="relative">
              <Card className="border-green-200 bg-white shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3">
                    1
                  </div>
                  <CardTitle className="text-lg text-gray-900">Upload Evidence</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">Investigator uploads digital evidence file to the platform</p>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute -right-2 top-1/3 w-4 h-0.5 bg-green-300" />
            </div>

            {/* Step 2 */}
            <div className="relative">
              <Card className="border-green-200 bg-white shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3">
                    2
                  </div>
                  <CardTitle className="text-lg text-gray-900">Hash & IPFS</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">File is hashed with SHA-256 and stored on IPFS network</p>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute -right-2 top-1/3 w-4 h-0.5 bg-green-300" />
            </div>

            {/* Step 3 */}
            <div className="relative">
              <Card className="border-green-200 bg-white shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3">
                    3
                  </div>
                  <CardTitle className="text-lg text-gray-900">Blockchain Record</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">Evidence metadata recorded immutably on blockchain</p>
                </CardContent>
              </Card>
              <div className="hidden md:block absolute -right-2 top-1/3 w-4 h-0.5 bg-green-300" />
            </div>

            {/* Step 4 */}
            <div>
              <Card className="border-green-200 bg-white shadow-lg hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold mb-3">
                    4
                  </div>
                  <CardTitle className="text-lg text-gray-900">Verify & Audit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">Auditors verify integrity and authenticity instantly</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      {/* <footer className="border-t border-green-100 py-8 px-4 bg-green-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-bold text-green-600">B-CEL</span>
              </div>
              <p className="text-sm text-gray-600">Blockchain-Based Cyber Evidence Locker for secure evidence management.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-gray-900">About</Link></li>
                <li><Link href="/about#architecture" className="hover:text-gray-900">Architecture</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/signin" className="hover:text-gray-900">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-gray-900">Register</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-green-100 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 B-CEL. For authorized law enforcement use only.</p>
          </div>
        </div>
      </footer> */}
    </div>
  )
}
