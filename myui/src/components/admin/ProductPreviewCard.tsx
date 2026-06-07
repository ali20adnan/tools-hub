import React from "react"
import { cn } from "../../lib/utils"
import { Monitor, ImageOff } from "lucide-react"

interface ProductPreviewCardProps {
  draft: any
  isRTL: boolean
  icons: Record<string, any>
}

export function ProductPreviewCard({ draft, isRTL, icons }: ProductPreviewCardProps) {
  const IconComponent = icons[draft.iconName] || icons[draft.icon] || Monitor
  
  const title = isRTL ? (draft.nameAr || draft.nameEn || "عنوان المنتج") : (draft.nameEn || draft.nameAr || "Product Title")
  const description = isRTL ? (draft.descriptionAr || draft.descriptionEn || "وصف المنتج يظهر هنا...") : (draft.descriptionEn || draft.descriptionAr || "Product description appears here...")
  const categoryLabel = draft.category || (isRTL ? "تصنيف" : "Category")
  const price = (draft.price || 0).toLocaleString()

  return (
    <div className="w-[280px] mx-auto sticky top-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">
        {isRTL ? "معاينة مباشرة" : "Live Preview"}
      </p>
      
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 transition-all duration-300 flex flex-col h-full">
        {/* Media */}
        <div className="p-4 pb-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/90 dark:bg-slate-800 dark:ring-slate-700/90">
            <div className={cn(
              "absolute start-3 top-3 z-10 flex max-w-[min(100%-1.5rem,200px)] items-center gap-2 rounded-full border border-white/20 bg-slate-950/80 py-1.5 ps-1.5 pe-2.5 shadow-lg backdrop-blur-md dark:bg-black/70",
              isRTL && "font-cairo"
            )}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500">
                <IconComponent className="h-4 w-4 text-white" />
              </div>
              <span className="truncate text-[11px] font-semibold text-white sm:text-xs uppercase">
                {categoryLabel}
              </span>
            </div>
            
            {draft.imageUrl ? (
              <img src={draft.imageUrl} alt="preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                <ImageOff className="h-10 w-10 text-slate-400" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className={cn(
            "text-base font-bold text-foreground mb-2",
            isRTL && "font-cairo"
          )}>
            {title}
          </h3>
          <p className={cn(
            "text-xs text-muted-foreground mb-4 line-clamp-3 flex-1",
            isRTL && "font-cairo leading-relaxed"
          )}>
            {description}
          </p>

          {/* Price */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className={cn("text-[10px] text-muted-foreground uppercase font-bold", isRTL && "font-cairo")}>
              {isRTL ? "السعر" : "Price"}
            </span>
            <span className={cn("text-sm font-bold text-cyan-600 dark:text-cyan-400", isRTL && "font-cairo")}>
              {price} {isRTL ? "د.ع" : "IQD"}
            </span>
          </div>
        </div>

        {/* Color Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-400 to-cyan-400" />
      </div>
    </div>
  )
}
