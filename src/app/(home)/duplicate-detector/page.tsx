"use client"

import { ScanSearch } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExcelTab } from "@/components/features/duplicate-detector/excel-tab"
import { TextTab } from "@/components/features/duplicate-detector/text-tab"
import { MyuiPanel } from "@/components/myui/myui-panel"
import { myui } from "@/components/myui/myui-styles"

export default function DuplicateDetectorPage() {
  return (
    <div className={myui.main}>
      <MyuiPanel title="كشف التكرار" icon={ScanSearch}>
        <Tabs defaultValue="excel" dir="rtl">
          <TabsList className={myui.tabsList}>
            <TabsTrigger value="excel" className={myui.tabTrigger}>
              ملف Excel
            </TabsTrigger>
            <TabsTrigger value="text" className={myui.tabTrigger}>
              نص مباشر
            </TabsTrigger>
          </TabsList>
          <TabsContent value="excel" forceMount className="mt-4 focus-visible:outline-none data-[state=inactive]:hidden">
            <ExcelTab />
          </TabsContent>
          <TabsContent value="text" forceMount className="mt-4 focus-visible:outline-none data-[state=inactive]:hidden">
            <TextTab />
          </TabsContent>
        </Tabs>
      </MyuiPanel>
    </div>
  )
}
