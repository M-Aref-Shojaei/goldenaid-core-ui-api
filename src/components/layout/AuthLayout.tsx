import { type ReactNode } from "react";

/** Props for the {@link AuthLayout} component. */
interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

/** Centered auth card layout with optional title and subtitle. */
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-sm">
        {title && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gold">گلدن اید</h1>
            {subtitle && <p className="text-neutral-400 text-sm mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="bg-neutral-0 rounded-2xl border border-neutral-75 shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
