import { HomeChrome } from "@/components/layouts/home-chrome"
import { MaintenanceGate } from "@/components/home/maintenance-gate"
import { ToolAccessGate } from "@/components/home/tool-access-gate"
import { ToolsAvailabilityProvider } from "@/context/tools-availability-context"

export default function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToolsAvailabilityProvider>
      <HomeChrome>
        <MaintenanceGate>
          <ToolAccessGate>{children}</ToolAccessGate>
        </MaintenanceGate>
      </HomeChrome>
    </ToolsAvailabilityProvider>
  )
}
