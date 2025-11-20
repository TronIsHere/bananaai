import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white" dir="rtl">
      <DashboardSidebar />
      <div className="mr-0 flex-1 md:mr-64">
        <DashboardHeader />
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

