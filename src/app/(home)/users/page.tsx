import { redirect } from "next/navigation"

/** إدارة المستخدمين متوفرة في لوحة الأدمن */
export default function UsersPage() {
  redirect("/admin-dashboard")
}
