import { GuestLayout } from "@/components/layout/guest-layout"

export default function Layout({ children }: { children: React.ReactNode }) {
  return <GuestLayout>{children}</GuestLayout>
}
