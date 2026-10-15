"use client";

import { useActionState, useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Save, Lock, Globe } from "lucide-react";
import {
  updateFxSettings,
  type FxResult,
  type FxSettings,
} from "./actions";

const initialState: FxResult = { ok: false, message: "" };

export default function SettingsForm({ fx }: { fx: FxSettings }) {
  const [platformName, setPlatformName] = useState("Acadivo");
  const [supportEmail, setSupportEmail] = useState("support@acadivo.com");
  const [autoMatch, setAutoMatch] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [state, formAction, pending] = useActionState(
    updateFxSettings,
    initialState
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Platform Settings</h1>
          <p className="text-on-surface-variant mt-1">Configure platform-wide settings and preferences.</p>
        </div>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Platform Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          <Input label="Support Email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} type="email" />
        </div>
      </Card>

      {/* Private FX buffer — admin-only, never shown to students. */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Lock size={16} className="text-primary" />
          <h2 className="font-display text-lg font-semibold text-on-surface">FX &amp; Processing</h2>
        </div>
        <p className="text-sm text-on-surface-variant">
          Private to admins. This buffer is baked into the local price a student sees outside
          Canada; it is never itemised. Helpers are paid manually — there is no commission.
        </p>
        <form action={formAction} className="space-y-4">
          <div className="max-w-xs">
            <Input
              label="International processing / FX buffer (%)"
              name="surchargePercent"
              type="number"
              min="0"
              max="100"
              step="0.01"
              defaultValue={String(fx.surchargePercent)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button disabled={pending}><Save size={16} />{pending ? "Saving…" : "Save FX Settings"}</Button>
            {state.message && (
              <span className={`text-sm ${state.ok ? "text-success" : "text-error"}`}>
                {state.message}
              </span>
            )}
          </div>
        </form>
        <p className="flex items-start gap-2 text-xs text-on-surface-variant">
          <Globe size={13} className="shrink-0 mt-0.5 text-primary" />
          Students in Canada are charged a flat 3.9% processing fee. Everyone else pays this
          international buffer (default 5.9%) on top of the converted total, shown only as one
          local amount.
        </p>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">Matching &amp; Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Auto-Match Requests</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Automatically suggest helpers for new student requests based on subject expertise.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoMatch} onChange={(e) => setAutoMatch(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Maintenance Mode</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Temporarily disable the platform for non-admin users. Useful for deployments.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-error transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-error/40 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>
        </div>
      </Card>
    </div>
  );
}
