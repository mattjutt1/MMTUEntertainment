import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function Blog() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Insights, tutorials, and thoughts on modern software development.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary">DevOps</Badge>
              <span className="text-sm text-muted-foreground">December 15, 2024</span>
            </div>
            <CardTitle>
              <Link href="#" className="hover:underline">
                Building Secure CI/CD Pipelines: A Complete Guide
              </Link>
            </CardTitle>
            <CardDescription>
              Learn how to implement security best practices in your continuous integration and deployment workflows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Security should be integrated into every step of your development process. In this comprehensive guide,
              we&apos;ll walk through implementing security scanning, secret management, and compliance checks in your CI/CD pipeline...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary">TypeScript</Badge>
              <span className="text-sm text-muted-foreground">December 10, 2024</span>
            </div>
            <CardTitle>
              <Link href="#" className="hover:underline">
                Advanced TypeScript Patterns for Better Code Quality
              </Link>
            </CardTitle>
            <CardDescription>
              Explore advanced TypeScript techniques that will make your code more maintainable and type-safe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              TypeScript&apos;s type system is incredibly powerful when used correctly. This article covers advanced patterns
              like conditional types, mapped types, and template literal types that can significantly improve your codebase...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary">Performance</Badge>
              <span className="text-sm text-muted-foreground">December 5, 2024</span>
            </div>
            <CardTitle>
              <Link href="#" className="hover:underline">
                Optimizing React Applications for Production
              </Link>
            </CardTitle>
            <CardDescription>
              Practical techniques to improve the performance of your React applications in production environments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Performance optimization is crucial for user experience and business success. We&apos;ll cover code splitting,
              lazy loading, memoization, and other techniques to make your React apps lightning fast...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
              <Badge variant="secondary">Architecture</Badge>
              <span className="text-sm text-muted-foreground">November 28, 2024</span>
            </div>
            <CardTitle>
              <Link href="#" className="hover:underline">
                Microservices vs Monoliths: Making the Right Choice
              </Link>
            </CardTitle>
            <CardDescription>
              A balanced perspective on when to choose microservices architecture and when monoliths make more sense.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              The choice between microservices and monoliths isn&apos;t black and white. We&apos;ll explore the trade-offs,
              complexity considerations, and real-world scenarios to help you make an informed decision...
            </p>
          </CardContent>
        </Card>

        <div className="text-center py-8">
          <p className="text-muted-foreground">More articles coming soon...</p>
        </div>
      </div>
    </div>
  )
}