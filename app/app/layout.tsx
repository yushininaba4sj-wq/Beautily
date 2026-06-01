import { AppShell } from "@/components/AppShell";
import { ProfileProvider } from "@/components/ProfileProvider";

export const metadata = {
  title: "Beautily App — AI美容プロデューサー",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProfileProvider>
      <AppShell>{children}</AppShell>
    </ProfileProvider>
  );
}
