const nextConfig = {
  images: {
    domains: ["example.com"], // Add any domains you're loading images from
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },
}

module.exports = nextConfig

