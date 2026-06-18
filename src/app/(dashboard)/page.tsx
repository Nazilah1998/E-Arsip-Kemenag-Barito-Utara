import { PageBanner } from "@/components/ui/PageBanner"
import { LayoutDashboard, FileText, HardDrive, Clock } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageBanner
        title="Dashboard Statistik"
        description="Ringkasan penggunaan sistem E-Arsip Kementerian Agama Kabupaten Barito Utara"
        icon={<LayoutDashboard className="h-6 w-6 text-white" />}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Dokumen</p>
              <h3 className="text-2xl font-bold">1,248</h3>
            </div>
          </div>
        </div>
        
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
              <HardDrive className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Storage</p>
              <h3 className="text-2xl font-bold">4.2 GB</h3>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Baru Diunggah</p>
              <h3 className="text-2xl font-bold">24</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Uploads Table Placeholder */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h3 className="font-semibold">Dokumen Terbaru</h3>
        </div>
        <div className="p-6">
          <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
            <p className="text-sm text-muted-foreground">Tabel dokumen terbaru akan ditampilkan di sini</p>
          </div>
        </div>
      </div>
    </div>
  )
}
