import { type ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  fullWidth?: boolean;
}

export function AppLayout({ children, header, footer, fullWidth = false }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {header}
      <main className={`flex-1 py-8 ${fullWidth ? "" : "max-w-7xl w-full mx-auto px-4"}`}>
        {children}
      </main>
      {footer}
    </div>
  );
}
