"use client";

import ProtectedRoute from "@/app/components/ProtectedRoute";

export default function RoomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
