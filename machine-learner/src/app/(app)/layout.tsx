import { Suspense } from "react";
import { AppNav, AppNavFallback } from "@/components/layout/app-nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-1">
      <Suspense fallback={<AppNavFallback />}>
        <AppNav />
      </Suspense>
      <main className="flex-1 pb-20 md:pb-0 md:pl-60">
        <div className="mx-auto w-full max-w-6xl p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
