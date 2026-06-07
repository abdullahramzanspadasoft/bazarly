export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col min-h-full flex-1">{children}</div>;
}
