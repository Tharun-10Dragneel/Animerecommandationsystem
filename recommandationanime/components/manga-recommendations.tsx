'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Search } from "lucide-react"

interface Manga {
  name: string;
  genre: string;
  rating: number;
}

export function MangaRecommendations() {
  const [selectedGenre, setSelectedGenre] = useState<string>('') // State for selected genre
  const [recommendations, setRecommendations] = useState<Manga[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Slice of Life"]

  const fetchRecommendations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:8000/recommend/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genre: selectedGenre, top_n: 6 }), // Send genre instead of user ID
      })
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations')
      }
      const data = await response.json()
      setRecommendations(data)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
      setError('Failed to fetch recommendations. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <header className="sticky top-0 z-10 w-full border-b border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/60">
        <div className="container flex h-16 items-center">
          <BookOpen className="mr-2 h-6 w-6 text-green-500" />
          <h1 className="text-xl font-bold text-green-500">Manga Recommendations</h1>
        </div>
      </header>
      <main className="container py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <label htmlFor="genre" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Genre
            </label>
            <Select onValueChange={(value) => setSelectedGenre(value)}>
              <SelectTrigger className="mt-2 bg-gray-800 border-gray-700 text-gray-100 focus:border-green-500 focus:ring focus:ring-green-500 focus:ring-opacity-50">
                <SelectValue placeholder="Select a genre" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={fetchRecommendations}
            disabled={isLoading || !selectedGenre}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-md transition-colors duration-300"
          >
            {isLoading ? 'Loading...' : 'Get Recommendations'}
          </Button>
        </div>
        {error && (
          <div className="mt-4 text-red-500">
            {error}
          </div>
        )}
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((manga) => (
            <Card key={manga.name} className="bg-gray-800 border-gray-700 overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-green-500/20">
              <CardHeader className="p-0">
                <img src={`/placeholder.svg?height=200&width=150`} alt={manga.name} className="h-[250px] w-full object-cover" />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-xl font-bold text-green-400">{manga.name}</CardTitle>
                <CardDescription className="text-sm text-gray-400">{manga.genre}</CardDescription>
                <p className="mt-2 text-yellow-400">Rating: {manga.rating.toFixed(2)}</p>
              </CardContent>
              <CardFooter className="bg-gray-800 p-4">
                <Button variant="secondary" className="w-full bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors duration-300">
                  Learn More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}
