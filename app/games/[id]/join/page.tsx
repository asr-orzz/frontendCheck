"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Users } from "lucide-react"
import Link from "next/link"

export default function JoinGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }
  }, [router])

  const handleJoinRequest = async () => {
    setLoading(true)
    setError("")
    setSuccess("")

    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }

    try {
      // Decode token to get userId
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.id

      const response = await fetch("http://localhost:3000/api/v1/games/join-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          userId,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess("Join request sent! Waiting for the game owner to accept.")
      } else {
        setError(data.error || "Failed to send join request")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Join Game</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Join Game Request</CardTitle>
              <CardDescription>
                Send a request to join this game. The game owner will need to accept your request.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <Button onClick={handleJoinRequest} className="w-full" disabled={loading || !!success}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {success ? "Request Sent" : "Send Join Request"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
