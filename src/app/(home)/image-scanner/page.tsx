"use client"

import { ScanLine, ScanSearch } from "lucide-react"
import { myui } from "@/components/myui/myui-styles"
import { MyuiPanel } from "@/components/myui/myui-panel"
import {
  ImageScannerProvider,
  ImageScannerControls,
  ImageScannerPreview,
} from "@/components/features/image-scanner/ImageScannerApp"

export default function ImageScannerPage() {
  return (
    <div className={myui.main}>
      <ImageScannerProvider>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,340px)_1fr] gap-4 sm:gap-5 items-start">
          <MyuiPanel title="ماسح ضوئي" icon={ScanLine} bodyClassName="p-3 sm:p-5">
            <p className="text-sm text-muted-foreground mb-4">
              ارفع صورة أو امسح عبر ماسح ضوئي على Windows.
            </p>
            <ImageScannerControls />
          </MyuiPanel>

          <MyuiPanel title="معاينة الصورة" icon={ScanSearch} bodyClassName="p-3 sm:p-5">
            <p className="text-sm text-muted-foreground mb-4">
              التعديلات فورية حتى تضغط «حفظ الصورة»
            </p>
            <ImageScannerPreview />
          </MyuiPanel>
        </div>
      </ImageScannerProvider>
    </div>
  )
}
