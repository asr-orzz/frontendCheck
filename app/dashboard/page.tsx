"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Users, Play, Settings, LogOut } from "lucide-react"
import Link from "next/link"

interface Game {
  id: string
  game: string
  status: string
  createdAt: string
  user: {
    username: string
  }
  _count?: {
    players: number
  }
}

export default function DashboardPage() {
  const [games, setGames] = useState<Game[]>([])
  const [username, setUsername] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedUsername = localStorage.getItem("username")

    if (!token) {
      router.push("/auth/signin")
      return
    }

    setUsername(storedUsername || "")
    fetchGames()
  }, [router])

  const fetchGames = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/v1/games")
      const data = await response.json()
      setGames(data)
    } catch (error) {
      console.error("Failed to fetch games:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("username")
    router.push("/")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800"
      case "STARTED":
        return "bg-green-100 text-green-800"
      case "ENDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {username}!</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild>
              <Link href="/games/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Game
              </Link>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Available Games</h2>
            {games.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-gray-500 mb-4">No games available yet.</p>
                  <Button asChild>
                    <Link href="/games/create">Create the first game!</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {games.map((game) => (
                  <Card key={game.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{game.game}</CardTitle>
                        <Badge className={getStatusColor(game.status)}>{game.status}</Badge>
                      </div>
                      <CardDescription>Created by {game.user.username}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="mr-1 h-4 w-4" />
                          {game._count?.players || 0} players
                        </div>
                        <div className="space-x-2">
                          {game.user.username === username ? (
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/games/${game.id}/manage`}>
                                <Settings className="mr-1 h-3 w-3" />
                                Manage
                              </Link>
                            </Button>
                          ) : (
                            <Button asChild size="sm">
                              <Link href={`/games/${game.id}/join`}>
                                <Play className="mr-1 h-3 w-3" />
                                Join
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
