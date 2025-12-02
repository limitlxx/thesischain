"use client"
import { Check } from "lucide-react"

const steps = [
  { number: 1, label: "Upload Files" },
  { number: 2, label: "Project Details" },
  { number: 3, label: "Royalties" },
  { number: 4, label: "Review & Mint" },
]

interface MintStepperProps {
  currentStep: number
}

export function MintStepper({ currentStep }: MintStepperProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          {/* Step Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                currentStep > step.number
                  ? "bg-accent-deep text-white"
                  : currentStep === step.number
                    ? "bg-gradient-to-r from-accent-deep to-accent-warm text-white ring-2 ring-accent-warm/50"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {currentStep > step.number ? <Check className="w-6 h-6" /> : step.number}
            </div>
            <p
              className={`text-sm mt-2 font-medium text-center ${
                currentStep >= step.number ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {step.label}
            </p>
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex-1 h-1 mx-2 mt-6">
              <div
                className={`h-full transition-all ${
                  currentStep > step.number ? "bg-gradient-to-r from-accent-deep to-accent-warm" : "bg-muted"
                }`}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
