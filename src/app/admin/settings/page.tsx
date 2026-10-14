import { requireAdmin } from "@/lib/admin";
import { getFxSettings } from "./actions";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const fx = await getFxSettings();
  return <SettingsForm fx={fx} />;
}
