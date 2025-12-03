"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Send, Clock, CheckCircle, XCircle, User, ShieldCheck } from "lucide-react";
import { useUser } from "@/hooks/use-user";
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
  subject: string;
  status: "pending" | "responded" | "closed";
  createdAt: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
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
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`);
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

  // Poll for new messages every 30 seconds
  useEffect(() => {
    if (!ticketId || isLoading) return;

    const interval = setInterval(() => {
      // We only want to fetch silently without setting loading state
      const fetchSilent = async () => {
        try {
          const response = await fetch(`/api/support/tickets/${ticketId}/messages`);
          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages || []);
            setTicket(data.ticket);
          }
        } catch (e) {
          console.error("Silent fetch error", e);
        }
      };
      fetchSilent();
    }, 30000);

    return () => clearInterval(interval);
  }, [ticketId, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    setError("");

    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
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
      
      // Update ticket status visually if needed (though backend handles it)
    } catch (error) {
      console.error("Error sending message:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-500">
            <Clock className="h-3.5 w-3.5" />
            در انتظار پاسخ
          </div>
        );
      case "responded":
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-green-500/10 border border-green-500/20 px-3 py-1 text-xs font-medium text-green-500">
            <CheckCircle className="h-3.5 w-3.5" />
            پاسخ داده شده
          </div>
        );
      case "closed":
        return (
          <div className="flex items-center gap-1.5 rounded-full bg-slate-500/10 border border-slate-500/20 px-3 py-1 text-xs font-medium text-slate-500">
            <XCircle className="h-3.5 w-3.5" />
            بسته شده
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fa-IR", {
      month: "long",
      day: "numeric",
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
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
         <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] gap-4">
        <div className="rounded-2xl bg-red-500/20 border border-red-500/30 px-6 py-4 text-red-400">
          {error}
        </div>
        <Button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            router.push("/dashboard/support");
          }}
          variant="outline"
          className="gap-2 border-white/10 bg-white/5 text-white hover:bg-white/10"
        >
          <ArrowRight className="h-4 w-4" />
          بازگشت به لیست تیکت‌ها
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] max-w-7xl mx-auto overflow-hidden rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a] to-[#1e293b] shadow-2xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-white/10 to-white/5 p-3 sm:p-4 md:p-6 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              router.push("/dashboard/support");
            }}
            size="icon"
            variant="ghost"
            className="rounded-xl text-slate-400 hover:bg-white/10 hover:text-white shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-white line-clamp-2 sm:line-clamp-1">
              {ticket?.subject}
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-2 flex-wrap">
               <span className="text-[10px] sm:text-xs text-slate-400 font-medium">#{ticket?.id.slice(-6)}</span>
               {ticket && getStatusBadge(ticket.status)}
               <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:inline">
                 ایجاد شده: {ticket && formatDate(ticket.createdAt)}
               </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6 bg-gradient-to-b from-[#0f172a] to-[#1e293b]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 px-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 shadow-lg">
                <Send className="h-8 w-8 sm:h-10 sm:w-10 opacity-50" />
            </div>
            <p className="text-sm sm:text-base font-semibold">پیامی وجود ندارد</p>
            <p className="text-xs sm:text-sm mt-2 opacity-70 text-center">اولین پیام خود را ارسال کنید</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.sender === "user";
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
                  <div className="flex justify-center my-6 sm:my-8">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-end gap-2 sm:gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar className={`h-8 w-8 sm:h-10 sm:w-10 border-2 shrink-0 ${isUser ? "border-indigo-500/30" : "border-orange-500/30"} shadow-lg`}>
                     {isUser ? (
                        <AvatarImage src={user?.image || ""} />
                     ) : (
                        <AvatarImage src="/img/proshir.jpg" />
                     )}
                    <AvatarFallback className={`${isUser ? "bg-gradient-to-br from-indigo-500 to-indigo-600" : "bg-gradient-to-br from-orange-500 to-orange-600"} text-white text-xs sm:text-sm font-bold`}>
                        {isUser ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div
                    className={`max-w-[75%] sm:max-w-[80%] md:max-w-[70%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] ${
                      isUser
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-bl-md rounded-br-xl sm:rounded-br-2xl"
                        : "bg-gradient-to-br from-white/15 to-white/10 text-slate-100 rounded-bl-xl sm:rounded-bl-2xl rounded-br-md border border-white/10"
                    }`}
                  >
                    {!isConsecutive && (
                      <div className={`text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                        {isUser ? "شما" : "پشتیبانی"}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed">
                      {message.content}
                    </p>
                    <div className={`flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] ${isUser ? "text-indigo-200" : "text-slate-400"} justify-end`}>
                      <span>{formatTime(message.createdAt)}</span>
                      {isUser && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-80" />}
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
      <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-r from-white/10 to-white/5 border-t border-white/10 backdrop-blur-sm">
        {ticket?.status !== "closed" ? (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3 relative">
            <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-white/10 border-2 border-white/20 focus-within:border-indigo-500/50 focus-within:bg-white/15 transition-all shadow-lg">
                <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="پیام خود را بنویسید..."
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
              className="h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-600 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
            >
              {isSending ? (
                  <div className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
              )}
            </Button>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-500/5 border border-slate-500/20 p-3 sm:p-4 text-xs sm:text-sm text-slate-400 backdrop-blur-sm">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-center">این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد</span>
          </div>
        )}
      </div>
    </div>
  );
}
