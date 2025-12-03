"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  RefreshCw,
  Filter,
  Search,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "pending" | "responded" | "closed";
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default function SupportPage() {
  const router = useRouter();
  const { user } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<
    "all" | "pending" | "responded" | "closed"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/support/tickets");
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
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Scroll to top when component mounts (when navigating back from chat)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ایجاد تیکت");
        setIsSubmitting(false);
        return;
      }

      setSuccess("تیکت با موفقیت ایجاد شد");
      setFormData({ subject: "", message: "" });
      setIsDialogOpen(false);
      await fetchTickets();

      setTimeout(() => {
        setSuccess("");
      }, 5000);
    } catch (error) {
      console.error("Error creating ticket:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        return "در انتظار پاسخ";
      case "responded":
        return "پاسخ داده شده";
      case "closed":
        return "بسته شده";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "responded":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "closed":
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default:
        return "bg-slate-500/10 text-slate-500 border-slate-500/20";
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

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: tickets.length,
    pending: tickets.filter((t) => t.status === "pending").length,
    responded: tickets.filter((t) => t.status === "responded").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  };

  const getStatusCount = (
    status: "all" | "pending" | "responded" | "closed"
  ) => {
    if (status === "all") return stats.total;
    return stats[status];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            پشتیبانی
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            تیکت‌های پشتیبانی خود را مشاهده و مدیریت کنید
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={fetchTickets}
            variant="outline"
            size="icon"
            className="rounded-xl border-white/10 bg-white/5 text-white hover:bg-white/10 shrink-0"
            title="بروزرسانی"
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 px-4 sm:px-6 font-bold text-white transition-all hover:from-yellow-500 hover:to-orange-500 hover:scale-[1.02] shadow-lg shadow-yellow-400/20 text-sm sm:text-base">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                <span className="hidden sm:inline">تیکت جدید</span>
                <span className="sm:hidden">جدید</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="border-white/10 bg-[#0f172a] text-white max-w-[calc(100vw-2rem)] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  ایجاد تیکت جدید
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    موضوع
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="موضوع تیکت خود را وارد کنید"
                    required
                    className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus-visible:ring-yellow-400/50"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-300">
                    پیام
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    rows={6}
                    placeholder="پیام خود را اینجا بنویسید..."
                    required
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 py-6 font-bold text-white transition-all hover:from-yellow-500 hover:to-orange-500 hover:scale-[1.02]"
                >
                  {isSubmitting ? "در حال ارسال..." : "ارسال تیکت"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      {!isLoading && tickets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">
                  همه تیکت‌ها
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stats.total}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-yellow-400 mb-1 truncate">
                  در انتظار
                </p>
                <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {stats.pending}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
              </div>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-green-400 mb-1 truncate">
                  پاسخ داده شده
                </p>
                <p className="text-xl sm:text-2xl font-bold text-green-400">
                  {stats.responded}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
              </div>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-slate-500/20 bg-gradient-to-br from-slate-500/10 to-slate-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">
                  بسته شده
                </p>
                <p className="text-xl sm:text-2xl font-bold text-slate-400">
                  {stats.closed}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-500/20 flex items-center justify-center shrink-0">
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در تیکت‌ها..."
            className="w-full rounded-xl border-white/10 bg-white/5 pr-10 text-white placeholder:text-slate-500 focus-visible:ring-yellow-400/50 text-sm sm:text-base"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 -mx-1 px-1 scrollbar-hide">
          {(["all", "pending", "responded", "closed"] as const).map(
            (status) => {
              const count = getStatusCount(status);
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`whitespace-nowrap rounded-xl px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold transition-all relative shrink-0 ${
                    statusFilter === status
                      ? "bg-white text-black shadow-lg"
                      : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {status === "all" ? "همه" : getStatusLabel(status)}
                  {count > 0 && (
                    <span
                      className={`mr-1.5 sm:mr-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                        statusFilter === status
                          ? "bg-black/20 text-black"
                          : "bg-white/10 text-slate-400"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>

      {success && (
        <div className="rounded-2xl bg-green-500/20 border border-green-500/30 px-4 py-3 text-sm text-green-400 flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          {success}
        </div>
      )}

      {error && (
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/5"
            />
          ))}
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] py-20 text-center backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-6 shadow-lg">
            <MessageSquare className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">تیکتی یافت نشد</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto mb-8">
            {searchQuery || statusFilter !== "all"
              ? "تیکتی با این مشخصات پیدا نشد. فیلترها را تغییر دهید یا جستجو کنید."
              : "هنوز هیچ تیکتی ثبت نکرده‌اید. برای شروع یک تیکت جدید ایجاد کنید."}
          </p>
          {tickets.length === 0 && (
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="rounded-xl bg-gradient-to-r from-yellow-400 to-orange-400 px-6 font-bold text-white transition-all hover:from-yellow-500 hover:to-orange-500 hover:scale-[1.02] shadow-lg shadow-yellow-400/20"
            >
              <Plus className="h-5 w-5 ml-2" />
              ایجاد اولین تیکت
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredTickets.map((ticket) => {
            const isRecent =
              new Date(ticket.updatedAt).getTime() >
              Date.now() - 24 * 60 * 60 * 1000;
            return (
              <div
                key={ticket.id}
                onClick={() => router.push(`/dashboard/support/${ticket.id}`)}
                className={`group cursor-pointer rounded-2xl border transition-all backdrop-blur-sm ${
                  isRecent && ticket.status === "pending"
                    ? "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-white/5 shadow-lg shadow-yellow-500/10"
                    : "border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] hover:border-white/10 hover:bg-white/[0.07]"
                }`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div
                        className={`mt-0.5 sm:mt-1 h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl flex shadow-lg ${
                          ticket.status === "responded"
                            ? "bg-gradient-to-br from-green-500/20 to-green-500/10 text-green-400 border border-green-500/20"
                            : ticket.status === "closed"
                            ? "bg-gradient-to-br from-slate-500/20 to-slate-500/10 text-slate-400 border border-slate-500/20"
                            : "bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
                        <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-yellow-400 transition-colors line-clamp-2 sm:line-clamp-1 flex-1 min-w-0">
                            {ticket.subject}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold shrink-0 ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {getStatusIcon(ticket.status)}
                            <span className="hidden sm:inline">
                              {getStatusLabel(ticket.status)}
                            </span>
                            <span className="sm:hidden">
                              {getStatusLabel(ticket.status).split(" ")[0]}
                            </span>
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                          {ticket.message}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500 pt-1 flex-wrap">
                          <span className="flex items-center gap-1 sm:gap-1.5">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                            <span className="truncate">
                              {formatDate(ticket.createdAt)}
                            </span>
                          </span>
                          {ticket.updatedAt !== ticket.createdAt && (
                            <span className="flex items-center gap-1 sm:gap-1.5">
                              <RefreshCw className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" />
                              <span className="hidden sm:inline">
                                بروزرسانی: {formatDate(ticket.updatedAt)}
                              </span>
                              <span className="sm:hidden">
                                بروز:{" "}
                                {formatDate(ticket.updatedAt).split(" ")[0]}
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-2 shrink-0 sm:pl-4">
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">
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
