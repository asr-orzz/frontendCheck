"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Loader2, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  options: Array<{
    id: string
    option: string
  }>
}

interface AnswerResult {
  isCorrect: boolean
  newScore: number
}

export default function PlayGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [gameEnded, setGameEnded] = useState(false)
  const [score, setScore] = useState(0)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [lastAnswer, setLastAnswer] = useState<AnswerResult | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }
    fetchNextQuestion()
  }, [gameId, router])

  const fetchNextQuestion = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/api/v1/players/next-question?gameId=${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (response.ok) {
        if (data.message === "No more questions") {
          setGameEnded(true)
        } else {
          setCurrentQuestion(data)
          setSelectedOption("")
          setLastAnswer(null)
        }
      } else {
        setError(data.error || "Failed to fetch question")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitAnswer = async () => {
    if (!selectedOption || !currentQuestion) return

    setSubmitting(true)
    const token = localStorage.getItem("token")

    try {
      // Decode token to get userId
      const payload = JSON.parse(atob(token.split(".")[1]))
      const userId = payload.id

      const response = await fetch("http://localhost:3000/api/v1/players/player-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          gameId,
          userId,
          questionId: currentQuestion.id,
          optionId: selectedOption,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setLastAnswer({
          isCorrect: data.isCorrect,
          newScore: data.newScore,
        })
        setScore(data.newScore)
        setQuestionNumber((prev) => prev + 1)

        // Show result for 2 seconds, then fetch next question
        setTimeout(() => {
          fetchNextQuestion()
        }, 2000)
      } else {
        setError(data.error || "Failed to submit answer")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (gameEnded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Game Complete!</CardTitle>
            <CardDescription>You've answered all questions</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600">Final Score: {score}</div>
            <Button asChild className="w-full">
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Exit Game
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Playing Game</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Score</div>
              <div className="text-xl font-bold">{score}</div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {lastAnswer && (
            <Alert
              className={`mb-6 ${lastAnswer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <div className="flex items-center">
                {lastAnswer.isCorrect ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <AlertDescription className={lastAnswer.isCorrect ? "text-green-800" : "text-red-800"}>
                  {lastAnswer.isCorrect ? "Correct!" : "Incorrect!"} Your score: {lastAnswer.newScore}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {currentQuestion && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center mb-2">
                  <CardDescription>Question {questionNumber}</CardDescription>
                  <Progress value={questionNumber * 10} className="w-32" />
                </div>
                <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id={option.id}
                        name="answer"
                        value={option.id}
                        checked={selectedOption === option.id}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                        disabled={submitting || !!lastAnswer}
                      />
                      <label
                        htmlFor={option.id}
                        className="flex-1 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        {option.option}
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!selectedOption || submitting || !!lastAnswer}
                  className="w-full"
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {lastAnswer ? "Loading next question..." : "Submit Answer"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
