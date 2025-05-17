import Image from "next/image"
import Link from "next/link"
import { Cloud, BarChart3, Network } from "lucide-react"

export default function TelePredictLanding() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-indigo-800 font-semibold text-xl">
          TelePredict
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm hover:text-indigo-600">
            Home
          </Link>
          <Link href="/prediction" className="text-sm hover:text-indigo-600">
            Prediction
          </Link>
          <Link href="#" className="text-sm hover:text-indigo-600">
            Dashboard
          </Link>
          <Link href="/login" className="text-sm hover:text-indigo-600">
            Login
          </Link>
          <Link href="/contact" className="bg-indigo-700 text-white px-4 py-2 rounded text-sm">
            Contact Us
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="bg-indigo-700 rounded-b-3xl">
          <div className="container mx-auto px-4 py-12 md:py-16 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-pink-500 mb-4">
                Predict Customer Churn with Precision
              </h1>
              <p className="text-white text-lg mb-6">
                Empower your telecom business with actionable insights to reduce churn and boost retention.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link href="/prediction">
                  <button className="bg-white text-indigo-700 px-6 py-2 rounded font-medium">Get Started</button>
                </Link>
                <button className="border border-white text-white px-6 py-2 rounded font-medium">Learn More</button>
              </div>
            </div>
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=300&width=400"
                alt="Data visualization illustration"
                width={400}
                height={300}
                className="w-full"
              />
            </div>
          </div>
        </section>

        {/* What We Do Section */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-semibold text-center mb-12 text-gray-800">What We Do</h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <Cloud className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload your data effortlessly</h3>
              <p className="text-gray-600 text-sm">
                Drag and drop your files or CSV of Excel format. Easily set up automatic data collection to ensure a
                seamless experience.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <Network className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Accurate Churn Predictions with AI</h3>
              <p className="text-gray-600 text-sm">
                Our advanced machine learning models analyze your data to predict which customers are most likely to
                churn, with remarkable accuracy.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-full mb-4">
                <BarChart3 className="h-8 w-8 text-indigo-700" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Discover Insights with Charts</h3>
              <p className="text-gray-600 text-sm">
                Explore intuitive dashboards with chart trends, demographic breakdowns, and actionable insights to make
                data-driven decisions.
              </p>
            </div>
          </div>
        </section>

        {/* How We Help Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <Image
                src="/placeholder.svg?height=300&width=350"
                alt="Data analysis illustration"
                width={350}
                height={300}
                className="w-full"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">How We Help Your Business Thrive</h2>
              <p className="text-gray-600">
                Leverage advanced AI-powered insights to predict customer churn, make valuable connections, and boost
                your revenue. Our solution simplifies data analysis, transforms complex information into actionable
                visualizations that empower you to make informed decisions with confidence.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="text-xl font-semibold mb-6">TelePredict</div>
            <p className="text-gray-400 text-sm">Copyright © 2023 | Legally AI, Inc.</p>
            <p className="text-gray-400 text-sm">All rights reserved</p>

            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">YouTube</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    About us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white text-sm">
                    Contact us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Testimonials
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Help center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Legal
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-400 hover:text-white text-sm">
                    Status
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase tracking-wider">Stay up to date</h3>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="bg-gray-700 text-white px-4 py-2 rounded-l text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-r text-sm">→</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

