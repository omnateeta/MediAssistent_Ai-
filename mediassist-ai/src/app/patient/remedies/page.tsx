"use client"

import { useState } from "react"
import useAuthGuard from '@/hooks/useAuthGuard'
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  LightBulbIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline"

interface RemedyCategory {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{className?: string}>
  color: string
}

interface Remedy {
  id: string
  title: string
  category: string
  description: string
  ingredients: string[]
  instructions: string[]
  precautions: string[]
  effectiveness: number // 1-5 scale
}

export default function HomeRemediesPage() {
  const { session, status } = useAuthGuard('PATIENT')
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  
  // Remedy categories
  const categories: RemedyCategory[] = [
    {
      id: 'cold',
      name: 'Cold & Flu',
      description: 'Remedies for common cold, flu, and respiratory issues',
      icon: MagnifyingGlassIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'pain',
      name: 'Pain Relief',
      description: 'Natural solutions for headaches, muscle pain, and discomfort',
      icon: HeartIcon,
      color: 'bg-red-100 text-red-600'
    },
    {
      id: 'digestive',
      name: 'Digestive Health',
      description: 'Solutions for stomach issues, nausea, and digestion',
      icon: LightBulbIcon,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'wellness',
      name: 'General Wellness',
      description: 'Daily wellness and preventive care remedies',
      icon: InformationCircleIcon,
      color: 'bg-purple-100 text-purple-600'
    }
  ]
  
  // Home remedies data
  const remedies: Remedy[] = [
    {
      id: '1',
      title: 'Ginger Tea for Nausea',
      category: 'digestive',
      description: 'A natural remedy to soothe stomach upset and reduce nausea',
      ingredients: ['Fresh ginger root (1 inch)', 'Hot water (1 cup)', 'Honey (1 tsp)', 'Lemon juice (optional)'],
      instructions: [
        'Slice or grate fresh ginger root',
        'Steep in hot water for 5-10 minutes',
        'Strain and add honey to taste',
        'Drink slowly while warm'
      ],
      precautions: [
        'Consult doctor if pregnant or taking blood thinners',
        'May interact with diabetes medications'
      ],
      effectiveness: 4
    },
    {
      id: '2',
      title: 'Steam Inhalation for Congestion',
      category: 'cold',
      description: 'Relieves nasal congestion and sinus pressure',
      ingredients: ['Hot water (2 cups)', 'Towel', 'Essential oils (optional)'],
      instructions: [
        'Pour hot water into a bowl',
        'Add 2-3 drops of eucalyptus oil if desired',
        'Place towel over head and lean over bowl',
        'Inhale steam for 5-10 minutes'
      ],
      precautions: [
        'Be careful to avoid burns',
        'Keep face at a safe distance from hot water'
      ],
      effectiveness: 5
    },
    {
      id: '3',
      title: 'Cold Compress for Headaches',
      category: 'pain',
      description: 'Reduces inflammation and numbs pain receptors',
      ingredients: ['Ice cubes', 'Thin cloth or towel', 'Plastic bag'],
      instructions: [
        'Wrap ice in thin cloth or plastic bag',
        'Apply to forehead or temples for 10-15 minutes',
        'Take breaks between applications',
        'Repeat as needed'
      ],
      precautions: [
        'Do not apply ice directly to skin',
        'Limit application to 20 minutes at a time'
      ],
      effectiveness: 3
    },
    {
      id: '4',
      title: 'Turmeric Milk for Inflammation',
      category: 'wellness',
      description: 'Anti-inflammatory drink with immune-boosting properties',
      ingredients: ['Milk (1 cup)', 'Turmeric powder (1/2 tsp)', 'Black pepper (pinch)', 'Honey (1 tsp)'],
      instructions: [
        'Heat milk in a saucepan',
        'Add turmeric and black pepper',
        'Simmer for 2-3 minutes',
        'Add honey and stir well',
        'Drink warm before bedtime'
      ],
      precautions: [
        'May stain clothing and teeth',
        'Consult doctor if taking blood thinners'
      ],
      effectiveness: 4
    },
    {
      id: '5',
      title: 'Salt Water Gargle for Sore Throat',
      category: 'cold',
      description: 'Reduces throat inflammation and loosens mucus',
      ingredients: ['Warm water (1 cup)', 'Salt (1/2 tsp)'],
      instructions: [
        'Dissolve salt in warm water',
        'Gargle for 30 seconds',
        'Spit out the solution',
        'Repeat 3-4 times daily'
      ],
      precautions: [
        'Do not swallow the salt water',
        'Use warm, not hot, water'
      ],
      effectiveness: 4
    },
    {
      id: '6',
      title: 'Peppermint Oil for Headaches',
      category: 'pain',
      description: 'Natural muscle relaxant that may relieve tension headaches',
      ingredients: ['Peppermint essential oil (2-3 drops)', 'Carrier oil (1 tbsp)', 'Cotton ball'],
      instructions: [
        'Mix peppermint oil with carrier oil',
        'Apply to temples and forehead with cotton ball',
        'Massage gently in circular motions',
        'Allow to absorb naturally'
      ],
      precautions: [
        'Always dilute essential oils',
        'Avoid contact with eyes',
        'Not recommended for children under 6'
      ],
      effectiveness: 3
    }
  ]
  
  // Filter remedies based on search and category
  const filteredRemedies = remedies.filter(remedy => {
    const matchesSearch = remedy.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         remedy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || remedy.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Home Remedies</h1>
          <p className="text-gray-600">
            Natural solutions for common health concerns. Always consult your healthcare provider for persistent symptoms.
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search remedies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant={selectedCategory === 'all' ? 'medical' : 'outline'}
                onClick={() => setSelectedCategory('all')}
                className="whitespace-nowrap"
              >
                All Categories
              </Button>
              <select
                className="block w-full md:w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {/* Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Card 
                key={category.id} 
                className={`cursor-pointer hover:shadow-lg transition-shadow ${
                  selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg ${category.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
        
        {/* Remedies */}
        {filteredRemedies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRemedies.map((remedy) => (
              <Card key={remedy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{remedy.title}</CardTitle>
                      <CardDescription className="mt-1">{remedy.description}</CardDescription>
                    </div>
                    <div className="flex items-center bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm">
                      <span className="font-medium">{remedy.effectiveness}/5</span>
                      <span className="ml-1">★</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Ingredients</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {remedy.ingredients.map((ingredient, index) => (
                          <li key={index}>{ingredient}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                      <ol className="list-decimal list-inside space-y-1 text-gray-600">
                        {remedy.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ol>
                    </div>
                    
                    {remedy.precautions.length > 0 && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <InformationCircleIcon className="h-5 w-5 text-yellow-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-yellow-800">Precautions</h3>
                            <div className="mt-2 text-sm text-yellow-700">
                              <ul className="list-disc list-inside space-y-1">
                                {remedy.precautions.map((precaution, index) => (
                                  <li key={index}>{precaution}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No remedies found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Try adjusting your search or filter criteria.
            </p>
            <div className="mt-6">
              <Button variant="medical" onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        
        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex">
            <div className="flex-shrink-0">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Important Disclaimer</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  These home remedies are provided for informational purposes only and are not intended to replace professional medical advice, diagnosis, or treatment. 
                  Always consult your healthcare provider before trying new remedies, especially if you have underlying health conditions, are pregnant, or are taking medications. 
                  Discontinue use if symptoms persist or worsen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}