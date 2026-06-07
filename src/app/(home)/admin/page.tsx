import { redirect } from "next/navigation"

/** @deprecated Use /admin-dashboard — kept for old bookmarks and links */
export default function AdminPage() {
  redirect("/admin-dashboard")
}
