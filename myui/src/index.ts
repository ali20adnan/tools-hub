import "./styles.css"

// Providers
export { AdminProvider } from "./providers/AdminProvider"
export type { AdminProviderProps } from "./providers/AdminProvider"

// Main admin UI
export { AdminApp } from "./components/admin/AdminApp"
export type { AdminAppProps } from "./components/admin/AdminApp"
export { AdminLogin } from "./components/admin/login"
export { AdminDashboard } from "./components/admin/dashboard"
export { ProductPreviewCard } from "./components/admin/ProductPreviewCard"

// Popups
export { AddUserPopup } from "./components/admin/popups/AddUserPopup"
export { ProductPopup } from "./components/admin/popups/ProductPopup"
export { EmojiPopup } from "./components/admin/popups/EmojiPopup"
export { CannedRepliesPopup } from "./components/admin/popups/CannedRepliesPopup"
export { NotificationsPopup } from "./components/admin/popups/NotificationsPopup"

// Site config
export {
  SiteConfigProvider,
  useSiteConfig,
} from "./context/site-config-context"
export type { SiteConfig } from "./context/site-config-context"

// UI primitives
export { Button, buttonVariants } from "./components/ui/button"

// Utilities
export { cn } from "./lib/utils"
export { apiFetch, apiUrl, getApiBase, setApiBase } from "./lib/api"
export { SUPPORT_STICKERS } from "./constants/support-stickers"
