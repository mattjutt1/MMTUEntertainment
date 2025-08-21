import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Welcome to MMTU Entertainment
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Professional development tools and services for modern teams. Build better software faster.
              </p>
            </div>
            <div className="space-x-4">
              <Button asChild>
                <Link href="/contact">Get Started</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/docs/get-started">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-12">
            <Card>
              <CardHeader>
                <CardTitle>Development Tools</CardTitle>
                <CardDescription>
                  Professional tools that streamline your development workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  From GitHub automation to custom solutions, we provide the tools you need to ship better code.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Expert Services</CardTitle>
                <CardDescription>
                  Consulting and development services from experienced professionals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get expert guidance on architecture, performance, and best practices for your projects.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Modern Solutions</CardTitle>
                <CardDescription>
                  Cutting-edge technology solutions for today&apos;s challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We leverage the latest technologies to build scalable, maintainable solutions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
