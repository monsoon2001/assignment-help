"use client";

import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const summaryStats = [
  {
    label: "Total Earnings",
    value: "$12,480",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-700",
    change: "+12%",
    up: true,
  },
  {
    label: "This Month",
    value: "$2,840",
    icon: TrendingUp,
    color: "bg-primary-container text-on-primary",
    change: "+8%",
    up: true,
  },
  {
    label: "Pending Payout",
    value: "$480",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
    change: "",
    up: true,
  },
  {
    label: "Completed Orders",
    value: "34",
    icon: CheckCircle,
    color: "bg-secondary-container text-on-secondary-container",
    change: "+3",
    up: true,
  },
];

const transactions = [
  { id: "TXN-2041", description: "Statistics Problem Set — James Liu", amount: "+$75.00", status: "completed", date: "Sep 10, 2026", type: "credit" },
  { id: "TXN-2040", description: "Psychology Literature Review — Emma Wilson", amount: "+$130.00", status: "completed", date: "Sep 8, 2026", type: "credit" },
  { id: "TXN-2039", description: "Payout to Bank Account (****4821)", amount: "-$850.00", status: "completed", date: "Sep 5, 2026", type: "debit" },
  { id: "TXN-2038", description: "Business Plan Analysis — Sarah Kim", amount: "+$95.00", status: "pending", date: "Sep 4, 2026", type: "credit" },
  { id: "TXN-2037", description: "Python Data Analysis Project — Sarah Kim", amount: "+$110.00", status: "pending", date: "Sep 3, 2026", type: "credit" },
  { id: "TXN-2036", description: "Research Paper on Climate Change — Alex Chen", amount: "+$120.00", status: "pending", date: "Sep 1, 2026", type: "credit" },
  { id: "TXN-2035", description: "Payout to Bank Account (****4821)", amount: "-$620.00", status: "completed", date: "Aug 30, 2026", type: "debit" },
  { id: "TXN-2034", description: "Essay Editing — Olivia Brown", amount: "+$65.00", status: "completed", date: "Aug 28, 2026", type: "credit" },
];

const monthlyEarnings = [
  { month: "May", amount: 1820 },
  { month: "Jun", amount: 2150 },
  { month: "Jul", amount: 1980 },
  { month: "Aug", amount: 2690 },
  { month: "Sep", amount: 2840 },
];

const maxEarning = Math.max(...monthlyEarnings.map((m) => m.amount));

export default function HelperEarnings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Earnings
        </h1>
        <p className="text-on-surface-variant mt-1">
          Track your earnings and transaction history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">{stat.label}</p>
                  <p className="text-2xl font-bold text-on-surface mt-1">{stat.value}</p>
                  {stat.change && (
                    <div className="flex items-center gap-1 mt-1">
                      {stat.up ? (
                        <ArrowUpRight size={12} className="text-emerald-600" />
                      ) : (
                        <ArrowDownRight size={12} className="text-error" />
                      )}
                      <span className="text-xs font-medium text-emerald-600">
                        {stat.change}
                      </span>
                    </div>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
          Monthly Earnings
        </h2>
        <div className="flex items-end gap-3 h-48">
          {monthlyEarnings.map((m) => (
            <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-medium text-on-surface-variant">
                ${m.amount.toLocaleString()}
              </span>
              <div
                className="w-full bg-surface-container rounded-lg overflow-hidden relative"
                style={{ height: `${(m.amount / maxEarning) * 120}px` }}
              >
                <div className="absolute inset-0 bg-primary-container/80 rounded-lg" />
              </div>
              <span className="text-xs text-on-surface-variant">{m.month}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="p-6 border-b border-outline-variant/30">
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Transaction History
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">
                  Transaction
                </th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">
                  Status
                </th>
                <th className="text-right text-xs font-semibold text-on-surface-variant uppercase tracking-wider px-6 py-3">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr
                  key={txn.id}
                  className="border-b border-outline-variant/20 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-on-surface">{txn.description}</p>
                      <p className="text-xs text-on-surface-variant">{txn.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{txn.date}</td>
                  <td className="px-6 py-4">
                    <Badge variant={txn.status === "completed" ? "success" : "warning"}>
                      {txn.status === "completed" ? "Completed" : "Pending"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-sm font-semibold ${txn.type === "credit" ? "text-emerald-600" : "text-on-surface-variant"}`}>
                      {txn.amount}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
