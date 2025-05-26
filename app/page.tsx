import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GamepadIcon, Users, Zap, Trophy } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="bg-indigo-600 p-4 rounded-full">
              <GamepadIcon className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">RealtimeMcq</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Create and play real-time multiple choice quizzes with friends. Test your knowledge and compete in live quiz
            battles!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-green-100 p-3 rounded-full w-fit mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Real-time Gaming</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Experience live quiz battles with instant updates and real-time scoring</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit mb-4">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Multiplayer Fun</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Create games and invite friends to join your custom quiz challenges</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-purple-100 p-3 rounded-full w-fit mb-4">
                <Trophy className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle>Competitive Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Track your progress and compete for the top spot on the leaderboard</CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center space-y-4">
          <div className="space-x-4">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-700">
              <Link href="/auth/signin">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/games">Browse Games</Link>
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            New to RealtimeMcq?{" "}
            <Link href="/auth/signup" className="text-indigo-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
