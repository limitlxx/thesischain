"use client"

import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"

interface StepThreeProps {
  formData: any
  updateFormData: (updates: any) => void
}

export function validateStepThree(formData: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (formData.royaltyPercentage < 1 || formData.royaltyPercentage > 100) {
    errors.push('Royalty percentage must be between 1% and 100%')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function StepThree({ formData, updateFormData }: StepThreeProps) {
  const estimatedMonthlyEarnings = formData.royaltyPercentage * 50 // Placeholder calculation
  const estimatedYearlyEarnings = estimatedMonthlyEarnings * 12

  // License price in CAMP (convert to wei for minting)
  const licensePrice = formData.licensePrice || 0.001
  // License duration in days (convert to seconds for minting)
  const licenseDuration = formData.licenseDuration || 1

  return (
    <div className="space-y-6">
      {/* License Price */}
      <div>
        <Label className="flex justify-between mb-3">
          <span>License Price: {licensePrice} CAMP</span>
          <span className="text-sm text-accent-warm font-semibold">Min: 0.001 CAMP</span>
        </Label>
        <input
          type="number"
          min="0.001"
          max="1000"
          step="0.001"
          value={licensePrice}
          onChange={(e) => updateFormData({ licensePrice: Number.parseFloat(e.target.value) })}
          className="w-full px-4 py-2 bg-muted rounded-lg border border-border focus:border-accent-deep focus:outline-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          Price users pay to access your thesis (minimum 0.001 CAMP)
        </p>
      </div>

      {/* License Duration */}
      <div>
        <Label className="flex justify-between mb-3">
          <span>License Duration: {licenseDuration} day{licenseDuration !== 1 ? 's' : ''}</span>
          <span className="text-sm text-accent-warm font-semibold">1-30 days</span>
        </Label>
        <input
          type="range"
          min="1"
          max="30"
          step="1"
          value={licenseDuration}
          onChange={(e) => updateFormData({ licenseDuration: Number.parseInt(e.target.value) })}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent-warm"
        />
        <p className="text-xs text-muted-foreground mt-2">
          How long users can access your thesis after purchase
        </p>
      </div>

      {/* Royalty Percentage */}
      <div>
        <Label className="flex justify-between mb-3">
          <span>Royalty Percentage: {formData.royaltyPercentage}%</span>
          <span className="text-sm text-accent-warm font-semibold">Default: 10%</span>
        </Label>
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={formData.royaltyPercentage}
          onChange={(e) => updateFormData({ royaltyPercentage: Number.parseInt(e.target.value) })}
          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-accent-warm"
        />
        <p className="text-xs text-muted-foreground mt-2">Set how much you earn from derivative works</p>
      </div>

      <Card className="p-6 bg-gradient-to-br from-accent-deep/10 to-accent-warm/10 border-accent-deep/20">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Estimated Monthly Earnings</p>
          <p className="text-3xl font-bold text-accent-warm">${estimatedMonthlyEarnings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">Yearly potential: ${estimatedYearlyEarnings.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-3 italic">
            * Based on platform usage. Actual earnings depend on building activity.
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
          <div>
            <Label className="font-semibold">Allow Forking & Improvements</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Let others build upon your thesis and submit improvements
            </p>
          </div>
          <Switch
            checked={formData.allowForking}
            onCheckedChange={(checked) => updateFormData({ allowForking: checked })}
          />
        </div>
      </div>

      <Card className="p-4 bg-accent-deep/5 border-accent-deep/20">
        <p className="text-sm text-muted-foreground">
          <strong>Collaboration Tip:</strong> Allowing forking increases your thesis's reach and impact. Many successful
          projects on Camp Network have thrived through community contributions.
        </p>
      </Card>
    </div>
  )
}
