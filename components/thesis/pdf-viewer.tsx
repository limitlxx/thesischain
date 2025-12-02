"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PDFViewerProps {
  pdfUrl: string
}

export function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 15 // Mock page count

  return (
    <div className="space-y-4 p-6">
      {/* PDF Frame Placeholder */}
      <div className="bg-muted rounded-lg aspect-video flex items-center justify-center border-2 border-dashed border-border">
        <div className="text-center space-y-3">
          <div className="text-6xl text-muted-foreground opacity-20">📄</div>
          <p className="text-muted-foreground text-sm">
            PDF Viewer - Page {currentPage} of {totalPages}
          </p>
          <p className="text-xs text-muted-foreground">Powered by react-pdf library</p>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
          <span className="font-semibold text-foreground">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
