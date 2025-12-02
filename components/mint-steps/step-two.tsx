"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"

interface StepTwoProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function validateStepTwo(formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!formData.title || formData.title.trim() === '') {
    errors.push('Title is required')
  }
  
  if (!formData.abstract || formData.abstract.trim() === '') {
    errors.push('Abstract is required')
  }
  
  if (!formData.author || formData.author.trim() === '') {
    errors.push('Author name is required')
  }
  
  if (!formData.university || formData.university === '') {
    errors.push('University is required')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

const universities = [
  "UNILAG",
  "Makerere",
  "Nairobi",
  "Legon",
  "Stellenbosch",
  "Ashesi",
  "African Leadership University",
]
const departments = [
  "Computer Science",
  "Engineering",
  "Biotechnology",
  "Economics",
  "Medicine",
  "Agriculture",
  "Architecture",
  "Environmental Science",
]
const years = ["2021", "2022", "2023", "2024", "2025"]

export function StepTwo({ formData, updateFormData }: StepTwoProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">Thesis Title</Label>
        <Input
          id="title"
          placeholder="e.g., Optimizing Supply Chain With Blockchain"
          value={formData.title}
          onChange={(e) => updateFormData({ title: e.target.value })}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="abstract">Abstract (or Summary)</Label>
        <textarea
          id="abstract"
          placeholder="Provide a comprehensive summary of your thesis..."
          value={formData.abstract}
          onChange={(e) => updateFormData({ abstract: e.target.value })}
          className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-base font-sans ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm min-h-32"
        />
      </div>

      <div>
        <Label htmlFor="author">Author Name</Label>
        <Input
          id="author"
          placeholder="e.g., John Doe"
          value={formData.author}
          onChange={(e) => updateFormData({ author: e.target.value })}
          className="mt-2"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Your full name as it should appear on the thesis
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="university">University</Label>
          <Select value={formData.university} onValueChange={(value) => updateFormData({ university: value })}>
            <SelectTrigger id="university" className="mt-2">
              <SelectValue placeholder="Select university" />
            </SelectTrigger>
            <SelectContent>
              {universities.map((uni) => (
                <SelectItem key={uni} value={uni}>
                  {uni}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="department">Department</Label>
          <Select value={formData.department} onValueChange={(value) => updateFormData({ department: value })}>
            <SelectTrigger id="department" className="mt-2">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Graduation Year</Label>
          <Select value={formData.year} onValueChange={(value) => updateFormData({ year: value })}>
            <SelectTrigger id="year" className="mt-2">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="supervisor">Supervisor Wallet Address</Label>
          <Input
            id="supervisor"
            placeholder="0x..."
            value={formData.supervisorWallet}
            onChange={(e) => updateFormData({ supervisorWallet: e.target.value })}
            className="mt-2"
          />
        </div>
      </div>

      <Card className="p-4 bg-accent-warm/5 border-accent-warm/20">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Including your supervisor's wallet allows them to receive a portion of royalties when
          your work is built upon.
        </p>
      </Card>
    </div>
  )
}
