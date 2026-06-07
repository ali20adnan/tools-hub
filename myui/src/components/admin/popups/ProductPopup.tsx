import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"
import { Button } from "../../ui/button"
import { 
  Monitor, 
  Pill, 
  ShoppingCart, 
  Landmark, 
  Stethoscope, 
  Factory, 
  GraduationCap,
  Box,
  Smartphone,
  TrendingUp,
  Settings,
  ChevronDown,
  Eye,
  EyeOff,
  Trash2,
  Star,
  Check
} from "lucide-react"
import { ProductPreviewCard } from "../ProductPreviewCard"

const AVAILABLE_ICONS = [
  { name: "Monitor", icon: Monitor },
  { name: "Pill", icon: Pill },
  { name: "ShoppingCart", icon: ShoppingCart },
  { name: "Landmark", icon: Landmark },
  { name: "Stethoscope", icon: Stethoscope },
  { name: "Factory", icon: Factory },
  { name: "GraduationCap", icon: GraduationCap },
  { name: "Smartphone", icon: Smartphone },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Settings", icon: Settings },
  { name: "Box", icon: Box },
]

interface ProductPopupProps {
  isOpen: boolean
  isRTL: boolean
  editingProduct: any
  newProduct: any
  setEditingProduct: (value: any) => void
  setNewProduct: (value: any) => void
  onSave: (draft: any) => void
  onClose: () => void
}

