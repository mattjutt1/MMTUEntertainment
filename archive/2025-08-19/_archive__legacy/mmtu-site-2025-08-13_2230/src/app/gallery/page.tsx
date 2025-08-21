import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Gallery() {
  return (
    <div className="container py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Project Gallery</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore our portfolio of successful projects and satisfied clients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>DriftGuard Checks</CardTitle>
            <CardDescription>Automated GitHub repository security validation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">GitHub App</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Security</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Real-time branch protection monitoring and security configuration validation for GitHub repositories.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CI/CD Pipeline Optimizer</CardTitle>
            <CardDescription>Streamlined deployment workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">DevOps</Badge>
              <Badge variant="secondary">Automation</Badge>
              <Badge variant="secondary">Performance</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Custom CI/CD solutions that reduce deployment time by 60% and improve reliability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enterprise Dashboard</CardTitle>
            <CardDescription>Real-time analytics and monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">React</Badge>
              <Badge variant="secondary">Dashboard</Badge>
              <Badge variant="secondary">Analytics</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Comprehensive monitoring dashboard with real-time metrics and intelligent alerting.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Gateway Solution</CardTitle>
            <CardDescription>Scalable microservices architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Node.js</Badge>
              <Badge variant="secondary">Microservices</Badge>
              <Badge variant="secondary">API</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              High-performance API gateway handling 10M+ requests per day with 99.9% uptime.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mobile App Backend</CardTitle>
            <CardDescription>Cloud-native mobile API</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">Serverless</Badge>
              <Badge variant="secondary">Mobile</Badge>
              <Badge variant="secondary">Cloud</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Serverless backend powering mobile apps with global user base and real-time features.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>More projects on the way</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">AI/ML</Badge>
              <Badge variant="outline">Blockchain</Badge>
              <Badge variant="outline">IoT</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              We&apos;re constantly working on new and exciting projects. Check back soon for updates!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}