export default function NotFound() {
  return (
    <main className="site-not-found absolute inset-0 flex items-center justify-center px-md">
      <div className="site-not-found-card relative">
        <span className="site-not-found-mark hidden" aria-hidden="true">
          404
        </span>
        <h1 className="text-lg whitespace-nowrap">Page not found</h1>
      </div>
    </main>
  )
}
