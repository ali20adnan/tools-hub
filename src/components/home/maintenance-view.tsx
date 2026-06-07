"use client"

import { Wrench } from "lucide-react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function MaintenanceView() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Wrench className="h-6 w-6 text-amber-600 dark:text-amber-400" />
          </div>
          <CardTitle>المنصة قيد الصيانة</CardTitle>
          <CardDescription>
            نعمل على تحسين الخدمة. يرجى المحاولة لاحقاً أو التواصل مع المسؤول.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
