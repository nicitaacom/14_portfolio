import { getScopedI18n } from "@/locales/server"

export default async function LocalizedNotFound() {
  const t = await getScopedI18n("notFound")

  return (
    <main className="site-not-found absolute inset-0 flex items-center justify-center px-md">
      <div className="site-not-found-card relative">
        <span className="site-not-found-mark hidden" aria-hidden="true">
          404
        </span>
        <h1 className="whitespace-nowrap text-lg">{t("title")}</h1>
      </div>
    </main>
  )
}
