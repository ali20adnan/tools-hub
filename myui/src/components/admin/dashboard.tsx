import { useState, useEffect, useRef, useMemo } from "react"
import { motion, AnimatePresence } from "motion/react"
import { useTheme } from "next-themes"
import { 
  Users, 
  MessageSquare, 
  LayoutDashboard, 
  TrendingUp, 
  Settings, 
  LogOut,
  Bell,
  Search,
  CheckCircle2,
  Clock,
  Menu,
  X,
  FileText,
  Palette,
  Eye,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Box,
  Monitor,
  ExternalLink,
  Paperclip,
  Smile,
  Bookmark,
  ShoppingBag,
  Ban,
  Languages,
  ShieldCheck,
  Headset,
  Sun,
  Moon,
  ImageOff,
  Shield,
  Zap,
  HardDrive,
  Database as DatabaseIcon,
  Activity,
  Smartphone,
  LayoutGrid,
  Mail,
  Pill,
  ShoppingCart,
  Landmark,
  Stethoscope,
  Factory,
  GraduationCap,
  Send,
  ClipboardList
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "../../lib/utils"
import { apiFetch } from "../../lib/api"
import { Button } from "../ui/button"
import { useSiteConfig } from "../../context/site-config-context"
import { SUPPORT_STICKERS } from "../../constants/support-stickers"
import { AddUserPopup } from "./popups/AddUserPopup"
import { ProductPopup } from "./popups/ProductPopup"
import { EmojiPopup } from "./popups/EmojiPopup"
import { CannedRepliesPopup } from "./popups/CannedRepliesPopup"

interface AdminDashboardProps {
  onLogout: () => void
  isRTL: boolean
  onToggleLanguage: () => void
}

type TabType = "overview" | "content" | "appearance" | "support" | "settings" | "logs" | "users" | "products" | "notifications" | "requests"

/** iOS-style switch; `dir="ltr"` keeps thumb motion correct inside RTL admin layout */
function AdminToggle({
  checked,
  onCheckedChange,
  activeClassName,
}: {
  checked: boolean
  onCheckedChange: () => void
  activeClassName: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onCheckedChange}
      dir="ltr"
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-start rounded-full p-1 transition-colors",
        "border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900",
        checked ? activeClassName : "bg-slate-300 dark:bg-slate-600",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-1 ring-black/10 transition-transform duration-200 ease-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  )
}

type SupportMsg = {
  id: string
  role: "user" | "agent"
  text: string
  time: string
  imageUrl?: string
}

type AdminNotification = {
  id: string
  title: string
  message: string
  time: string
  unread: boolean
}

type AdminUser = {
  id: number
  name: string
  email: string
  role: "admin" | "editor"
  avatar: string
}

function AdminProductImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className="h-32 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <ImageOff className="w-8 h-8 text-slate-300" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      loading="lazy"
    />
  )
}

function AdminProductIcon({ name, className }: { name?: string; className?: string }) {
  const icons: Record<string, any> = {
    Pill, 
    ShoppingCart, 
    Landmark, 
    Stethoscope, 
    Factory, 
    GraduationCap, 
    Monitor, 
    Smartphone, 
    TrendingUp, 
    Settings, 
    Box,
    ClipboardList
  }
  const Icon = (name && icons[name]) ? icons[name] : Box
  return <Icon className={className} />
}

