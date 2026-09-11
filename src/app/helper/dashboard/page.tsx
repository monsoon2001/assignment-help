"use client";

import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import Avatar from "@/components/ui/avatar";
import Link from "next/link";
import {
  Briefcase,
  DollarSign,
  Clock,
  Star,
  ArrowUpRight,
  FileText,
  Send,
  Settings,
} from "lucide-react";

const stats = [
  {
    label: "Active Projects",
    value: "4",
    icon: Briefcase,
    color: "bg-primary-container text-on-primary",
  },
  {
    label: "Earnings This Month",
    value: "$2,840",
    icon: DollarSign,
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    label: "Pending Reviews",
    value: "2",
    icon: Clock,
    color: "bg-amber-100 text-amber-700",
  },
  {
    label: "Average Rating",
    value: "5.0",
    icon: Star,
    color: "bg-secondary-container text-on-secondary-container",
  },
];

const activeProjects = [
  {
    id: 1,
    title: "Research Paper on Climate Change",
    student: "Alex Chen",
    subject: "Environmental Science",
    deadline: "Sep 15, 2026",
    progress: 65,
    price: "$120",
  },
  {
    id: 2,
    title: "Business Plan Analysis",
    student: "Sarah Kim",
    subject: "Business Studies",
    deadline: "Sep 18, 2026",
    progress: 40,
    price: "$95",
  },
  {
    id: 3,
    title: "Statistics Problem Set",
    student: "James Liu",
    subject: "Mathematics",
    deadline: "Sep 12, 2026",
    progress: 80,
    price: "$75",
  },
];

const recentMessages = [
  {
    name: "Alex Chen",
    message: "Thanks for the draft! Can we discuss the introduction?",
    time: "2m ago",
    online: true,
  },
  {
    name: "Sarah Kim",
    message: "I uploaded the additional research materials.",
    time: "15m ago",
    online: false,
  },
  {
    name: "James Liu",
    message: "The problem set looks great. Left a 5-star review!",
    time: "1h ago",
    online: true,
  },
];

export default function HelperDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-on-surface">
          Welcome back, Maya
        </h1>
        <p className="text-on-surface-variant mt-1">
          Here&apos;s an overview of your activity and earnings.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-on-surface-variant">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-on-surface mt-1">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}
                >
                  <Icon size={20} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-on-surface">
              Active Projects
            </h2>
            <Link
              href="/helper/orders"
              className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="p-5" hover>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-on-surface truncate">
                        {project.title}
                      </h3>
                      <Badge variant="primary">Active</Badge>
                    </div>
                    <p className="text-sm text-on-surface-variant">
                      Student: {project.student} &middot; {project.subject}
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-sm text-on-surface-variant">
                        Deadline: {project.deadline}
                      </span>
                      <span className="text-sm font-semibold text-on-surface">
                        {project.price}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-on-surface-variant">
                          Progress
                        </span>
                        <span className="text-xs font-medium text-on-surface">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-container rounded-full transition-all"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-semibold text-on-surface">
                Recent Messages
              </h2>
              <Link
                href="/helper/messages"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                View all <ArrowUpRight size={14} />
              </Link>
            </div>
            <Card className="divide-y divide-outline-variant/30">
              {recentMessages.map((msg, i) => (
                <div key={i} className="p-4 flex items-start gap-3">
                  <Avatar name={msg.name} size="sm" online={msg.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-on-surface truncate">
                        {msg.name}
                      </p>
                      <span className="text-xs text-on-surface-variant shrink-0">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface-variant truncate mt-0.5">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <h2 className="font-display text-lg font-semibold text-on-surface mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/helper/requests"
                className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <FileText size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-on-surface">
                  New Requests
                </span>
              </Link>
              <Link
                href="/helper/messages"
                className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center">
                  <Send size={20} className="text-primary" />
                </div>
                <span className="text-sm font-medium text-on-surface">
                  Send Message
                </span>
              </Link>
              <Link
                href="/helper/earnings"
                className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign size={20} className="text-emerald-600" />
                </div>
                <span className="text-sm font-medium text-on-surface">
                  Earnings
                </span>
              </Link>
              <Link
                href="/helper/profile"
                className="flex flex-col items-center gap-2 p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 hover:border-primary-container/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary-container/50 flex items-center justify-center">
                  <Settings size={20} className="text-secondary" />
                </div>
                <span className="text-sm font-medium text-on-surface">
                  Settings
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
