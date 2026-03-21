import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen text-white bg-transparent">
      <Header />

      <main className="flex-1 flex flex-col justify-center pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-syne text-5xl md:text-6xl font-bold mb-4 lowercase">
            post not found
          </h1>
          <p className="text-white/60 mb-8">
            the post you're looking for doesn't exist or has been moved
          </p>
          <Link
            href="/blog"
            className="inline-block px-6 py-3 border border-white/20 hover:border-white/40 transition-colors text-sm tracking-widest"
          >
            back to blog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
