import { getBookings } from "./actions";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const currentPage = parseInt(resolvedParams.page || "1", 10);
  const limit = 10;

  const data = await getBookings(currentPage, limit);

  return (
    <DashboardClient
      initialBookings={data.bookings || []}
      totalCount={data.totalCount || 0}
      currentPage={currentPage}
      limit={limit}
      initialError={data.error}
    />
  );
}
