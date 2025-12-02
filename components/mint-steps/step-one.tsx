"use client"

import type React from "react"

import { useState } from "react"
import { File, Video, Code, Image } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface StepOneProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function StepOne({ formData, updateFormData }: StepOneProps) {
  const [dragActive, setDragActive] = useState<string | null>(null)

  const handleDrag = (e: React.DragEvent, type: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(type)
    } else if (e.type === "dragleave") {
      setDragActive(null)
    }
  }

  const validateFileType = (file: File, type: "thesisPdf" | "sourceCode" | "demoVideo" | "coverImage"): boolean => {
    // Only TXT files are supported for thesis content
    const supportedTypes: Record<string, { types: string[], maxSize: number, label: string }> = {
      thesisPdf: {
        types: ['text/plain'],
        maxSize: 10 * 1024 * 1024, // 10MB
        label: 'Text files only (.txt)'
      },
      sourceCode: {
        types: ['text/plain'],
        maxSize: 10 * 1024 * 1024, // 10MB
        label: 'Text files only (.txt)'
      },
      demoVideo: {
        types: ['text/plain'],
        maxSize: 10 * 1024 * 1024, // 10MB
        label: 'Text files only (.txt)'
      },
      coverImage: {
        types: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
        label: 'Images (JPEG, PNG, GIF, WebP)'
      }
    }

    const config = supportedTypes[type]
    const isValidType = config.types.includes(file.type)
    
    if (!isValidType) {
      alert(`Invalid file type: ${file.type}\n\nOrigin SDK only supports: ${config.label}\n\nFor PDFs: Please convert to images or text, or use a supported format.`)
      return false
    }

    // Check file size
    if (file.size > config.maxSize) {
      const maxSizeMB = (config.maxSize / 1024 / 1024).toFixed(0)
      const actualSizeMB = (file.size / 1024 / 1024).toFixed(2)
      alert(`File too large: ${actualSizeMB}MB\n\nMaximum size for ${config.label} is ${maxSizeMB}MB`)
      return false
    }
    
    return true
  }

  const handleDrop = (e: React.DragEvent, type: "thesisPdf" | "sourceCode" | "demoVideo" | "coverImage") => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(null)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      if (validateFileType(files[0], type)) {
        updateFormData({ [type]: files[0] })
      }
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "thesisPdf" | "sourceCode" | "demoVideo" | "coverImage") => {
    if (e.target.files && e.target.files[0]) {
      if (validateFileType(e.target.files[0], type)) {
        updateFormData({ [type]: e.target.files[0] })
      }
    }
  }

  const FileUploadBox = ({
    title,
    description,
    icon: Icon,
    type,
    accept,
    file,
  }: {
    title: string
    description: string
    icon: any
    type: "thesisPdf" | "sourceCode" | "demoVideo" | "coverImage"
    accept: string
    file: File | null
  }) => (
    <Card
      onDragEnter={(e) => handleDrag(e, type)}
      onDragLeave={(e) => handleDrag(e, type)}
      onDragOver={(e) => handleDrag(e, type)}
      onDrop={(e) => handleDrop(e, type)}
      className={`p-8 text-center cursor-pointer transition-all border-2 border-dashed ${
        dragActive === type
          ? "border-accent-deep bg-accent-deep/5 scale-105"
          : file
            ? "border-accent-warm bg-accent-warm/5"
            : "border-muted hover:border-accent-deep/50"
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={(e) => handleFileChange(e, type)}
        className="hidden"
        id={`${type}-input`}
      />
      <label htmlFor={`${type}-input`} className="cursor-pointer block">
        <Icon className={`w-12 h-12 mx-auto mb-3 ${file ? "text-accent-warm" : "text-muted-foreground"}`} />
        <p className="font-semibold">{file ? file.name : title}</p>
        {!file && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        {file && (
          <div className="mt-3">
            <Progress value={100} className="h-1 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </label>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadBox
          title="Upload Thesis (TXT Required)"
          description="Text file only (.txt) - Max 10MB"
          icon={File}
          type="thesisPdf"
          accept=".txt"
          file={formData.thesisPdf}
        />
        <FileUploadBox
          title="Cover Image (Optional)"
          description="Stored in browser - Max 5MB"
          icon={Image}
          type="coverImage"
          accept=".jpg,.jpeg,.png,.gif,.webp"
          file={formData.coverImage}
        />
      </div>

      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-2">
          📝 Simplified Minting
        </p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• <strong>Only TXT files</strong> are minted to Origin SDK</li>
          <li>• <strong>Cover images</strong> are stored in your browser (localStorage)</li>
          <li>• <strong>Convert PDFs</strong> to TXT before uploading</li>
          <li>• Maximum file size: 10MB</li>
        </ul>
      </Card>
      
      <Card className="p-4 bg-accent-deep/5 border-accent-deep/20">
        <p className="text-sm text-muted-foreground">
          <strong>Pro tip:</strong> Use online tools or text editors to convert your PDF thesis to TXT format.
        </p>
      </Card>
    </div>
  )
}
