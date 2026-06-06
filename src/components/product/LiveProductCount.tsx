"use client";

import { useLiveProductCount } from "@/hooks/useLiveProducts";

interface LiveProductCountProps {
  initialTotal: number;
  query?: Record<string, string>;
  suffix?: string;
}

export default function LiveProductCount({
  initialTotal,
  query = {},
  suffix = "found",
}: LiveProductCountProps) {
  const total = useLiveProductCount({ initialTotal, query });

  return (
    <>
      {total} product{total !== 1 ? "s" : ""} {suffix}
    </>
  );
}
