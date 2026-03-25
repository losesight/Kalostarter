import { Sidebar } from "@/components/sidebar";
import { TopBar } from "@/components/top-bar";
import { BackgroundEffects } from "@/components/background-effects";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <BackgroundEffects />
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </>
  );
}
