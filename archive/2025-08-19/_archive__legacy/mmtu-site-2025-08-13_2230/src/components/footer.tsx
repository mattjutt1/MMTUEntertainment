import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold">Company</h3>
            <div className="mt-4 space-y-2">
              <Link href="/contact" className="block text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/blog" className="block text-sm text-muted-foreground hover:text-foreground">
                Blog
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Product</h3>
            <div className="mt-4 space-y-2">
              <Link href="/pricing" className="block text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link href="/gallery" className="block text-sm text-muted-foreground hover:text-foreground">
                Gallery
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Resources</h3>
            <div className="mt-4 space-y-2">
              <Link href="/docs/get-started" className="block text-sm text-muted-foreground hover:text-foreground">
                Documentation
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Legal</h3>
            <div className="mt-4 space-y-2">
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MMTU Entertainment. All rights reserved.
        </div>
      </div>
    </footer>
  )
}