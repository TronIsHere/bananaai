"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Clock, CheckCircle, XCircle, User, Mail, ShieldCheck, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  content: string;
  sender: "user" | "admin";
  senderId?: string;
  senderMobile?: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  name: string;
  email: string;
  subject: string;
  status: "pending" | "responded" | "closed";
  type?: "contact" | "support";
  userId?: string;
  createdAt: string;
}

export default function AdminTicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params?.ticketId as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [newMessage]);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/messages`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت تیکت");
        setIsLoading(false);
        return;
      }

      setTicket(data.ticket);
      setMessages(data.messages || []);
      setError("");
    } catch (error) {
      console.error("Error fetching ticket:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // Poll for new messages every 1 minute
  useEffect(() => {
    if (!ticketId || isLoading) return;

    const interval = setInterval(() => {
      fetchTicket();
    }, 60000); // 1 minute = 60000ms

    return () => clearInterval(interval);
  }, [ticketId, isLoading, fetchTicket]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newMessage }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ارسال پیام");
        setIsSending(false);
        return;
      }

      // Add new message to list
      setMessages((prev) => [...prev, data.messageData]);
      setNewMessage("");
      // Reset height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
      await fetchTicket(); // Refresh to get updated status
    } catch (error) {
      console.error("Error sending message:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSending(false);
    }
  };

  const handleCloseTicket = async () => {
    if (isSending) return;

    setIsSending(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/tickets/${ticketId}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          response: newMessage || "تیکت بسته شد",
          status: "closed",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در بستن تیکت");
        setIsSending(false);
        return;
      }

      await fetchTicket();
    } catch (error) {
      console.error("Error closing ticket:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSending(false);
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => router.push("/admin")}
          className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          بازگشت به لیست تیکت‌ها
        </Button>
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-140px)] max-w-7xl mx-auto gap-3 sm:gap-4 md:gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-start md:justify-between shrink-0">
        <div className="flex items-start gap-2 sm:gap-4 flex-1 min-w-0">
          <Button
            onClick={() => router.push("/admin")}
            size="icon"
            variant="ghost"
            className="rounded-xl text-slate-400 hover:bg-white/10 hover:text-white shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 sm:gap-3 flex-wrap mb-2 sm:mb-3">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-white line-clamp-2 flex-1 min-w-0">
                {ticket?.subject}
              </h1>
              {ticket && (
                <span
                  className={`inline-flex items-center gap-1 sm:gap-1.5 rounded-full border px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold shrink-0 ${
                    ticket.status === "pending"
                      ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      : ticket.status === "responded"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                  }`}
                >
                  {getStatusIcon(ticket.status)}
                  <span className="hidden sm:inline">{getStatusLabel(ticket.status)}</span>
                  <span className="sm:hidden">{getStatusLabel(ticket.status).split(' ')[0]}</span>
                </span>
              )}
              {ticket?.type && (
                <span className={`text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold shrink-0 ${
                  ticket.type === "contact"
                    ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    : "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                }`}>
                  {ticket.type === "contact" ? "تماس" : "پشتیبانی"}
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-xs text-slate-500 flex flex-wrap gap-1 sm:gap-2">
              <span>#{ticket?.id.slice(-6)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">ایجاد شده: {ticket && formatDate(ticket.createdAt)}</span>
              <span className="sm:hidden">{ticket && formatDate(ticket.createdAt).split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* User Info Card */}
        {ticket && (
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm w-full sm:min-w-[200px] sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-white/20 shrink-0">
                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-white truncate">{ticket.name}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 truncate">{ticket.email}</p>
              </div>
            </div>
            <div className="space-y-1.5 sm:space-y-2 pt-2 sm:pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span className="truncate">{ticket.email}</span>
              </div>
              {ticket.userId && (
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                  <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>کاربر ثبت‌نام شده</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-3 sm:mb-4 rounded-2xl bg-red-500/20 border border-red-500/30 px-4 py-3 text-sm text-red-400 shrink-0">
          {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 min-h-0 overflow-y-auto rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 md:p-6 mb-3 sm:mb-4 space-y-4 sm:space-y-6 backdrop-blur-sm">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 shadow-lg">
              <MessageSquare className="h-10 w-10 opacity-50" />
            </div>
            <p className="text-base font-semibold">پیامی وجود ندارد</p>
            <p className="text-sm mt-2 opacity-70">اولین پیام را ارسال کنید</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isAdmin = message.sender === "admin";
            const showDate =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();
            const isConsecutive = index > 0 && 
              messages[index - 1].sender === message.sender &&
              new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() < 5 * 60 * 1000;

            return (
              <div key={index} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {showDate && (
                  <div className="flex justify-center my-8">
                    <span className="text-xs font-semibold text-slate-500 bg-white/10 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end gap-3 ${
                    isAdmin ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className={`h-8 w-8 sm:h-10 sm:w-10 border-2 shrink-0 ${isAdmin ? "border-yellow-500/30" : "border-indigo-500/30"} shadow-lg`}>
                    {isAdmin ? (
                      <AvatarFallback className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
                        <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  
                  <div
                    className={`max-w-[75%] sm:max-w-[80%] md:max-w-[70%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] ${
                      isAdmin
                        ? "bg-gradient-to-br from-yellow-500/20 to-orange-500/20 text-white rounded-bl-md rounded-br-xl sm:rounded-br-2xl border border-yellow-500/30"
                        : "bg-gradient-to-br from-white/15 to-white/10 text-slate-100 rounded-bl-xl sm:rounded-bl-2xl rounded-br-md border border-white/10"
                    }`}
                  >
                    {!isConsecutive && (
                      <div className={`text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 ${isAdmin ? "text-yellow-200" : "text-slate-400"}`}>
                        {isAdmin ? "شما (مدیر)" : ticket?.name || "کاربر"}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <div className={`flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] ${isAdmin ? "text-yellow-200" : "text-slate-400"} justify-end`}>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      {ticket?.status !== "closed" ? (
        <div className="space-y-2 sm:space-y-3 shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
            <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-white/20 focus-within:border-yellow-500/50 focus-within:bg-white/15 transition-all shadow-lg">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پاسخ خود را بنویسید..."
                rows={1}
                className="w-full bg-transparent px-3 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none resize-none max-h-32 min-h-[44px] sm:min-h-[52px]"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              size="icon"
              className="h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-xl shadow-yellow-500/30 hover:from-yellow-500 hover:to-orange-600 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
              )}
            </Button>
          </form>
          <div className="flex gap-2">
            <Button
              onClick={handleCloseTicket}
              disabled={isSending}
              variant="outline"
              className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-red-400 hover:bg-red-500/20 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <XCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-1.5 sm:ml-2" />
              بستن تیکت
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-500/5 border border-slate-500/20 p-3 sm:p-4 text-xs sm:text-sm text-slate-400 backdrop-blur-sm">
          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
          <span className="text-center">این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد</span>
        </div>
      )}
    </div>
  );
}

