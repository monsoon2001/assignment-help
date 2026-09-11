"use client";

import { useState } from "react";
import Card from "@/components/ui/card";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { Save } from "lucide-react";

export default function AdminSettings() {
  const [platformName, setPlatformName] = useState("PeerCraft");
  const [supportEmail, setSupportEmail] = useState("support@peercraft.com");
  const [minRate, setMinRate] = useState("15");
  const [maxRate, setMaxRate] = useState("80");
  const [platformFee, setPlatformFee] = useState("12");
  const [autoMatch, setAutoMatch] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-on-surface">Platform Settings</h1>
          <p className="text-on-surface-variant mt-1">Configure platform-wide settings and preferences.</p>
        </div>
        <Button><Save size={16} />Save Changes</Button>
      </div>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Platform Name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} />
          <Input label="Support Email" value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} type="email" />
        </div>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">Pricing & Fees</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Min Hourly Rate ($)" value={minRate} onChange={(e) => setMinRate(e.target.value)} type="number" />
          <Input label="Max Hourly Rate ($)" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} type="number" />
          <Input label="Platform Fee (%)" value={platformFee} onChange={(e) => setPlatformFee(e.target.value)} type="number" />
        </div>
        <p className="text-sm text-on-surface-variant">
          Platform fee is deducted from each completed order. Helpers receive (100 - fee)% of the order amount.
        </p>
      </Card>

      <Card className="p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">Matching & Notifications</h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Auto-Match Requests</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Automatically suggest helpers for new student requests based on subject expertise.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={autoMatch} onChange={(e) => setAutoMatch(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Email Notifications</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Send email notifications for new orders, messages, and platform updates.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-primary-container transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
            <div>
              <p className="text-sm font-medium text-on-surface">Maintenance Mode</p>
              <p className="text-xs text-on-surface-variant mt-0.5">Temporarily disable the platform for non-admin users. Useful for deployments.</p>
            </div>
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant rounded-full peer peer-checked:bg-error transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
            </div>
          </label>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">Platform Limits</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Max Active Orders per Helper" defaultValue="10" type="number" />
          <Input label="Max Requests per Student" defaultValue="5" type="number" />
          <Input label="Order Timeout (hours)" defaultValue="48" type="number" />
          <Input label="Auto-Complete After (days)" defaultValue="14" type="number" />
        </div>
      </Card>

      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline">Cancel</Button>
        <Button><Save size={16} />Save Changes</Button>
      </div>
    </div>
  );
}
