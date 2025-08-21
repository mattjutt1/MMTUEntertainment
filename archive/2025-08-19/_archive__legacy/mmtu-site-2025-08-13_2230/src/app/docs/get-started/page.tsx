import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function GetStarted() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Getting Started</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Everything you need to know to start working with MMTU Entertainment.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>1</Badge>
              Initial Consultation
            </CardTitle>
            <CardDescription>
              We start with understanding your needs and project requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Schedule a free 30-minute consultation where we&apos;ll discuss your project goals,
              technical requirements, timeline, and budget. This helps us provide you with
              the most accurate proposal and timeline.
            </p>
            <Button asChild>
              <Link href="/contact">Schedule Consultation</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>2</Badge>
              Project Planning
            </CardTitle>
            <CardDescription>
              We create a detailed project plan and proposal.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Based on our consultation, we&apos;ll provide you with:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Detailed project scope and requirements</li>
              <li>Technology stack recommendations</li>
              <li>Timeline and milestones</li>
              <li>Transparent pricing breakdown</li>
              <li>Communication and collaboration plan</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge>3</Badge>
              Development & Delivery
            </CardTitle>
            <CardDescription>
              We build your solution with regular updates and feedback cycles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Our development process includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              <li>Weekly progress updates and demos</li>
              <li>Continuous integration and testing</li>
              <li>Regular feedback incorporation</li>
              <li>Documentation and knowledge transfer</li>
              <li>Post-launch support and maintenance</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Expertise</CardTitle>
            <CardDescription>
              Technologies and services we specialize in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Frontend Development</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">React</Badge>
                  <Badge variant="secondary">Next.js</Badge>
                  <Badge variant="secondary">TypeScript</Badge>
                  <Badge variant="secondary">Tailwind CSS</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Backend Development</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Node.js</Badge>
                  <Badge variant="secondary">Express</Badge>
                  <Badge variant="secondary">PostgreSQL</Badge>
                  <Badge variant="secondary">MongoDB</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">DevOps & Infrastructure</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">Docker</Badge>
                  <Badge variant="secondary">AWS</Badge>
                  <Badge variant="secondary">Cloudflare</Badge>
                  <Badge variant="secondary">CI/CD</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Automation & Tools</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary">GitHub Apps</Badge>
                  <Badge variant="secondary">Webhooks</Badge>
                  <Badge variant="secondary">API Integration</Badge>
                  <Badge variant="secondary">Monitoring</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
            <CardDescription>
              Take the first step towards your next great project.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1">
                <Link href="/contact">Start Your Project</Link>
              </Button>
              <Button variant="outline" asChild className="flex-1">
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}