export function AdminDashboard({ onLogout, isRTL, onToggleLanguage }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview")
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024)
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? (theme === "system" ? resolvedTheme : theme) : undefined

  const toggleTheme = () => {
    if (!currentTheme) return
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }

  const { config, updateConfig, resetConfig } = useSiteConfig()
  const [localConfig, setLocalConfig] = useState(config)
  const [isSaving, setIsSaving] = useState(false)
  const [logs, setLogs] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [isProductsLoading, setIsProductsLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [requests, setRequests] = useState<any[]>([])
  const [isRequestsLoading, setIsRequestsLoading] = useState(false)
  const [systemStatus, setSystemStatus] = useState<any[]>([
    { label: "Auth API", status: "operational", icon: "ShieldCheck" },
    { label: "Database", status: "operational", icon: "Database" },
    { label: "File Storage", status: "operational", icon: "HardDrive" },
    { label: "Search Engine", status: "operational", icon: "Search" }
  ])

  const fetchSystemStatus = async () => {
    try {
      const res = await apiFetch("/api/health")
      if (res.ok) {
        const data = await res.json()
        setSystemStatus(data)
      }
    } catch (err) {
      console.error("Failed to fetch system status", err)
    }
  }

  useEffect(() => {
    fetchSystemStatus()
    const interval = setInterval(fetchSystemStatus, 30000)
    return () => clearInterval(interval)
  }, [])
  const [newProduct, setNewProduct] = useState({
    nameAr: "",
    nameEn: "",
    price: 0,
    category: "",
    descriptionAr: "",
    descriptionEn: "",
    imageUrl: "",
    imageUrls: [] as string[],
    videoUrl: "",
    iconName: "Box"
  })

  const [supportMessages, setSupportMessages] = useState<SupportMsg[]>([
    {
      id: "m1",
      role: "user",
      text: "مرحباً، اواجه مشكلة في تفعيل لوحة التحكم الجديدة. هل يمكنك المساعدة؟",
      time: "10:15 AM",
    },
    {
      id: "m2",
      role: "agent",
      text: "أهلاً بك أحمد، نعم بالتأكيد! نحتاج أولاً للتأكد من رقم المتسلسل للنظام لديك.",
      time: "10:18 AM",
    },
  ])
  const [supportReply, setSupportReply] = useState("")
  const [supportImagePreview, setSupportImagePreview] = useState<string | null>(null)
  const [showSupportEmoji, setShowSupportEmoji] = useState(false)
  const [showSupportCanned, setShowSupportCanned] = useState(false)
  const [showSupportOrders, setShowSupportOrders] = useState(false)
  const [activeChatBlocked, setActiveChatBlocked] = useState(false)
  const supportAttachmentRef = useRef<HTMLInputElement>(null)

  const initialNotifications = useMemo<AdminNotification[]>(
    () =>
      isRTL
        ? [
            { id: "n1", title: "طلب دعم جديد", message: "عميل جديد فتح محادثة دعم.", time: "منذ دقيقتين", unread: true },
            { id: "n2", title: "منتج مضاف", message: "تمت إضافة منتج جديد إلى المتجر.", time: "منذ 10 دقائق", unread: true },
            { id: "n3", title: "نسخة احتياطية مكتملة", message: "اكتملت النسخة الاحتياطية اليومية بنجاح.", time: "منذ ساعة", unread: false },
          ]
        : [
            { id: "n1", title: "New support request", message: "A new customer opened a support chat.", time: "2m ago", unread: true },
            { id: "n2", title: "Product added", message: "A new product was added to the store.", time: "10m ago", unread: true },
            { id: "n3", title: "Backup completed", message: "Daily backup finished successfully.", time: "1h ago", unread: false },
          ],
    [isRTL],
  )
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications)
  const unreadNotificationsCount = useMemo(() => notifications.filter((n) => n.unread).length, [notifications])
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "editor" as "admin" | "editor",
  })
  const [users, setUsers] = useState<AdminUser[]>([
    { id: 1, name: "Admin User", email: "admin@alaskarian.tech", role: "admin", avatar: "" },
    { id: 2, name: "Sarah Smith", email: "sarah@example.com", role: "editor", avatar: "" },
    { id: 3, name: "محمد حسن", email: "m.hassan@example.com", role: "editor", avatar: "" },
    { id: 4, name: "Ali Ahmed", email: "ali.ahmed@example.com", role: "editor", avatar: "" },
  ])

  const cannedReplies = useMemo(
    () =>
      isRTL
        ? [
            { id: "c1", label: "طلب الرقم التسلسلي", body: "مرحباً، يرجى إرسال الرقم التسلسلي الظاهر في شاشة التفعيل." },
            { id: "c2", label: "تأكيد الاستلام", body: "تم استلام طلبك وسيتم التواصل معك خلال دقائق." },
            { id: "c3", label: "إغلاق تذكرة", body: "نأمل أن تكون المشكلة قد حُلت. نسعد بخدمتك دائماً." },
          ]
        : [
            { id: "c1", label: "Ask for serial", body: "Hello, please send the serial number shown on your activation screen." },
            { id: "c2", label: "Acknowledge", body: "Thanks — we received your request and will reply shortly." },
            { id: "c3", label: "Close ticket", body: "We hope the issue is resolved. Let us know if you need anything else." },
          ],
    [isRTL],
  )

  const mockCustomerOrders = useMemo(
    () =>
      isRTL
        ? [
            { id: "ORD-1042", total: "1,124,000 د.ع", status: "مكتمل", date: "2025-04-28" },
            { id: "ORD-1038", total: "450,000 د.ع", status: "قيد الشحن", date: "2025-04-22" },
          ]
        : [
            { id: "ORD-1042", total: "1,124,000 IQD", status: "Completed", date: "2025-04-28" },
            { id: "ORD-1038", total: "450,000 IQD", status: "Shipped", date: "2025-04-22" },
          ],
    [isRTL],
  )

  useEffect(() => {
    if (activeTab === "logs") {
      apiFetch("/api/logs").then(res => res.json()).then(setLogs)
    }
    if (activeTab === "products") {
      fetchProducts()
    }
  }, [activeTab])

  useEffect(() => {
    const onResize = () => {
      setIsSidebarOpen(window.innerWidth >= 1024)
    }

    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  const handleTestTelegram = async () => {
    if (!localConfig.integrations?.telegram?.botToken || !localConfig.integrations?.telegram?.chatId) {
      toast.error(isRTL ? "يرجى إدخال التوكن ومعرف الدردشة أولاً" : "Please enter bot token and chat ID first")
      return
    }

    try {
      const res = await fetch(`https://api.telegram.org/bot${localConfig.integrations.telegram.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: localConfig.integrations.telegram.chatId,
          text: isRTL 
            ? "🚀 *اختبار اتصال العسكريان للحلول البرمجية*\n\nتم ربط لوحة التحكم بنجاح! ستصلك الإشعارات هنا عند وصول رسائل جديدة." 
            : "🚀 *Alaskarian Tech Connection Test*\n\nDashboard connected successfully! You will receive notifications here for new messages.",
          parse_mode: "Markdown"
        })
      })

      if (res.ok) {
        toast.success(isRTL ? "تم إرسال رسالة الاختبار بنجاح!" : "Test message sent successfully!")
      } else {
        const err = await res.json()
        toast.error(`${isRTL ? "فشل الاتصال:" : "Connection failed:"} ${err.description || "Unknown error"}`)
      }
    } catch (err) {
      toast.error(isRTL ? "خطأ في الاتصال بخوادم تيليجرام" : "Error connecting to Telegram servers")
    }
  }

  const fetchProducts = async () => {
    setIsProductsLoading(true)
    try {
      const res = await apiFetch("/api/products")
      const data = await res.json()
      setProducts(data)
    } finally {
      setIsProductsLoading(false)
    }
  }

  const handleCreateProduct = async (draft: any) => {
    const res = await apiFetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    })
    if (res.ok) {
      setNewProduct({ nameAr: "", nameEn: "", price: 0, category: "", descriptionAr: "", descriptionEn: "", imageUrl: "", imageUrls: [], videoUrl: "", iconName: "Box" })
      setEditingProduct(null)
      fetchProducts()
    }
  }

  const handleUpdateProduct = async (draft: any) => {
    const res = await fetch(`/api/products/${draft.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft)
    })
    if (res.ok) {
      setEditingProduct(null)
      fetchProducts()
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد؟" : "Are you sure?")) return
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) fetchProducts()
  }

  const fetchRequests = async () => {
    setIsRequestsLoading(true)
    try {
      const res = await apiFetch("/api/requests")
      const data = await res.json()
      setRequests(data)
    } finally {
      setIsRequestsLoading(false)
    }
  }

  const handleUpdateRequestStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
    if (res.ok) {
      fetchRequests()
    }
  }

  const handleDeleteRequest = async (id: string) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذا الطلب؟" : "Are you sure you want to delete this request?")) return
    const res = await fetch(`/api/requests/${id}`, { method: "DELETE" })
    if (res.ok) fetchRequests()
  }

  // Sync local state with global config
  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    updateConfig(localConfig)
    setIsSaving(false)
  }

  const handleAddUser = () => {
    const trimmedName = newUser.name.trim()
    const trimmedEmail = newUser.email.trim()
    if (!trimmedName || !trimmedEmail) return

    const createdUser: AdminUser = {
      id: Date.now(),
      name: trimmedName,
      email: trimmedEmail,
      role: newUser.role,
      avatar: "",
    }
    setUsers((prev) => [createdUser, ...prev])
    setNewUser({ name: "", email: "", role: "editor" })
    setIsAddUserOpen(false)
  }

  const stats = [
    { label: isRTL ? "مجموع المستخدمين" : "Total Users", value: "1,284", icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: isRTL ? "دردشات نشطة" : "Active Chats", value: "14", icon: MessageSquare, color: "bg-cyan-500", trend: "-5%" },
    { label: isRTL ? "معدل التحويل" : "Conversion Rate", value: "3.4%", icon: TrendingUp, color: "bg-emerald-500", trend: "+2%" },
    { label: isRTL ? "أداء النظام" : "System Health", value: "99.9%", icon: CheckCircle2, color: "bg-purple-500", trend: "Stable" },
  ]

  const recentChats = [
    { id: 1, user: "احمد علي", message: "احتاج مساعدة في تفعيل النظام", status: "online", time: "2m ago" },
    { id: 2, user: "Sarah Smith", message: "How can I integrate the API?", status: "offline", time: "15m ago" },
    { id: 3, user: "محمد حسن", message: "شكراً لكم، تم حل المشكلة", status: "online", time: "1h ago" },
  ]

  return (
    <div className={cn(
      "h-screen bg-slate-50 dark:bg-[#06080a] flex overflow-hidden",
      isRTL && "font-cairo"
    )} dir={isRTL ? "rtl" : "ltr"}>
      
      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:sticky top-0 z-50 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col shadow-xl lg:shadow-none",
        isRTL ? "right-0 lg:right-auto" : "left-0",
        isSidebarOpen
          ? "w-72 translate-x-0"
          : cn("w-72 lg:w-20 lg:translate-x-0", isRTL ? "translate-x-full" : "-translate-x-full")
      )}>
        <div className="flex flex-col h-full w-full overflow-hidden">
          {/* Logo */}
          <div className="p-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/20">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            {isSidebarOpen && (
              <span className="font-bold text-xl dark:text-white truncate tracking-tight">
                {isRTL ? "لوحة العسكريان" : "Alaskarian Panel"}
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto custom-scrollbar">
            <a
              href="/"
              className={cn(
                "mb-3 flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-100 hover:text-foreground dark:hover:bg-slate-800 dark:hover:text-white",
                !isSidebarOpen && "justify-center px-2",
              )}
            >
              <ExternalLink className="h-4 w-4 shrink-0 opacity-70" />
              {isSidebarOpen && (isRTL ? "الموقع العام" : "Public site")}
            </a>
            <NavItem 
              icon={LayoutDashboard} 
              label={isRTL ? "نظرة عامة" : "Overview"} 
              isActive={activeTab === "overview"} 
              onClick={() => setActiveTab("overview")}
              isOpen={isSidebarOpen}
            />
            <NavItem 
              icon={Users} 
              label={isRTL ? "المستخدمين" : "Users"} 
              isActive={activeTab === "users"} 
              onClick={() => setActiveTab("users")}
              isOpen={isSidebarOpen}
            />
            <NavItem 
              icon={Box} 
              label={isRTL ? "المنتجات" : "Products"} 
              isActive={activeTab === "products"} 
              onClick={() => setActiveTab("products")}
              isOpen={isSidebarOpen}
            />
            <NavItem 
              icon={ClipboardList} 
              label={isRTL ? "طلبات الأنظمة" : "System Requests"} 
              isActive={activeTab === "requests"} 
              onClick={() => setActiveTab("requests")}
              isOpen={isSidebarOpen}
              badge={requests.filter(r => r.status === "pending").length > 0 ? String(requests.filter(r => r.status === "pending").length) : undefined}
            />
            <NavItem 
              icon={FileText} 
              label={isRTL ? "إدارة المحتوى" : "Content Management"} 
              isActive={activeTab === "content"} 
              onClick={() => setActiveTab("content")}
              isOpen={isSidebarOpen}
            />
            <NavItem 
              icon={Palette} 
              label={isRTL ? "تخصيص المظهر" : "Appearance"} 
              isActive={activeTab === "appearance"} 
              onClick={() => setActiveTab("appearance")}
              isOpen={isSidebarOpen}
            />
            <NavItem 
              icon={Clock} 
              label={isRTL ? "سجلات النظام" : "System Logs"} 
              isActive={activeTab === "logs"} 
              onClick={() => setActiveTab("logs")}
              isOpen={isSidebarOpen}
            />
            <NavItem
              icon={Bell}
              label={isRTL ? "الإشعارات" : "Notifications"}
              isActive={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
              isOpen={isSidebarOpen}
              badge={unreadNotificationsCount > 0 ? String(Math.min(unreadNotificationsCount, 9)) : undefined}
            />
            <NavItem 
              icon={MessageSquare} 
              label={isRTL ? "مركز الدعم" : "Support Center"} 
              isActive={activeTab === "support"} 
              onClick={() => setActiveTab("support")}
              isOpen={isSidebarOpen}
              badge="14"
            />
            <NavItem 
              icon={Settings} 
              label={isRTL ? "الإعدادات" : "Settings"} 
              isActive={activeTab === "settings"} 
              onClick={() => setActiveTab("settings")}
              isOpen={isSidebarOpen}
            />
          </nav>

          {/* User Profile & Logout - Fixed at bottom */}
          <div className="mt-auto p-3 border-t dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className={cn(
              "flex items-center gap-3 p-2 rounded-2xl bg-white dark:bg-slate-800 border dark:border-slate-700 shadow-sm mb-2 transition-all",
              !isSidebarOpen && "justify-center opacity-0 lg:opacity-100"
            )}>
              <div className="w-8 h-8 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center shrink-0 border-2 border-white dark:border-slate-700">
                <Users className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              {isSidebarOpen && (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold dark:text-white truncate">Admin Account</p>
                    <p className="text-[10px] text-muted-foreground truncate uppercase font-semibold">Super Admin</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab("notifications")}
                    className={cn(
                      "relative p-2 text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all",
                      isRTL ? "mr-auto" : "ml-auto"
                    )}
                    title={isRTL ? "الإشعارات" : "Notifications"}
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationsCount > 0 && (
                      <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-800" />
                    )}
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <div className={cn("flex gap-2", !isSidebarOpen && "flex-col")}>
                <Button
                  type="button"
                  onClick={onToggleLanguage}
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition-all h-auto",
                    !isSidebarOpen && "justify-center px-2"
                  )}
                  title={isRTL ? "تغيير اللغة" : "Change Language"}
                >
                  <Languages className="w-4 h-4 shrink-0" />
                  {isSidebarOpen && <span className={cn("ml-3 font-bold text-sm truncate", isRTL && "mr-3 ml-0")}>{isRTL ? "English" : "العربية"}</span>}
                </Button>
                <Button
                  type="button"
                  onClick={toggleTheme}
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-start text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-4 py-2.5 transition-all h-auto",
                    !isSidebarOpen && "justify-center px-2"
                  )}
                  title={isRTL ? "تبديل المظهر" : "Toggle Theme"}
                >
                  {currentTheme === "dark" ? <Sun className="w-4 h-4 shrink-0" /> : <Moon className="w-4 h-4 shrink-0" />}
                  {isSidebarOpen && <span className={cn("ml-3 font-bold text-sm truncate", isRTL && "mr-3 ml-0")}>{isRTL ? (currentTheme === "dark" ? "فاتح" : "داكن") : (currentTheme === "dark" ? "Light" : "Dark")}</span>}
                </Button>
              </div>
              <Button 
                variant="ghost" 
                onClick={onLogout}
                className={cn(
                  "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl px-4 py-2.5 transition-all h-auto",
                  !isSidebarOpen && "justify-center px-2"
                )}
              >
                <LogOut className="w-4 h-4" />
                {isSidebarOpen && <span className={cn("ml-3 font-bold text-sm", isRTL && "mr-3 ml-0")}>{isRTL ? "تسجيل الخروج" : "Logout"}</span>}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#06080a]">
        {/* Topbar */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="flex"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="relative hidden md:block">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
              <input 
                type="text" 
                placeholder={isRTL ? "بحث عن أي شيء..." : "Search anything..."}
                className={cn(
                  "py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border-0 text-sm w-64 focus:ring-2 focus:ring-cyan-500/20",
                  isRTL ? "pr-10 pl-4 text-right font-cairo" : "pl-10 pr-4 text-left",
                )}
              />
            </div>
          </div>


        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border dark:border-slate-800 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between">
                        <div className={cn("p-3 rounded-xl text-white shadow-lg", stat.color)}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          stat.trend.startsWith("+") ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                        )}>
                          {stat.trend}
                        </span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-bold dark:text-white mt-1">{stat.value}</h3>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Activity */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8">
                    <h3 className="text-xl font-bold dark:text-white mb-6">
                      {isRTL ? "النشاط الأخير" : "Recent Activity"}
                    </h3>
                    <div className="space-y-6">
                      {[1, 2, 3, 4].map((item) => (
                        <div key={item} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-700 shrink-0 overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?img=${item + 10}`} alt="User" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm dark:text-slate-200">
                              <span className="font-bold">User #{item * 123}</span> just registered from Saudi Arabia
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* System Status Table */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 overflow-hidden">
                    <h3 className="text-xl font-bold dark:text-white mb-6">
                      {isRTL ? "حالة النظام" : "System Status"}
                    </h3>
                    <div className="space-y-4">
                      {systemStatus.map((service) => {
                        const isOk = service.status === "operational"
                        const isDegraded = service.status === "degraded"
                        
                        return (
                          <div key={service.label} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full animate-pulse",
                                isOk ? "bg-emerald-500" : isDegraded ? "bg-amber-500" : "bg-red-500"
                              )} />
                              <span className="text-sm font-medium dark:text-slate-200">{service.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider",
                                isOk ? "text-emerald-500" : isDegraded ? "text-amber-500" : "text-red-500"
                              )}>
                                {service.status}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div 
                key="content"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "إدارة المحتوى" : "Content Management"}</h2>
                    <p className="text-muted-foreground">{isRTL ? "تحكم في جميع النصوص والرسوم في الموقع" : "Control all text and visuals on the site"}</p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button variant="outline" onClick={resetConfig} className="w-full gap-2 sm:w-auto">
                       <RotateCcw className="w-4 h-4" />
                       {isRTL ? "إعادة ضبط" : "Reset"}
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 sm:w-auto transition-transform duration-150 active:scale-95">
                       <Save className={cn("w-4 h-4", isSaving && "animate-spin")} />
                       {isSaving ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ التغييرات" : "Save Changes")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                   {/* Hero Section Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-600 flex items-center justify-center">
                          <FileText className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "قسم الواجهة (Hero)" : "Hero Section"}</h3>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (إنجليزي)" : "Title (English)"}</label>
                          <input 
                            type="text" 
                            value={localConfig.hero.titleEn}
                            onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, titleEn: e.target.value}})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500/20 outline-none dark:text-white"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (عربي)" : "Title (Arabic)"}</label>
                          <input 
                            type="text" 
                            dir="rtl"
                            value={localConfig.hero.titleAr}
                            onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, titleAr: e.target.value}})}
                            className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-cyan-500/20 outline-none dark:text-white font-cairo"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان الفرعي (إنجليزي)" : "Subtitle (EN)"}</label>
                          <textarea value={localConfig.hero.subtitleEn} onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, subtitleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white h-20" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان الفرعي (عربي)" : "Subtitle (AR)"}</label>
                          <textarea dir="rtl" value={localConfig.hero.subtitleAr} onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, subtitleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo h-20" />
                       </div>
                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر الرئيسي (إنجليزي)" : "Primary Button (EN)"}</label>
                            <input 
                              type="text" 
                              value={localConfig.hero.primaryButtonEn}
                              onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, primaryButtonEn: e.target.value}})}
                              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 dark:text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر الرئيسي (عربي)" : "Primary Button (AR)"}</label>
                            <input 
                              type="text" 
                              dir="rtl"
                              value={localConfig.hero.primaryButtonAr}
                              onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, primaryButtonAr: e.target.value}})}
                              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border-slate-200 dark:border-slate-700 dark:text-white font-cairo"
                            />
                          </div>
                       </div>
                       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر الثانوي (إنجليزي)" : "Secondary Button (EN)"}</label>
                             <input type="text" value={localConfig.hero.secondaryButtonEn} onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, secondaryButtonEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر الثانوي (عربي)" : "Secondary Button (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.hero.secondaryButtonAr} onChange={(e) => setLocalConfig({...localConfig, hero: {...localConfig.hero, secondaryButtonAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Navbar Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                          <LayoutGrid className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "شريط التنقل (Navbar)" : "Navbar Settings"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "رمز الشعار (EN)" : "Logo Initial (EN)"}</label>
                             <input type="text" maxLength={1} value={localConfig.navbar.logoInitialEn || ""} onChange={(e) => setLocalConfig({...localConfig, navbar: {...localConfig.navbar, logoInitialEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "نص خدمة العملاء (EN)" : "Customer Service (EN)"}</label>
                             <input type="text" value={localConfig.navbar.customerServiceEn || ""} onChange={(e) => setLocalConfig({...localConfig, navbar: {...localConfig.navbar, customerServiceEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "رمز الشعار (AR)" : "Logo Initial (AR)"}</label>
                             <input type="text" maxLength={1} dir="rtl" value={localConfig.navbar.logoInitialAr || ""} onChange={(e) => setLocalConfig({...localConfig, navbar: {...localConfig.navbar, logoInitialAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "نص خدمة العملاء (AR)" : "Customer Service (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.navbar.customerServiceAr || ""} onChange={(e) => setLocalConfig({...localConfig, navbar: {...localConfig.navbar, customerServiceAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Systems Section Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-600 flex items-center justify-center">
                          <Monitor className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "قسم الأنظمة" : "Systems Section"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Label (EN)</label>
                                <input type="text" value={localConfig.systems.sectionLabelEn || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, sectionLabelEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Title (EN)</label>
                                <input type="text" value={localConfig.systems.titleEn || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, titleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Subtitle (EN)</label>
                             <textarea value={localConfig.systems.subtitleEn || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, subtitleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white h-20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">CTA (EN)</label>
                                <input type="text" value={localConfig.systems.ctaEn || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, ctaEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">View All (EN)</label>
                                <input type="text" value={localConfig.systems.viewAllEn || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, viewAllEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase font-cairo">العنوان الجانبي (AR)</label>
                                <input type="text" dir="rtl" value={localConfig.systems.sectionLabelAr || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, sectionLabelAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase font-cairo">العنوان (AR)</label>
                                <input type="text" dir="rtl" value={localConfig.systems.titleAr || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, titleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase font-cairo">الوصف (AR)</label>
                             <textarea dir="rtl" value={localConfig.systems.subtitleAr || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, subtitleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo h-20" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase font-cairo">نص الزر (AR)</label>
                                <input type="text" dir="rtl" value={localConfig.systems.ctaAr || ""} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, ctaAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase font-cairo">عرض الكل (AR)</label>
                                <input type="text" dir="rtl" value={localConfig.systems.viewAllAr} onChange={(e) => setLocalConfig({...localConfig, systems: {...localConfig.systems, viewAllAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Integrations & Telegram Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                             <Bell className="w-4 h-4" />
                          </div>
                          <h3 className="text-xl font-bold dark:text-white">{isRTL ? "التكامل والإشعارات" : "Integrations & Notifications"}</h3>
                       </div>
                       <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-500">{isRTL ? "تفعيل تيليجرام" : "Enable Telegram"}</span>
                          <button
                            onClick={() => {
                              const current = localConfig.integrations?.telegram?.enabled || false
                              setLocalConfig({
                                ...localConfig,
                                integrations: {
                                  ...localConfig.integrations,
                                  telegram: { ...(localConfig.integrations?.telegram || {}), enabled: !current }
                                }
                              })
                            }}
                            className={`w-12 h-6 rounded-full transition-colors relative ${
                              localConfig.integrations?.telegram?.enabled ? "bg-cyan-600" : "bg-slate-200 dark:bg-slate-700"
                            }`}
                          >
                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                              localConfig.integrations?.telegram?.enabled ? (isRTL ? "left-1" : "right-1") : (isRTL ? "right-1" : "left-1")
                            }`} />
                          </button>
                       </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border dark:border-slate-700 space-y-6">
                       <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-[#0088cc]/10 text-[#0088cc] flex items-center justify-center">
                             <Send className="w-5 h-5" />
                          </div>
                          <div>
                             <h4 className="font-bold dark:text-white">Telegram Bot</h4>
                             <p className="text-xs text-slate-500">{isRTL ? "استقبل إشعارات الدردشة مباشرة على تيليجرام" : "Receive chat notifications directly on Telegram"}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "توكن البوت (Bot Token)" : "Bot Token"}</label>
                             <input 
                               type="password" 
                               value={localConfig.integrations?.telegram?.botToken || ""} 
                               onChange={(e) => setLocalConfig({
                                 ...localConfig,
                                 integrations: {
                                   ...localConfig.integrations,
                                   telegram: { ...(localConfig.integrations?.telegram || {}), botToken: e.target.value }
                                 }
                               })} 
                               className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white text-sm"
                               placeholder="123456:ABC-DEF..."
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "معرف الدردشة (Chat ID)" : "Chat ID"}</label>
                             <input 
                               type="text" 
                               value={localConfig.integrations?.telegram?.chatId || ""} 
                               onChange={(e) => setLocalConfig({
                                 ...localConfig,
                                 integrations: {
                                   ...localConfig.integrations,
                                   telegram: { ...(localConfig.integrations?.telegram || {}), chatId: e.target.value }
                                 }
                               })} 
                               className="w-full p-3 bg-white dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white text-sm"
                               placeholder="-100123456789"
                             />
                          </div>
                       </div>

                       <div className="flex justify-end">
                          <Button 
                             variant="outline" 
                             className="gap-2 border-cyan-500/20 text-cyan-600 hover:bg-cyan-50"
                             onClick={handleTestTelegram}
                          >
                             <Send className="w-4 h-4" />
                             {isRTL ? "إرسال رسالة اختبار" : "Send Test Message"}
                          </Button>
                       </div>
                    </div>
                  </div>

                  {/* Footer Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-slate-500/10 text-slate-600 flex items-center justify-center">
                          <Mail className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "تذييل الصفحة (Footer)" : "Footer Settings"}</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Description (EN)</label>
                             <textarea value={localConfig.footer.descriptionEn} onChange={(e) => setLocalConfig({...localConfig, footer: {...localConfig.footer, descriptionEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white h-20" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase">Copyright (EN)</label>
                             <input type="text" value={localConfig.footer.copyrightEn} onChange={(e) => setLocalConfig({...localConfig, footer: {...localConfig.footer, copyrightEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase font-cairo">الوصف التعريفي (AR)</label>
                             <textarea dir="rtl" value={localConfig.footer.descriptionAr} onChange={(e) => setLocalConfig({...localConfig, footer: {...localConfig.footer, descriptionAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo h-20" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold text-slate-500 uppercase font-cairo">حقوق النشر (AR)</label>
                             <input type="text" dir="rtl" value={localConfig.footer.copyrightAr} onChange={(e) => setLocalConfig({...localConfig, footer: {...localConfig.footer, copyrightAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Stats Section Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "إحصائيات المنصة" : "Platform Stats"}</h3>
                    </div>
                    
                    <div className="space-y-6">
                       {localConfig.stats.map((stat, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 space-y-3">
                            <div className="flex items-center justify-between">
                               <span className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Stat #{i + 1}</span>
                               <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => {
                                 const newStats = [...localConfig.stats];
                                 newStats.splice(i, 1);
                                 setLocalConfig({...localConfig, stats: newStats});
                               }}><Trash2 className="w-3 h-3" /></Button>
                            </div>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                               <input 
                                 type="text" 
                                 placeholder={isRTL ? "القيمة (مثال: 1500+)" : "Value (e.g. 1500+)"}
                                 value={stat.value}
                                 onChange={(e) => {
                                   const newStats = [...localConfig.stats];
                                   newStats[i].value = e.target.value;
                                   setLocalConfig({...localConfig, stats: newStats});
                                 }}
                                 className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-sm dark:text-white"
                               />
                               <div className="flex flex-col gap-2">
                                  <input 
                                    type="text" 
                                    placeholder={isRTL ? "الوصف (إنجليزي)" : "Label (EN)"}
                                    value={stat.labelEn}
                                    onChange={(e) => {
                                      const newStats = [...localConfig.stats];
                                      newStats[i].labelEn = e.target.value;
                                      setLocalConfig({...localConfig, stats: newStats});
                                    }}
                                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-sm dark:text-white"
                                  />
                                  <input 
                                    type="text" 
                                    placeholder={isRTL ? "الوصف (عربي)" : "Label (AR)"}
                                    dir="rtl"
                                    value={stat.labelAr}
                                    onChange={(e) => {
                                      const newStats = [...localConfig.stats];
                                      newStats[i].labelAr = e.target.value;
                                      setLocalConfig({...localConfig, stats: newStats});
                                    }}
                                    className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-sm dark:text-white font-cairo"
                                  />
                               </div>
                            </div>
                         </div>
                       ))}
                       <Button variant="outline" className="w-full rounded-xl border-dashed py-6" onClick={() => {
                         setLocalConfig({...localConfig, stats: [...localConfig.stats, { labelAr: "جديد", labelEn: "New Stat", value: "0" }]});
                       }}>
                          <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? "إضافة إحصائية جديدة" : "Add New Stat"}
                       </Button>
                    </div>
                  </div>

                  {/* Features Section Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                          <Shield className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "مميزات المنصة" : "Platform Features"}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (إنجليزي)" : "Title (EN)"}</label>
                             <input type="text" value={localConfig.features.titleEn} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, titleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "التمييز (إنجليزي)" : "Highlight (EN)"}</label>
                             <input type="text" value={localConfig.features.titleHighlightEn} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, titleHighlightEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الوصف الفرعي (إنجليزي)" : "Subtitle (EN)"}</label>
                             <textarea value={localConfig.features.subtitleEn} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, subtitleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white h-24" />
                          </div>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (عربي)" : "Title (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.features.titleAr} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, titleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "التمييز (عربي)" : "Highlight (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.features.titleHighlightAr} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, titleHighlightAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الوصف الفرعي (عربي)" : "Subtitle (AR)"}</label>
                             <textarea dir="rtl" value={localConfig.features.subtitleAr} onChange={(e) => setLocalConfig({...localConfig, features: {...localConfig.features, subtitleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo h-24" />
                          </div>
                       </div>
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {localConfig.features.items.map((item, i) => (
                         <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 space-y-3 relative group/item">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6 text-red-500 opacity-0 group-hover/item:opacity-100 transition-opacity" onClick={() => {
                               const newItems = [...localConfig.features.items];
                               newItems.splice(i, 1);
                               setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                            }}><Trash2 className="w-3 h-3" /></Button>
                            <div className="space-y-1">
                               <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{isRTL ? "اسم الأيقونة" : "Icon Name"}</label>
                               <input type="text" value={item.iconName} onChange={(e) => {
                                  const newItems = [...localConfig.features.items];
                                  newItems[i].iconName = e.target.value;
                                  setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                               }} className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs" />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                               <input placeholder={isRTL ? "العنوان (EN)" : "Title EN"} value={item.titleEn} onChange={(e) => {
                                  const newItems = [...localConfig.features.items];
                                  newItems[i].titleEn = e.target.value;
                                  setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                               }} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-xs" />
                               <input placeholder={isRTL ? "العنوان (AR)" : "Title AR"} dir="rtl" value={item.titleAr} onChange={(e) => {
                                  const newItems = [...localConfig.features.items];
                                  newItems[i].titleAr = e.target.value;
                                  setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                               }} className="p-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-cairo" />
                            </div>
                            <textarea placeholder={isRTL ? "الوصف (EN)" : "Description EN"} value={item.descriptionEn} onChange={(e) => {
                               const newItems = [...localConfig.features.items];
                               newItems[i].descriptionEn = e.target.value;
                               setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                            }} className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs h-16" />
                            <textarea placeholder={isRTL ? "الوصف (AR)" : "Description AR"} dir="rtl" value={item.descriptionAr} onChange={(e) => {
                               const newItems = [...localConfig.features.items];
                               newItems[i].descriptionAr = e.target.value;
                               setLocalConfig({...localConfig, features: {...localConfig.features, items: newItems}});
                            }} className="w-full p-2 bg-white dark:bg-slate-900 rounded-lg text-xs font-cairo h-16" />
                         </div>
                       ))}
                       <Button variant="outline" className="rounded-2xl border-dashed h-full min-h-[150px] flex flex-col gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800" onClick={() => {
                          setLocalConfig({...localConfig, features: {...localConfig.features, items: [...localConfig.features.items, { iconName: "Shield", titleAr: "ميزة جديدة", titleEn: "New Feature", descriptionAr: "", descriptionEn: "" }]}});
                       }}>
                          <Plus className="w-5 h-5 text-slate-400" />
                          <span className="text-sm font-bold text-slate-500">{isRTL ? "إضافة ميزة" : "Add Feature"}</span>
                       </Button>
                    </div>
                  </div>

                  {/* CTA Section Control */}
                  <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                          <Smartphone className="w-4 h-4" />
                       </div>
                       <h3 className="text-xl font-bold dark:text-white">{isRTL ? "قسم الطلب الخاص" : "Custom CTA"}</h3>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (إنجليزي)" : "Title (EN)"}</label>
                             <input type="text" value={localConfig.cta.titleEn} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, titleEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "التمييز (إنجليزي)" : "Highlight (EN)"}</label>
                             <input type="text" value={localConfig.cta.titleHighlightEn} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, titleHighlightEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (عربي)" : "Title (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.cta.titleAr} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, titleAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "التمييز (عربي)" : "Highlight (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.cta.titleHighlightAr} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, titleHighlightAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر (إنجليزي)" : "Button (EN)"}</label>
                             <input type="text" value={localConfig.cta.buttonEn} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, buttonEn: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "الزر (عربي)" : "Button (AR)"}</label>
                             <input type="text" dir="rtl" value={localConfig.cta.buttonAr} onChange={(e) => setLocalConfig({...localConfig, cta: {...localConfig.cta, buttonAr: e.target.value}})} className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo" />
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "appearance" && (
              <motion.div 
                key="appearance"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                 <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "تخصيص المظهر" : "Visual Identity Control"}</h2>
                      <p className="text-muted-foreground">{isRTL ? "تحكم في هوية الموقع البصرية وعناصر العرض" : "Master the site's visual identity and visibility"}</p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 sm:w-auto transition-transform duration-150 active:scale-95">
                       <Save className={cn("w-4 h-4", isSaving && "animate-spin")} />
                       {isRTL ? "حفظ الإعدادات" : "Save Appearance"}
                    </Button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Theme Controls */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                       <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                          <Palette className="w-5 h-5 text-cyan-600" />
                          {isRTL ? "الألوان والثيم" : "Colors & Theme"}
                       </h3>
                       
                       <div className="space-y-6">
                          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <div>
                                <p className="font-bold dark:text-white">{isRTL ? "اللون الأساسي" : "Primary Color"}</p>
                                <p className="text-xs text-muted-foreground">{localConfig.appearance.primaryColor}</p>
                             </div>
                             <input 
                               type="color" 
                               value={localConfig.appearance.primaryColor}
                               onChange={(e) => setLocalConfig({...localConfig, appearance: {...localConfig.appearance, primaryColor: e.target.value}})}
                               className="w-12 h-12 rounded-xl cursor-pointer border-0 bg-transparent"
                             />
                          </div>
                          
                          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                             <div>
                                <p className="font-bold dark:text-white">{isRTL ? "زر الدعم الفني" : "Support Button"}</p>
                                <p className="text-xs text-muted-foreground">{isRTL ? "إظهار أو إخفاء أيقونة الدردشة" : "Show or hide the chat widget"}</p>
                             </div>
                             <AdminToggle
                               checked={localConfig.appearance.showSupportButton}
                               onCheckedChange={() =>
                                 setLocalConfig({
                                   ...localConfig,
                                   appearance: {
                                     ...localConfig.appearance,
                                     showSupportButton: !localConfig.appearance.showSupportButton,
                                   },
                                 })
                               }
                               activeClassName="bg-cyan-600"
                             />
                          </div>
                       </div>
                    </div>

                    {/* Announcement Bar */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-8 space-y-6">
                       <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                          <Bell className="w-5 h-5 text-amber-500" />
                          {isRTL ? "شريط الإعلانات" : "Announcement Bar"}
                       </h3>
                       
                       <div className="space-y-4">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-sm font-medium dark:text-slate-300">{isRTL ? "تفعيل الشريط" : "Enable Announcement"}</p>
                             <AdminToggle
                               checked={localConfig.appearance.showAnnouncement}
                               onCheckedChange={() =>
                                 setLocalConfig({
                                   ...localConfig,
                                   appearance: {
                                     ...localConfig.appearance,
                                     showAnnouncement: !localConfig.appearance.showAnnouncement,
                                   },
                                 })
                               }
                               activeClassName="bg-amber-500"
                             />
                          </div>
                          
                          <div className="space-y-4 opacity-100 transition-opacity" style={{ opacity: localConfig.appearance.showAnnouncement ? 1 : 0.4 }}>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">TEXT (EN)</label>
                                <input 
                                  disabled={!localConfig.appearance.showAnnouncement}
                                  type="text"
                                  value={localConfig.appearance.announcementEn}
                                  onChange={(e) => setLocalConfig({...localConfig, appearance: {...localConfig.appearance, announcementEn: e.target.value}})}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white"
                                />
                             </div>
                             <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500">TEXT (AR)</label>
                                <input 
                                  disabled={!localConfig.appearance.showAnnouncement}
                                  type="text"
                                  dir="rtl"
                                  value={localConfig.appearance.announcementAr}
                                  onChange={(e) => setLocalConfig({...localConfig, appearance: {...localConfig.appearance, announcementAr: e.target.value}})}
                                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 dark:text-white font-cairo"
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                 </div>
              </motion.div>
            )}

            {activeTab === "logs" && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "سجلات النظام" : "System Logs"}</h2>
                      <p className="text-muted-foreground">{isRTL ? "تتبع جميع الحركات والتغييرات في الموقع" : "Track all activities and changes on the site"}</p>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => apiFetch("/api/logs").then(res => res.json()).then(setLogs)}>
                        <RotateCcw className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                        {isRTL ? "تحديث" : "Refresh"}
                    </Button>
                 </div>

                 <div className="overflow-x-auto bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800">
                    <table className={cn("w-full min-w-[720px]", isRTL ? "text-right" : "text-left")}>
                       <thead className="bg-slate-50 dark:bg-slate-800/50">
                          <tr>
                             <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isRTL ? "الوقت" : "Timestamp"}</th>
                             <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isRTL ? "الحدث" : "Event"}</th>
                             <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isRTL ? "المستخدم" : "User"}</th>
                             <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{isRTL ? "الحالة" : "Status"}</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y dark:divide-slate-800">
                          {logs.map((log) => (
                             <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="px-6 py-4 text-sm font-bold dark:text-white">{log.event}</td>
                                <td className="px-6 py-4 text-sm dark:text-slate-300">{log.user}</td>
                                <td className="px-6 py-4">
                                   <span className="px-2 py-1 bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold rounded-full uppercase">
                                      {log.status}
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "إدارة المستخدمين" : "User Management"}</h2>
                      <p className="text-muted-foreground">{isRTL ? "إدارة صلاحيات وحسابات طاقم العمل" : "Manage staff permissions and accounts"}</p>
                    </div>
                    <Button className="w-full bg-cyan-600 hover:bg-cyan-700 sm:w-auto transition-transform duration-150 active:scale-95" onClick={() => setIsAddUserOpen(true)}>
                        <Plus className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                        {isRTL ? "إضافة مستخدم" : "Add User"}
                    </Button>
                 </div>

                 <AddUserPopup
                   isOpen={isAddUserOpen}
                   isRTL={isRTL}
                   newUser={newUser}
                   setNewUser={setNewUser}
                   onClose={() => setIsAddUserOpen(false)}
                   onSave={handleAddUser}
                 />

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                       <div key={user.id} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border dark:border-slate-800 flex items-center gap-4 hover:shadow-lg transition-all">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                             {user.role === "admin" ? (
                               <ShieldCheck className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                             ) : (
                               <Headset className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                             )}
                          </div>
                          <div>
                             <h4 className="font-bold dark:text-white">{user.name}</h4>
                             <p className="text-xs text-muted-foreground">{user.email}</p>
                             <div className="flex gap-2 mt-2">
                                <span className={cn(
                                   "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                                   user.role === "admin" ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20" : "bg-slate-100 text-slate-600 dark:bg-slate-800"
                                )}>
                                   {user.role === "admin" ? (isRTL ? "مدير" : "Admin") : (isRTL ? "دعم فني" : "Technical Support")}
                                </span>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </motion.div>
            )}

            {activeTab === "support" && (
              <motion.div 
                key="support"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">
                      {isRTL ? "مركز دعم العملاء" : "Customer Support Hub"}
                    </h2>
                    <p className="text-muted-foreground mt-1">
                      {isRTL ? "إدارة جميع الدردشات والمحادثات النشطة" : "Manage all active support chats and conversations"}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white sm:w-auto"
                    >
                        {isRTL ? "تحميل التقرير" : "Download Report"}
                    </Button>
                    <Button className="w-full rounded-xl bg-cyan-600 hover:bg-cyan-700 sm:w-auto">
                        {isRTL ? "تحديث التلقائي" : "Auto Refresh"}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:h-[calc(100vh-320px)] lg:min-h-[500px]">
                  {/* Chat List */}
                  <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 flex flex-col">
                    <div className="p-6 border-b dark:border-slate-800">
                      <div className="relative">
                        <Search className={cn("absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400", isRTL ? "right-3" : "left-3")} />
                        <input 
                           type="text" 
                           placeholder={isRTL ? "بحث عن محادثة..." : "Search chats..."}
                           className={cn(
                             "w-full py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border-0 text-sm focus:ring-2 focus:ring-cyan-500/20",
                             isRTL ? "pr-10 pl-4 text-right font-cairo" : "pl-10 pr-4 text-left",
                           )}
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                       {recentChats.map((chat) => (
                         <button 
                           key={chat.id}
                           className={cn(
                             "w-full p-4 rounded-2xl flex items-start gap-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group",
                             chat.id === 1 && "bg-cyan-50 dark:bg-cyan-500/10 ring-1 ring-cyan-500/30"
                           )}
                         >
                            <div className="relative">
                              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 overflow-hidden border-2 border-white dark:border-slate-700">
                                 <img src={`https://i.pravatar.cc/100?img=${chat.id + 20}`} alt={chat.user} />
                              </div>
                              <span className={cn(
                                "absolute -bottom-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900",
                                isRTL ? "-left-1" : "-right-1",
                                chat.status === "online" ? "bg-emerald-500" : "bg-slate-300"
                              )} />
                            </div>
                            <div className={cn("flex-1 min-w-0", isRTL ? "text-right" : "text-left")}>
                               <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-bold text-sm dark:text-white truncate">{chat.user}</h4>
                                  <span className="text-[10px] text-muted-foreground">{chat.time}</span>
                               </div>
                               <p className="text-xs text-muted-foreground truncate group-hover:text-cyan-600 transition-colors">{chat.message}</p>
                            </div>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Active Chat Window */}
                  <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 flex flex-col shadow-sm overflow-visible">
                     <div className="p-4 sm:p-6 border-b dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-4 min-w-0">
                           <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                              <img src="https://i.pravatar.cc/100?img=21" alt="Active User" />
                           </div>
                           <div className="min-w-0">
                              <h4 className="font-bold dark:text-white truncate">احمد علي</h4>
                              <p className="text-xs text-emerald-500 flex items-center gap-1 font-medium">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                 {activeChatBlocked ? (isRTL ? "محظور" : "Blocked") : isRTL ? "متصل الآن" : "Online now"}
                              </p>
                           </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                           <Button
                             type="button"
                             variant={showSupportOrders ? "secondary" : "ghost"}
                             size="sm"
                             className="rounded-xl gap-2"
                             onClick={() => {
                               setShowSupportOrders((v) => !v)
                               setShowSupportEmoji(false)
                               setShowSupportCanned(false)
                             }}
                           >
                             <ShoppingBag className="h-4 w-4" />
                             <span className="hidden sm:inline">{isRTL ? "طلبات الزبون" : "Orders"}</span>
                           </Button>
                           <Button variant="ghost" size="icon" className="rounded-xl" type="button" aria-label="Notifications">
                             <Bell className="h-4 w-4" />
                           </Button>
                           <Button
                             type="button"
                             variant="ghost"
                             size="icon"
                             className={cn("rounded-xl", activeChatBlocked ? "text-emerald-600" : "text-red-600")}
                             aria-label={activeChatBlocked ? (isRTL ? "إلغاء الحظر" : "Unblock") : (isRTL ? "حظر الزبون" : "Block user")}
                             onClick={() => {
                               if (activeChatBlocked) {
                                 setActiveChatBlocked(false)
                                 return
                               }
                               if (confirm(isRTL ? "حظر هذا الزبون من الدردشة؟" : "Block this customer from chat?")) {
                                 setActiveChatBlocked(true)
                                 setShowSupportEmoji(false)
                                 setShowSupportCanned(false)
                               }
                             }}
                           >
                             <Ban className="h-4 w-4" />
                           </Button>
                        </div>
                     </div>

                     {activeChatBlocked && (
                       <div className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-700 dark:text-red-300">
                         {isRTL
                           ? "تم حظر هذا الزبون — لن يستطيع إرسال رسائل جديدة حتى تلغي الحظر من أيقونة الحظر."
                           : "This customer is blocked from chat. Click the ban icon again to unblock."}
                       </div>
                     )}

                     {showSupportOrders && (
                       <div className="border-b dark:border-slate-800 bg-slate-50/80 px-4 py-3 dark:bg-slate-800/40">
                         <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                           {isRTL ? "طلبات الزبون (تجريبي)" : "Customer orders (demo)"}
                         </p>
                         <div className="overflow-x-auto rounded-xl border dark:border-slate-700">
                           <table className="w-full min-w-[280px] text-sm">
                             <thead className="bg-slate-100 dark:bg-slate-800/80">
                               <tr>
                                 <th className="px-3 py-2 text-start font-semibold">{isRTL ? "رقم الطلب" : "Order"}</th>
                                 <th className="px-3 py-2 text-start font-semibold">{isRTL ? "المبلغ" : "Total"}</th>
                                 <th className="px-3 py-2 text-start font-semibold">{isRTL ? "الحالة" : "Status"}</th>
                                 <th className="px-3 py-2 text-start font-semibold">{isRTL ? "التاريخ" : "Date"}</th>
                               </tr>
                             </thead>
                             <tbody>
                               {mockCustomerOrders.map((o) => (
                                 <tr key={o.id} className="border-t dark:border-slate-700">
                                   <td className="px-3 py-2 font-mono text-xs">{o.id}</td>
                                   <td className="px-3 py-2">{o.total}</td>
                                   <td className="px-3 py-2">{o.status}</td>
                                   <td className="px-3 py-2 text-muted-foreground">{o.date}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </div>
                     )}

                     <div className="flex-1 overflow-y-auto space-y-5 bg-slate-50/50 px-2 py-5 dark:bg-slate-900/50 sm:px-4">
                        <div className="text-center">
                           <span className="inline-block rounded-full bg-slate-200/60 px-4 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground dark:bg-slate-800/60">
                              {isRTL ? "اليوم" : "Today"}
                           </span>
                        </div>

                        {supportMessages.map((m) =>
                          m.role === "user" ? (
                            <div
                              key={m.id}
                              className={cn("flex w-full", isRTL ? "justify-start" : "justify-end")}
                            >
                              <div className="flex max-w-[min(85%,32rem)] flex-col items-start gap-1">
                                <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                                  {m.imageUrl && (
                                    <img src={m.imageUrl} alt="" className="mb-2 max-h-44 w-full rounded-lg object-cover" />
                                  )}
                                  <p className="text-sm leading-relaxed dark:text-slate-200">{m.text}</p>
                                </div>
                                <span className="ps-1 text-[10px] text-muted-foreground">{m.time}</span>
                              </div>
                            </div>
                          ) : (
                            <div
                              key={m.id}
                              className={cn("flex w-full", isRTL ? "justify-end" : "justify-start")}
                            >
                              <div className="flex max-w-[min(85%,32rem)] flex-col items-start gap-1">
                                <div className="rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-4 text-white shadow-lg shadow-cyan-500/20">
                                  {m.imageUrl && (
                                    <img src={m.imageUrl} alt="" className="mb-2 max-h-44 w-full rounded-lg object-cover ring-1 ring-white/30" />
                                  )}
                                  <p className="text-sm leading-relaxed">{m.text}</p>
                                </div>
                                <span className="ps-1 text-[10px] text-muted-foreground">{m.time}</span>
                              </div>
                            </div>
                          ),
                        )}
                     </div>

                     <div className="relative border-t dark:border-slate-800 p-4 sm:p-6">
                        {supportImagePreview && (
                          <div className="mb-3 flex items-center gap-3 rounded-xl border border-dashed border-slate-300 p-2 dark:border-slate-600">
                            <img src={supportImagePreview} alt="" className="h-16 w-16 rounded-lg object-cover" />
                            <div className="min-w-0 flex-1 text-xs text-muted-foreground">
                              {isRTL ? "معاينة المرفق — ستُرسل مع الرد" : "Attachment preview — sends with reply"}
                            </div>
                            <Button type="button" variant="ghost" size="sm" onClick={() => setSupportImagePreview(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        <div className="relative mb-2 flex flex-wrap items-center gap-1 border-b border-slate-100 pb-2 dark:border-slate-800">
                          <input
                            ref={supportAttachmentRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0]
                              if (!f?.type.startsWith("image/")) return
                              const r = new FileReader()
                              r.onload = () => setSupportImagePreview(String(r.result))
                              r.readAsDataURL(f)
                              e.target.value = ""
                            }}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-xl"
                            disabled={activeChatBlocked}
                            aria-label={isRTL ? "إرفاق صورة" : "Attach image"}
                            onClick={() => supportAttachmentRef.current?.click()}
                          >
                            <Paperclip className="h-4 w-4" />
                          </Button>
                          <div className="relative">
                            <Button
                              type="button"
                              variant={showSupportEmoji ? "secondary" : "ghost"}
                              size="icon"
                              className="rounded-xl"
                              disabled={activeChatBlocked}
                              aria-label="Emoji"
                              onClick={() => {
                                setShowSupportEmoji((v) => !v)
                                setShowSupportCanned(false)
                              }}
                            >
                              <Smile className="h-4 w-4" />
                            </Button>
                            <EmojiPopup
                              isOpen={showSupportEmoji}
                              isRTL={isRTL}
                              emojis={SUPPORT_STICKERS}
                              onPick={(emoji) => {
                                setSupportReply((p) => p + emoji)
                                setShowSupportEmoji(false)
                              }}
                            />
                          </div>
                          <div className="relative">
                            <Button
                              type="button"
                              variant={showSupportCanned ? "secondary" : "ghost"}
                              size="icon"
                              className="rounded-xl"
                              disabled={activeChatBlocked}
                              aria-label={isRTL ? "ردود جاهزة" : "Saved replies"}
                              onClick={() => {
                                setShowSupportCanned((v) => !v)
                                setShowSupportEmoji(false)
                              }}
                            >
                              <Bookmark className="h-4 w-4" />
                            </Button>
                            <CannedRepliesPopup
                              isOpen={showSupportCanned}
                              isRTL={isRTL}
                              replies={cannedReplies}
                              onPick={(body) => {
                                setSupportReply((prev) => (prev ? `${prev}\n` : "") + body)
                                setShowSupportCanned(false)
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                           <input
                              type="text"
                              value={supportReply}
                              onChange={(e) => setSupportReply(e.target.value)}
                              disabled={activeChatBlocked}
                              placeholder={activeChatBlocked ? (isRTL ? "محادثة موقوفة" : "Chat blocked") : isRTL ? "اكتب ردك هنا..." : "Type your response..."}
                              className={cn(
                                "min-w-0 flex-1 rounded-2xl border-0 bg-slate-50 py-3 ps-4 pe-4 text-sm focus:ring-2 focus:ring-cyan-500/25 dark:bg-slate-800 dark:text-white",
                                isRTL && "font-cairo text-right",
                                activeChatBlocked && "cursor-not-allowed opacity-60",
                              )}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault()
                                  if (activeChatBlocked) return
                                  const t = supportReply.trim()
                                  if (!t && !supportImagePreview) return
                                  setSupportMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `m-${Date.now()}`,
                                      role: "agent",
                                      text: t || (isRTL ? "مرفق" : "Attachment"),
                                      time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
                                      imageUrl: supportImagePreview || undefined,
                                    },
                                  ])
                                  setSupportReply("")
                                  setSupportImagePreview(null)
                                }
                              }}
                           />
                           <Button
                             type="button"
                             className="shrink-0 rounded-2xl bg-cyan-600 px-6 shadow-lg shadow-cyan-500/20 hover:bg-cyan-700 sm:px-8"
                             disabled={activeChatBlocked || (!supportReply.trim() && !supportImagePreview)}
                             onClick={() => {
                               const t = supportReply.trim()
                               if (!t && !supportImagePreview) return
                               setSupportMessages((prev) => [
                                 ...prev,
                                 {
                                   id: `m-${Date.now()}`,
                                   role: "agent",
                                   text: t || (isRTL ? "مرفق" : "Attachment"),
                                   time: new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
                                   imageUrl: supportImagePreview || undefined,
                                 },
                               ])
                               setSupportReply("")
                               setSupportImagePreview(null)
                             }}
                           >
                              {isRTL ? "إرسال" : "Send"}
                           </Button>
                        </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className={cn("text-2xl font-bold dark:text-white", isRTL && "font-cairo")}>
                      {isRTL ? "الإشعارات" : "Notifications"}
                    </h2>
                    <p className={cn("text-sm text-muted-foreground", isRTL && "font-cairo")}>
                      {isRTL ? "عرض كل الإشعارات في صفحة واحدة بدل النوافذ المنبثقة" : "View all notifications in a dedicated page instead of popups"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))}
                  >
                    {isRTL ? "تعليم الكل كمقروء" : "Mark all as read"}
                  </Button>
                </div>

                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  {notifications.length === 0 ? (
                    <p className={cn("p-6 text-sm text-muted-foreground", isRTL && "font-cairo")}>
                      {isRTL ? "لا توجد إشعارات حالياً" : "No notifications right now"}
                    </p>
                  ) : (
                    notifications.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n)))}
                        className={cn(
                          "w-full border-b px-5 py-4 text-start transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/70",
                          item.unread && "bg-cyan-50/60 dark:bg-cyan-500/10",
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className={cn("text-sm font-semibold dark:text-white", isRTL && "font-cairo")}>{item.title}</p>
                          {item.unread && <span className="h-2 w-2 rounded-full bg-cyan-500" />}
                        </div>
                        <p className={cn("text-xs text-muted-foreground", isRTL && "font-cairo")}>{item.message}</p>
                        <p className={cn("mt-1 text-[10px] text-slate-400", isRTL && "font-cairo")}>{item.time}</p>
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div 
                key="products"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "إدارة المنتجات" : "Products Management"}</h2>
                    <p className="text-muted-foreground">{isRTL ? "أضف وعدل المنتجات والخدمات التي تقدمها" : "Add and edit the products and services you offer"}</p>
                  </div>
                  <Button onClick={() => setEditingProduct({ nameAr: "", nameEn: "", price: 0, category: "", descriptionAr: "", descriptionEn: "" })} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 sm:w-auto transition-transform duration-150 active:scale-95">
                    <Plus className="w-4 h-4" />
                    {isRTL ? "إضافة منتج" : "Add Product"}
                  </Button>
                </div>

                <ProductPopup
                  isOpen={Boolean(editingProduct || (newProduct.nameEn && !editingProduct))}
                  isRTL={isRTL}
                  editingProduct={editingProduct}
                  newProduct={newProduct}
                  setEditingProduct={setEditingProduct}
                  setNewProduct={setNewProduct}
                  onSave={editingProduct?.id ? handleUpdateProduct : handleCreateProduct}
                  onClose={() => {
                    setEditingProduct(null)
                    setNewProduct({ nameAr: "", nameEn: "", price: 0, category: "", descriptionAr: "", descriptionEn: "", imageUrl: "", imageUrls: [], videoUrl: "", iconName: "Box" })
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                   {isProductsLoading ? (
                      [1, 2, 3, 4, 5].map(i => <div key={i} className="h-40 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-2xl" />)
                   ) : (
                      products.filter(p => p.nameAr || p.nameEn).map((product) => (
                         <div key={product.id} className="group bg-white dark:bg-slate-900 rounded-2xl border dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg transition-all relative">
                           <div className="h-32 w-full overflow-hidden">
                             <AdminProductImage src={product.imageUrls?.[0] || product.imageUrl} alt={product.nameEn} />
                           </div>

                             <div className="p-3.5 pb-2.5">
                              <div className="flex justify-between items-start mb-2">
                               <div className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                                  <AdminProductIcon name={product.iconName} className="w-3.5 h-3.5" />
                               </div>
                               <div className="flex gap-0.5">
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-cyan-500" onClick={() => setEditingProduct(product)}>
                                     <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => handleDeleteProduct(product.id)}>
                                     <Trash2 className="w-3 h-3" />
                                  </Button>
                               </div>
                              </div>
                              <div className="space-y-0.5">
                               <h4 className="font-bold text-sm dark:text-white uppercase truncate">{isRTL ? product.nameAr : product.nameEn}</h4>
                               <div className="flex items-center justify-between">
                                  <p className="text-xs text-cyan-600 font-bold">${product.price}</p>
                                  <span className="text-[8px] uppercase font-bold text-slate-500 tracking-tighter bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md truncate">{product.category}</span>
                               </div>
                               {product.videoUrl && (
                                  <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-medium mt-1">
                                     <Monitor className="w-2.5 h-2.5" />
                                     {isRTL ? "فيديو متاح" : "Video"}
                                  </div>
                               )}
                               {Array.isArray(product.imageUrls) && product.imageUrls.length > 1 && (
                                  <div className="flex items-center gap-1 text-[9px] text-cyan-500 font-medium mt-1">
                                     +{product.imageUrls.length - 1} {isRTL ? "صور" : "images"}
                                  </div>
                               )}
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 leading-tight">
                               {isRTL ? product.descriptionAr : product.descriptionEn}
                              </p>
                            </div>
                         </div>
                      ))
                   )}
                   {products.length === 0 && !isProductsLoading && (
                      <div className="col-span-full py-20 text-center bg-slate-50 dark:bg-slate-800/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                         <Box className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                         <p className="text-slate-500">{isRTL ? "لا توجد منتجات حالياً" : "No products found"}</p>
                      </div>
                   )}
                </div>
              </motion.div>
            )}

            {activeTab === "requests" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "طلبات الأنظمة" : "System Requests"}</h2>
                    <p className="text-muted-foreground">{isRTL ? "إدارة طلبات شراء الأنظمة والعروض التوضيحية" : "Manage system purchase and demo requests"}</p>
                  </div>
                  <Button variant="outline" onClick={fetchRequests} className="gap-2">
                    <RotateCcw className={cn("w-4 h-4", isRequestsLoading && "animate-spin")} />
                    {isRTL ? "تحديث" : "Refresh"}
                  </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-right" dir={isRTL ? "rtl" : "ltr"}>
                      <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isRTL ? "العميل" : "Customer"}</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isRTL ? "النظام المطلوب" : "System"}</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isRTL ? "التاريخ" : "Date"}</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isRTL ? "الحالة" : "Status"}</th>
                          <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{isRTL ? "إجراءات" : "Actions"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-800">
                        {requests.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                              {isRTL ? "لا يوجد طلبات حالياً" : "No requests found"}
                            </td>
                          </tr>
                        ) : (
                          requests.map((req) => (
                            <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="font-bold dark:text-white">{req.customerName}</div>
                                <div className="text-sm text-slate-500">{req.customerPhone}</div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 text-xs font-bold">
                                  <Monitor className="w-3 h-3" />
                                  {req.productTitle}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {new Date(req.createdAt).toLocaleDateString(isRTL ? "ar" : "en")}
                              </td>
                              <td className="px-6 py-4">
                                <select 
                                  value={req.status}
                                  onChange={(e) => handleUpdateRequestStatus(req.id, e.target.value)}
                                  className={cn(
                                    "text-xs font-bold px-3 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-cyan-500 outline-none cursor-pointer",
                                    req.status === "pending" && "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
                                    req.status === "contacted" && "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
                                    req.status === "completed" && "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
                                    req.status === "cancelled" && "bg-red-100 text-red-600 dark:bg-red-900/30"
                                  )}
                                >
                                  <option value="pending">{isRTL ? "قيد الانتظار" : "Pending"}</option>
                                  <option value="contacted">{isRTL ? "تم التواصل" : "Contacted"}</option>
                                  <option value="completed">{isRTL ? "مكتمل" : "Completed"}</option>
                                  <option value="cancelled">{isRTL ? "ملغي" : "Cancelled"}</option>
                                </select>
                              </td>
                              <td className="px-6 py-4">
                                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteRequest(req.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl"
              >
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-3xl font-bold dark:text-white">{isRTL ? "إعدادات التواصل" : "Contact Settings"}</h2>
                    <p className="text-muted-foreground">{isRTL ? "تعديل رقم الاتصال وروابط المنصات بشكل مباشر" : "Manage phone, WhatsApp, email, website, and social links"}</p>
                  </div>
                  <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 bg-cyan-600 hover:bg-cyan-700 sm:w-auto transition-transform duration-150 active:scale-95">
                    <Save className={cn("h-4 w-4", isSaving && "animate-spin")} />
                    {isSaving ? (isRTL ? "جاري الحفظ..." : "Saving...") : (isRTL ? "حفظ الإعدادات" : "Save Settings")}
                  </Button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 p-6 sm:p-8 space-y-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "رقم الاتصال (ظاهر)" : "Phone (displayed)"}</label>
                      <input
                        type="text"
                        value={localConfig.contact.phone}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, phone: e.target.value } })}
                        className={cn("w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white", isRTL && "text-right font-cairo")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "رقم واتساب (دولي)" : "WhatsApp number (international)"}</label>
                      <input
                        type="text"
                        value={localConfig.contact.whatsapp}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, whatsapp: e.target.value } })}
                        placeholder="9647XXXXXXXX"
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "البريد الإلكتروني" : "Email"}</label>
                      <input
                        type="email"
                        value={localConfig.contact.email}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, email: e.target.value } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "رابط صفحة الموقع" : "Website page URL"}</label>
                      <input
                        type="text"
                        value={localConfig.contact.websiteUrl}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, websiteUrl: e.target.value } })}
                        placeholder="/location"
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (عربي)" : "Address (Arabic)"}</label>
                      <input
                        type="text"
                        value={localConfig.contact.addressAr}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, addressAr: e.target.value } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white font-cairo"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "العنوان (إنجليزي)" : "Address (English)"}</label>
                      <input
                        type="text"
                        value={localConfig.contact.addressEn}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, addressEn: e.target.value } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Facebook</label>
                      <input
                        type="url"
                        value={localConfig.contact.socials.facebook}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, facebook: e.target.value } } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Twitter / X</label>
                      <input
                        type="url"
                        value={localConfig.contact.socials.twitter}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, twitter: e.target.value } } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Instagram</label>
                      <input
                        type="url"
                        value={localConfig.contact.socials.instagram}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, instagram: e.target.value } } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">LinkedIn</label>
                      <input
                        type="url"
                        value={localConfig.contact.socials.linkedin}
                        onChange={(e) => setLocalConfig({ ...localConfig, contact: { ...localConfig.contact, socials: { ...localConfig.contact.socials, linkedin: e.target.value } } })}
                        className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  <div className="space-y-4">
                     <h3 className="text-xl font-bold dark:text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-cyan-600" />
                        {isRTL ? "إعدادات بوت التليكرام" : "Telegram Bot Settings"}
                     </h3>
                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                       <div className="space-y-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "تفعيل الإشعارات" : "Enable Notifications"}</label>
                         <div className="mt-1">
                           <AdminToggle
                             checked={localConfig.integrations?.telegram?.enabled || false}
                             onCheckedChange={() =>
                               setLocalConfig({
                                 ...localConfig,
                                 integrations: {
                                   ...localConfig.integrations,
                                   telegram: {
                                     botToken: localConfig.integrations?.telegram?.botToken || "",
                                     chatId: localConfig.integrations?.telegram?.chatId || "",
                                     enabled: !(localConfig.integrations?.telegram?.enabled || false),
                                   },
                                 },
                               })
                             }
                             activeClassName="bg-cyan-600"
                           />
                         </div>
                       </div>
                       <div className="space-y-2 sm:col-span-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "التوكن الخاص بالبوت (Bot Token)" : "Bot Token"}</label>
                         <input
                           type="text"
                           value={localConfig.integrations?.telegram?.botToken || ""}
                           onChange={(e) => setLocalConfig({ ...localConfig, integrations: { ...localConfig.integrations, telegram: { botToken: e.target.value, chatId: localConfig.integrations?.telegram?.chatId || "", enabled: localConfig.integrations?.telegram?.enabled || false } } })}
                           className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                         />
                       </div>
                       <div className="space-y-2 sm:col-span-2">
                         <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{isRTL ? "معرف الدردشة (Chat ID)" : "Chat ID"}</label>
                         <input
                           type="text"
                           value={localConfig.integrations?.telegram?.chatId || ""}
                           onChange={(e) => setLocalConfig({ ...localConfig, integrations: { ...localConfig.integrations, telegram: { botToken: localConfig.integrations?.telegram?.botToken || "", chatId: e.target.value, enabled: localConfig.integrations?.telegram?.enabled || false } } })}
                           className="w-full rounded-xl border bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                         />
                       </div>
                     </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

interface NavItemProps {
  icon: any
  label: string
  isActive?: boolean
  onClick: () => void
  isOpen: boolean
  badge?: string
}

function NavItem({ icon: Icon, label, isActive, onClick, isOpen, badge }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center transition-all duration-200 rounded-xl",
        isOpen ? "px-4 py-3 gap-3" : "p-3 justify-center",
        isActive 
          ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20" 
          : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0", isActive && "animate-pulse")} />
      {isOpen && (
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="font-medium truncate">{label}</span>
          {badge && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              isActive ? "bg-white/20 text-white" : "bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
            )}>
              {badge}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
