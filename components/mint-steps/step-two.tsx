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
  // Nigeria
  "University of Lagos (UNILAG)",
  "University of Ibadan (UI)",
  "Obafemi Awolowo University (OAU), Ile-Ife",
  "University of Nigeria, Nsukka (UNN)",
  "Ahmadu Bello University (ABU), Zaria",
  "University of Benin (UNIBEN)",
  "Federal University of Technology, Akure (FUTA)",
  "Federal University of Technology, Minna (FUTMinna)",
  "University of Ilorin (UNILORIN)",
  "Bayero University Kano (BUK)",
  "Covenant University, Ota",
  "Landmark University, Omu-Aran",
  "Babcock University, Ilishan-Remo",
  "American University of Nigeria (AUN), Yola",
  "Lagos State University (LASU)",
  "University of Port Harcourt (UNIPORT)",
  "Nnamdi Azikiwe University (UNIZIK), Awka",
  "Federal University of Agriculture, Abeokuta (FUNAAB)",
  "Yaba College of Technology (YABATECH)",
  "Ladoke Akintola University of Technology (LAUTECH)",

  // Rest of Africa (Top & Popular)
  "University of Cape Town (UCT)",
  "Stellenbosch University",
  "University of the Witwatersrand (Wits)",
  "University of Pretoria",
  "University of KwaZulu-Natal (UKZN)",
  "Makerere University",
  "University of Nairobi",
  "Kenyatta University",
  "University of Ghana, Legon",
  "Kwame Nkrumah University of Science and Technology (KNUST)",
  "Ashesi University",
  "University of Dar es Salaam",
  "Addis Ababa University",
  "American University in Cairo (AUC)",
  "Cairo University",
  "University of Johannesburg",
  "North-West University (NWU)",
  "Rhodes University",
  "African Leadership University (ALU)",
  "Strathmore University",
  "United States International University Africa (USIU)",
  "Al Akhawayn University",
  "University of Cheikh Anta Diop (UCAD)",
  "University of Ibadan",
  "Eduardo Mondlane University", 
  "University of Zimbabwe", 
  "University of Botswana", 
  "University of Mauritius", 
  "African University of Science and Technology (AUST)",
  "Pan-Atlantic University (PAU)",
  "Nile University of Nigeria",
];

const departments = [
  "Computer Science",
  "Software Engineering",
  "Data Science & Artificial Intelligence",
  "Cybersecurity",
  "Electrical/Electronic Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Chemical Engineering",
  "Petroleum Engineering",
  "Medicine and Surgery (MBBS)",
  "Nursing Science",
  "Pharmacy",
  "Dentistry",
  "Biotechnology",
  "Biochemistry",
  "Microbiology",
  "Economics",
  "Accounting",
  "Business Administration",
  "Finance",
  "Law",
  "Mass Communication",
  "Architecture",
  "Quantity Surveying",
  "Estate Management",
  "Agriculture / Agricultural Economics",
  "Food Science and Technology",
  "Environmental Science & Management",
  "Geology / Geophysics",
  "Political Science",
  "International Relations",
  "Psychology",
  "Public Health",
  "Medical Laboratory Science",
  "Physiotherapy",
  "Radiography",
  "Industrial Design",
  "Computer Engineering",
  "Mechatronics Engineering",
  "Aerospace Engineering",
  "Renewable Energy",
  "Marine Engineering",
  "Banking and Finance",
  "Entrepreneurship",
  "Information Technology",
  "Mathematics",
  "Statistics",
  "Physics",
];

const years = [
  "2018",
  "2019",
  "2020",
  "2021",
  "2022",
  "2023",
  "2024",
  "2025",
  "2026",
  "2027",
  "2028",
];

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
