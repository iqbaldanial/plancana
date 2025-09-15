import { auth } from "@/app/api/auth/auth";
import { redirect } from "next/navigation";

export default async function MapLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return <>{children}</>; // Render map page if authenticated
}