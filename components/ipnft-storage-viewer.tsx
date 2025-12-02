"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Search,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Video,
  Music
} from "lucide-react"
import { 
  getAllTrackedIPNFTs, 
  searchIPNFTs, 
  getStorageStats,
  exportIPNFTs,
  importIPNFTs,
  clearTrackedIPNFTs,
  type TrackedIPNFT
} from "@/lib/ipnft-tracker"
import Link from "next/link"

export function IPNFTStorageViewer() {
  const [ipnfts, setIPNFTs] = useState<TrackedIPNFT[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [stats, setStats] = useState({ count: 0, sizeMB: "0", maxCount: 1000 })

  const loadData = () => {
    const all = getAllTrackedIPNFTs()
    setIPNFTs(all)
    setStats(getStorageStats())
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = searchIPNFTs(searchQuery)
      setIPNFTs(results)
    } else {
      loadData()
    }
  }

  const handleExport = () => {
    const json = exportIPNFTs()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ipnfts-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (importIPNFTs(content)) {
            loadData()
            alert('IPNFTs imported successfully!')
          } else {
            alert('Failed to import IPNFTs')
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all stored IPNFTs? This cannot be undone.')) {
      clearTrackedIPNFTs()
      loadData()
    }
  }

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <FileText className="h-4 w-4" />
    if (fileType.startsWith('image/')) return <ImageIcon className="h-4 w-4" />
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />
    if (fileType.startsWith('audio/')) return <Music className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Local IPNFT Storage
            </CardTitle>
            <CardDescription>
              {stats.count} IPNFTs stored ({stats.sizeMB} MB / {stats.maxCount} max)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-1" />
              Import
            </Button>
            <Button variant="destructive" size="sm" onClick={handleClear}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <Input
            placeholder="Search by name, description, or attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* IPNFT List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {ipnfts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No IPNFTs stored yet</p>
              <p className="text-sm">Mint a thesis to see it here!</p>
            </div>
          ) : (
            ipnfts.map((ipnft) => (
              <Card key={ipnft.tokenId} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getFileIcon(ipnft.fileInfo?.type)}
                      <h4 className="font-semibold truncate">{ipnft.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {ipnft.tokenId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ipnft.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {ipnft.metadata.attributes.slice(0, 3).map((attr, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {attr.trait_type}: {attr.value}
                        </Badge>
                      ))}
                      {ipnft.metadata.attributes.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{ipnft.metadata.attributes.length - 3} more
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Royalty: {(ipnft.royaltyBps / 100).toFixed(1)}%</span>
                      {ipnft.fileInfo && (
                        <span>
                          {ipnft.fileInfo.name} ({(ipnft.fileInfo.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      )}
                      <span>{new Date(ipnft.mintedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link href={`/thesis/${ipnft.tokenId}`}>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
          <p>• IPNFTs are stored in your browser's localStorage</p>
          <p>• Data persists across sessions but is device-specific</p>
          <p>• Export your data regularly to back it up</p>
          <p>• Maximum {stats.maxCount} IPNFTs can be stored</p>
        </div>
      </CardContent>
    </Card>
  )
}
