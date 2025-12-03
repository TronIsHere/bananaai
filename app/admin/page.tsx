"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "pending" | "responded" | "closed";
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  type?: "contact" | "support";
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "responded" | "closed">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "contact" | "support">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (typeFilter !== "all") {
        params.append("type", typeFilter);
      }
      const queryString = params.toString();
      const response = await fetch(`/api/admin/tickets${queryString ? `?${queryString}` : ""}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت تیکت‌ها");
        setIsLoading(false);
        return;
      }

      setTickets(data.tickets || []);
      setError("");
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-400" />;
      case "responded":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-slate-400" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "در انتظار";
      case "responded":
        return "پاسخ داده شده";
      case "closed":
        return "بسته شده";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const filteredTickets = tickets;

  // Calculate statistics
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    responded: tickets.filter((t) => t.status === "responded").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    contact: tickets.filter((t) => t.type === "contact").length,
    support: tickets.filter((t) => t.type === "support").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            مدیریت تیکت‌ها
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            مدیریت و پاسخ به پیام‌های تماس با ما و پشتیبانی
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && tickets.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">همه</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-yellow-400 mb-1 truncate">در انتظار</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.pending}</p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-green-400 mb-1 truncate">پاسخ داده</p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">{stats.responded}</p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-slate-500/20 bg-gradient-to-br from-slate-500/10 to-slate-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">بسته شده</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-400">{stats.closed}</p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-blue-400 mb-1 truncate">تماس با ما</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-400">{stats.contact}</p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-purple-400 mb-1 truncate">پشتیبانی</p>
              <p className="text-xl sm:text-2xl font-bold text-purple-400">{stats.support}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-slate-300">نوع تیکت:</p>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {(["all", "contact", "support"] as const).map((type) => {
              const count = type === "all" ? stats.total : stats[type];
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
                    typeFilter === type
                      ? "bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-500/20 text-white shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {type === "all"
                    ? "همه"
                    : type === "contact"
                    ? "تماس با ما"
                    : "پشتیبانی"}
                  {count > 0 && (
                    <span className={`mr-1.5 sm:mr-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      typeFilter === type ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <p className="mb-2 sm:mb-3 text-xs sm:text-sm font-semibold text-slate-300">وضعیت:</p>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
            {(["all", "pending", "responded", "closed"] as const).map((status) => {
              const count = status === "all" ? stats.total : stats[status];
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
                    statusFilter === status
                      ? "bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-pink-500/20 text-white shadow-[0_0_20px_rgba(251,191,36,0.15)]"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {status === "all"
                    ? "همه"
                    : status === "pending"
                    ? "در انتظار"
                    : status === "responded"
                    ? "پاسخ داده شده"
                    : "بسته شده"}
                  {count > 0 && (
                    <span className={`mr-1.5 sm:mr-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      statusFilter === status ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/5"
            />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] py-20 text-center backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-6 shadow-lg">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">تیکتی یافت نشد</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            {typeFilter !== "all" || statusFilter !== "all"
              ? "تیکتی با این فیلترها پیدا نشد. فیلترها را تغییر دهید."
              : "هنوز هیچ تیکتی ثبت نشده است."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const isRecent = new Date(ticket.updatedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000;
            const isPending = ticket.status === "pending";
            return (
              <div
                key={ticket.id}
                onClick={() => router.push(`/admin/${ticket.id}`)}
                className={`group cursor-pointer rounded-2xl border transition-all backdrop-blur-sm ${
                  isPending && isRecent
                    ? "border-yellow-500/40 bg-gradient-to-br from-yellow-500/15 to-white/5 shadow-xl shadow-yellow-500/10 ring-2 ring-yellow-500/20"
                    : "border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/20 hover:bg-white/10"
                }`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className={`mt-1 hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl md:flex shadow-lg ${
                          ticket.status === "responded"
                            ? "bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-400 border border-green-500/20"
                            : ticket.status === "closed"
                            ? "bg-gradient-to-br from-slate-500/20 to-slate-500/10 text-slate-400 border border-slate-500/20"
                            : "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-start gap-3 flex-wrap">
                          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-1">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shrink-0 ${
                              ticket.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                                : ticket.status === "responded"
                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                            }`}
                          >
                            {getStatusIcon(ticket.status)}
                            {getStatusLabel(ticket.status)}
                          </span>
                          {ticket.type && (
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 ${
                              ticket.type === "contact"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            }`}>
                              {ticket.type === "contact" ? "تماس با ما" : "پشتیبانی"}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="font-semibold">{ticket.name}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{ticket.email}</span>
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3" />
                            {formatDate(ticket.createdAt)}
                          </span>
                          {ticket.updatedAt !== ticket.createdAt && (
                            <span className="flex items-center gap-1.5">
                              بروزرسانی: {formatDate(ticket.updatedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end md:flex-col md:items-end md:gap-2 shrink-0">
                      <div className="text-xs text-slate-500 font-medium">
                        #{ticket.id.slice(-6)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

