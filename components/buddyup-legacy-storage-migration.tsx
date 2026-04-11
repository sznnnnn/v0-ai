"use client";

import { migrateLegacyEdumatchToBuddyupOnce } from "@/lib/buddyup-local-storage";
import { useLayoutEffect } from "react";

export function BuddyupLegacyStorageMigration() {
  useLayoutEffect(() => {
    migrateLegacyEdumatchToBuddyupOnce();
  }, []);
  return null;
}