export function ProductPopup({
  isOpen,
  isRTL,
  editingProduct,
  newProduct,
  setEditingProduct,
  setNewProduct,
  onSave,
  onClose,
}: ProductPopupProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingVideo, setIsUploadingVideo] = useState(false)
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  const handleSave = () => {
    const draft = editingProduct || newProduct
    if (!draft.nameAr?.trim() && !draft.nameEn?.trim()) {
      alert(isRTL ? "يرجى إدخال اسم المنتج" : "Please enter product name")
      return
    }
    onSave(draft)
  }

  const currentDraft = editingProduct ?? newProduct
  const currentImages: string[] =
    Array.isArray(currentDraft.imageUrls) && currentDraft.imageUrls.length > 0
      ? currentDraft.imageUrls
      : currentDraft.imageUrl
        ? [currentDraft.imageUrl]
        : []

  const updateDraft = (key: any, value?: any) => {
    if (editingProduct) {
      setEditingProduct((prev: any) => {
        const updates = typeof key === "function" ? key(prev) : (typeof key === "string" ? { [key]: value } : key)
        return { ...prev, ...updates }
      })
      return
    }
    setNewProduct((prev: any) => {
      const updates = typeof key === "function" ? key(prev) : (typeof key === "string" ? { [key]: value } : key)
      return { ...prev, ...updates }
    })
  }

  const uploadFile = async (file: File, kind: "image" | "video") => {
    const setLoading = kind === "image" ? setIsUploadingImage : setIsUploadingVideo
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/products/upload", {
        method: "POST",
        body: formData,
      })
      if (!res.ok) {
        throw new Error("Upload failed")
      }
      const data = await res.json()
      if (kind === "image") {
        updateDraft((prev: any) => {
          const oldImages = Array.isArray(prev.imageUrls) ? prev.imageUrls : (prev.imageUrl ? [prev.imageUrl] : [])
          const nextImages = [...oldImages, data.url]
          return {
            imageUrls: nextImages,
            imageUrl: prev.imageUrl || data.url
          }
        })
      } else {
        updateDraft("videoUrl", data.url)
      }
    } finally {
      setLoading(false)
    }
  }

  const removeImage = (index: number) => {
    updateDraft((prev: any) => {
      const oldImages = Array.isArray(prev.imageUrls) ? prev.imageUrls : (prev.imageUrl ? [prev.imageUrl] : [])
      const nextImages = oldImages.filter((_: string, i: number) => i !== index)
      const wasMain = oldImages[index] === prev.imageUrl
      return {
        imageUrls: nextImages,
        imageUrl: wasMain ? (nextImages[0] || "") : prev.imageUrl
      }
    })
  }

  const setMainImage = (url: string) => {
    updateDraft("imageUrl", url)
  }

  const removeVideo = () => {
    updateDraft("videoUrl", "")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 lg:p-8 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-slate-800"
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Form Side */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold dark:text-white">
                    {editingProduct?.id ? (isRTL ? "تعديل المنتج" : "Edit Product") : (isRTL ? "إضافة منتج جديد" : "Add New Product")}
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="lg:hidden text-cyan-600 flex items-center gap-2"
                    onClick={() => setShowMobilePreview(!showMobilePreview)}
                  >
                    {showMobilePreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isRTL ? (showMobilePreview ? "إخفاء المعاينة" : "عرض المعاينة") : (showMobilePreview ? "Hide Preview" : "Show Preview")}
                  </Button>
                </div>

                {showMobilePreview && (
                  <div className="lg:hidden mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <ProductPreviewCard 
                      draft={currentDraft} 
                      isRTL={isRTL} 
                      icons={{
                        Monitor, Pill, ShoppingCart, Landmark, Stethoscope, Factory, GraduationCap, Box, Smartphone, TrendingUp, Settings
                      }} 
                    />
                  </div>
                )}
                
                <div className="space-y-8">
                  {/* General Info Section */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        {isRTL ? "المعلومات الأساسية" : "General Information"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Name (EN)</label>
                        <input
                          type="text"
                          value={editingProduct ? (editingProduct.nameEn || "") : (newProduct.nameEn || "")}
                          onChange={(e) => updateDraft("nameEn", e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Name (AR)</label>
                        <input
                          type="text"
                          dir="rtl"
                          value={editingProduct ? (editingProduct.nameAr || "") : (newProduct.nameAr || "")}
                          onChange={(e) => updateDraft("nameAr", e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white font-cairo focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "السعر (د.ع)" : "Price (IQD)"}</label>
                        <input
                          type="number"
                          value={editingProduct ? (editingProduct.price || 0) : (newProduct.price || 0)}
                          onChange={(e) => updateDraft("price", Number(e.target.value))}
                          className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                        <input
                          type="text"
                          value={editingProduct ? (editingProduct.category || "") : (newProduct.category || "")}
                          onChange={(e) => updateDraft("category", e.target.value)}
                          className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Appearance Section */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        {isRTL ? "المظهر والأيقونة" : "Appearance & Icon"}
                      </h4>
                    </div>
                    <div className="space-y-4">
                      <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "اختر الأيقونة" : "Select Icon"}</label>
                      <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                        {AVAILABLE_ICONS.map((item) => {
                          const Icon = item.icon
                          const isSelected = currentDraft.iconName === item.name
                          return (
                            <button
                              key={item.name}
                              type="button"
                              onClick={() => updateDraft("iconName", item.name)}
                              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                                isSelected 
                                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-110" 
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                              }`}
                              title={item.name}
                            >
                              <Icon className="w-5 h-5" />
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Media Management Section */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        {isRTL ? "الوسائط (صور وفيديو)" : "Media Management"}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                      {/* Images Sub-section */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "صور المنتج" : "Product Images"}</label>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={editingProduct ? (editingProduct.imageUrl || "") : (newProduct.imageUrl || "")}
                            onChange={(e) => {
                              const nextUrl = e.target.value
                              updateDraft("imageUrl", nextUrl)
                              updateDraft("imageUrls", nextUrl ? [nextUrl] : [])
                            }}
                            className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white text-sm outline-none"
                          />
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                              {isRTL ? "رفع صورة" : "Upload Image"}
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                disabled={isUploadingImage}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  void uploadFile(file, "image")
                                  e.target.value = ""
                                }}
                              />
                            </label>
                            {isUploadingImage && <span className="text-[10px] text-cyan-600 animate-pulse">{isRTL ? "جاري الرفع..." : "Uploading..."}</span>}
                          </div>
                        </div>

                        {currentImages.length > 0 && (
                          <div className="grid grid-cols-2 gap-3 mt-4">
                            {currentImages.map((url: string, index: number) => {
                              const isMain = url === currentDraft.imageUrl
                              return (
                                <div key={`${url}-${index}`} className={`group relative aspect-square overflow-hidden rounded-2xl border-2 transition-all ${
                                  isMain ? "border-cyan-500 shadow-lg shadow-cyan-500/20" : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                                } bg-slate-100 dark:bg-slate-800`}>
                                  <img src={url} alt={`product-${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                  
                                  {/* Actions Overlay */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setMainImage(url)}
                                      className={`p-2 rounded-full transition-all ${
                                        isMain ? "bg-cyan-500 text-white" : "bg-white/20 hover:bg-white/40 text-white"
                                      }`}
                                      title={isRTL ? "تعيين كرئيسية" : "Set as Main"}
                                    >
                                      {isMain ? <Check className="w-4 h-4" /> : <Star className="w-4 h-4" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="p-2 rounded-full bg-red-500/80 hover:bg-red-500 text-white transition-all"
                                      title={isRTL ? "حذف" : "Remove"}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {isMain && (
                                    <div className="absolute top-2 start-2 px-2 py-0.5 bg-cyan-500 text-white text-[9px] font-bold rounded-full uppercase tracking-tighter">
                                      {isRTL ? "الرئيسية" : "Main"}
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Video Sub-section */}
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-slate-500 uppercase">{isRTL ? "فيديو المنتج" : "Product Video"}</label>
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="YouTube link..."
                            value={editingProduct ? (editingProduct.videoUrl || "") : (newProduct.videoUrl || "")}
                            onChange={(e) => updateDraft("videoUrl", e.target.value)}
                            className="w-full p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white text-sm outline-none"
                          />
                          <div className="flex items-center gap-3">
                            <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                              {isRTL ? "رفع فيديو" : "Upload Video"}
                              <input
                                type="file"
                                accept="video/*"
                                className="hidden"
                                disabled={isUploadingVideo}
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (!file) return
                                  void uploadFile(file, "video")
                                  e.target.value = ""
                                }}
                              />
                            </label>
                            {isUploadingVideo && <span className="text-[10px] text-cyan-600 animate-pulse">{isRTL ? "جاري الرفع..." : "Uploading..."}</span>}
                          </div>
                        </div>

                        {currentDraft.videoUrl && (
                          <div className="group relative aspect-video overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-black mt-4 max-w-[240px]">
                            <video 
                              src={currentDraft.videoUrl} 
                              className="h-full w-full object-cover"
                              muted
                            />
                            <button
                              type="button"
                              onClick={removeVideo}
                              className="absolute right-2 top-2 rounded-lg bg-red-500/90 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Descriptions Section */}
                  <div className="bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/50 space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-6 bg-cyan-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                        {isRTL ? "الوصف التفصيلي" : "Detailed Descriptions"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Description (EN)</label>
                        <textarea
                          value={editingProduct ? (editingProduct.descriptionEn || "") : (newProduct.descriptionEn || "")}
                          onChange={(e) => updateDraft("descriptionEn", e.target.value)}
                          className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white h-28 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none resize-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Description (AR)</label>
                        <textarea
                          dir="rtl"
                          value={editingProduct ? (editingProduct.descriptionAr || "") : (newProduct.descriptionAr || "")}
                          onChange={(e) => updateDraft("descriptionAr", e.target.value)}
                          className="w-full p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 dark:text-white font-cairo h-28 focus:ring-2 focus:ring-cyan-500/20 transition-all outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Button className="flex-1 bg-cyan-600 transition-transform duration-150 active:scale-95" onClick={handleSave}>
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-slate-200 text-slate-700 transition-transform duration-150 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
                onClick={onClose}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>

          {/* Preview Side */}
          <div className="hidden lg:block lg:w-[320px] shrink-0 border-l dark:border-slate-800 ps-8">
            <ProductPreviewCard 
              draft={currentDraft} 
              isRTL={isRTL} 
              icons={{
                Monitor, Pill, ShoppingCart, Landmark, Stethoscope, Factory, GraduationCap, Box, Smartphone, TrendingUp, Settings
              }} 
            />
          </div>
        </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
