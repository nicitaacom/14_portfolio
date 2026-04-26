import { getScopedI18n } from "@/locales/server"

export default async function LocalizedNotFound() {
  const t = await getScopedI18n("notFound")

  return (
    <h1 className="absolute left-1/2 top-1/2 whitespace-nowrap text-lg -translate-x-1/2 -translate-y-1/2">
      {t("title")}
    </h1>
  )
}
