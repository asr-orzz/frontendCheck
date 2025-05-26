"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Plus, Loader2 } from "lucide-react"
import Link from "next/link"

interface Question {
  id: string
  question: string
  explanation: string
  options?: Option[]
}

interface Option {
  id: string
  option: string
  isCorrect: boolean
  questionId: string
}

export default function ManageGamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [showAddOption, setShowAddOption] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [newQuestion, setNewQuestion] = useState({
    question: "",
    explanation: "",
  })

  const [newOption, setNewOption] = useState({
    option: "",
    isCorrect: false,
  })

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/auth/signin")
      return
    }
    fetchQuestions()
  }, [gameId, router])

  const fetchQuestions = async () => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/api/v1/questions?gameId=${gameId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setQuestions(data)

        // Fetch options for each question
        for (const question of data) {
          await fetchOptionsForQuestion(question.id)
        }
      } else {
        setError("Failed to fetch questions")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const fetchOptionsForQuestion = async (questionId: string) => {
    const token = localStorage.getItem("token")
    try {
      const response = await fetch(`http://localhost:3000/api/v1/options?questionId=${questionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const options = await response.json()
        setQuestions((prev) => prev.map((q) => (q.id === questionId ? { ...q, options } : q)))
      }
    } catch (err) {
      console.error("Failed to fetch options:", err)
    }
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:3000/api/v1/questions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newQuestion,
          gameId,
        }),
      })

      if (response.ok) {
        setNewQuestion({ question: "", explanation: "" })
        setShowAddQuestion(false)
        fetchQuestions()
      } else {
        setError("Failed to add question")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  const handleAddOption = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault()
    const token = localStorage.getItem("token")

    try {
      const response = await fetch("http://localhost:3000/api/v1/options/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newOption,
          questionId,
          gameId,
        }),
      })

      if (response.ok) {
        setNewOption({ option: "", isCorrect: false })
        setShowAddOption(null)
        fetchOptionsForQuestion(questionId)
      } else {
        setError("Failed to add option")
      }
    } catch (err) {
      setError("Network error")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
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
                  Back to Dashboard
                </Link>
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Manage Game</h1>
            </div>
            <Button onClick={() => setShowAddQuestion(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showAddQuestion && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Question</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, question: e.target.value }))}
                    placeholder="Enter your question"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explanation</Label>
                  <Textarea
                    id="explanation"
                    value={newQuestion.explanation}
                    onChange={(e) => setNewQuestion((prev) => ({ ...prev, explanation: e.target.value }))}
                    placeholder="Explain the correct answer"
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">Add Question</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddQuestion(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500 mb-4">No questions added yet.</p>
                <Button onClick={() => setShowAddQuestion(true)}>Add your first question</Button>
              </CardContent>
            </Card>
          ) : (
            questions.map((question, index) => (
              <Card key={question.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <CardDescription className="mt-2">{question.question}</CardDescription>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowAddOption(question.id)}>
                      <Plus className="mr-1 h-3 w-3" />
                      Add Option
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Explanation:</Label>
                      <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
                    </div>

                    {question.options && question.options.length > 0 && (
                      <div>
                        <Label className="text-sm font-medium">Options:</Label>
                        <div className="mt-2 space-y-2">
                          {question.options.map((option) => (
                            <div key={option.id} className="flex items-center space-x-2 p-2 border rounded">
                              <span className="flex-1">{option.option}</span>
                              {option.isCorrect && (
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showAddOption === question.id && (
                      <Card className="border-dashed">
                        <CardContent className="pt-4">
                          <form onSubmit={(e) => handleAddOption(e, question.id)} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="option">Option Text</Label>
                              <Input
                                id="option"
                                value={newOption.option}
                                onChange={(e) => setNewOption((prev) => ({ ...prev, option: e.target.value }))}
                                placeholder="Enter option text"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="isCorrect"
                                checked={newOption.isCorrect}
                                onCheckedChange={(checked) =>
                                  setNewOption((prev) => ({ ...prev, isCorrect: checked as boolean }))
                                }
                              />
                              <Label htmlFor="isCorrect">This is the correct answer</Label>
                            </div>
                            <div className="flex space-x-2">
                              <Button type="submit" size="sm">
                                Add Option
                              </Button>
                              <Button type="button" variant="outline" size="sm" onClick={() => setShowAddOption(null)}>
                                Cancel
                              </Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
