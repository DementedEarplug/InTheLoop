import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Landing page component
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Simplify Group Communication with LetterLoop
            </h1>
            <p className="max-w-[700px] text-muted-foreground md:text-xl">
              Create, manage, and share collaborative newsletters with your team, family, or community.
            </p>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Key Features</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Everything you need to create and manage collaborative newsletters
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
              {/* Feature 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Collaborative Loops</h3>
                <p className="text-muted-foreground">
                  Create groups with members who can contribute to your newsletters
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                    <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                    <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                    <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
                    <rect width="10" height="10" x="7" y="7" rx="2"></rect>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Customizable Questions</h3>
                <p className="text-muted-foreground">
                  Create and reuse questions to gather responses from your group
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-primary p-3 text-primary-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Automated Newsletters</h3>
                <p className="text-muted-foreground">
                  Automatically compile responses into beautiful newsletters
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">How It Works</h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Simple steps to get your collaborative newsletter up and running
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12">
              {/* Step 1 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="text-xl font-bold">Create a Loop</h3>
                <p className="text-muted-foreground">
                  Set up a group and invite members to join your loop
                </p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="text-xl font-bold">Add Questions</h3>
                <p className="text-muted-foreground">
                  Create questions for your members to answer
                </p>
              </div>
              
              {/* Step 3 */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="text-xl font-bold">Share Newsletters</h3>
                <p className="text-muted-foreground">
                  Collect responses and share the compiled newsletter
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-muted to-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-4 text-center animate-slide-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Get Started?
              </h2>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Join LetterLoop today and simplify your group communications
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/register">
                <Button size="lg">Sign Up Now</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
