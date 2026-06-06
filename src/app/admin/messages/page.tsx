import { redirect } from "next/navigation";

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ userId?: string }>;
}) {
  const params = await searchParams;
  redirect(params.userId ? `/admin?userId=${params.userId}` : "/admin");
}
