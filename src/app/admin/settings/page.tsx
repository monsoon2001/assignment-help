import { requireAdmin } from "@/lib/admin";
import { getCompensationSettings } from "./actions";
import SettingsForm from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const compensation = await getCompensationSettings();
  return <SettingsForm compensation={compensation} />;
}
