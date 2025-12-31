"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  Image as ImageIcon,
  X,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Message {
  content: string;
  sender: "user" | "admin" | "assistant";
  senderId?: string;
  senderMobile?: string;
  images?: string[];
  generatedImages?: string[];
  messageType?: "text" | "image_generation" | "image_to_image";
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: "pending" | "responded" | "closed";
  createdAt: string;
}

interface ImageFile {
  file: File;
  preview: string;
}

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const ticketId = params?.ticketId as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachedImages, setAttachedImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      // Check if file is an image by MIME type or extension (for HEIC support)
      const fileName = file.name.toLowerCase();
      const fileExtension = fileName.substring(fileName.lastIndexOf("."));
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".heic",
        ".heif",
      ];
      const isImageByType = file.type.startsWith("image/");
      const isImageByExtension = allowedExtensions.includes(fileExtension);

      if (isImageByType || isImageByExtension) {
        const maxSize = 6 * 1024 * 1024; // 6MB
        if (file.size > maxSize) {
          setError("حجم فایل نباید بیشتر از 6 مگابایت باشد");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setAttachedImages((prev) => [
            ...prev,
            { file, preview: reader.result as string },
          ]);
        };
        reader.readAsDataURL(file);
      } else {
        setError("فرمت فایل نامعتبر است. فقط JPG، PNG، WEBP و HEIC مجاز است");
      }
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && attachedImages.length === 0) || isSending)
      return;

    setIsSending(true);
    setError("");

    try {
      // Upload images first if any
      const uploadedImageUrls: string[] = [];

      for (const img of attachedImages) {
        const formData = new FormData();
        formData.append("image", img.file);

        const uploadResponse = await fetch("/api/upload/image", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(
            uploadData.message || uploadData.error || "Failed to upload image"
          );
        }

        if (uploadData.success && uploadData.url) {
          uploadedImageUrls.push(uploadData.url);
        }
      }

      // Send message with images
      const response = await fetch(
        `/api/support/tickets/${ticketId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content:
              newMessage.trim() ||
              (uploadedImageUrls.length > 0 ? "تصویر آپلود شده" : ""),
            images: uploadedImageUrls,
            messageType: "text",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ارسال پیام");
        setIsSending(false);
        return;
      }

      // Refresh messages to get latest from server
      await fetchTicket();

      setNewMessage("");
      setAttachedImages([]);

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error: any) {
      console.error("Error sending message:", error);
      setError(error.message || "خطا در ارتباط با سرور");
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
            window.scrollTo({ top: 0, behavior: "instant" });
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
    <div className="flex flex-col h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 p-3 sm:p-4 md:p-6 z-10">
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          <Button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: "instant" });
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
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium">
                #{ticket?.id.slice(-6)}
              </span>
              {ticket && getStatusBadge(ticket.status)}
              <span className="text-[10px] sm:text-xs text-slate-500 hidden sm:inline">
                ایجاد شده: {ticket && formatDate(ticket.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 px-4">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 opacity-50" />
            </div>
            <p className="text-sm sm:text-base font-semibold">
              پیامی وجود ندارد
            </p>
            <p className="text-xs sm:text-sm mt-2 opacity-70 text-center">
              اولین پیام خود را ارسال کنید
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isUser = message.sender === "user";
            const isAssistant = message.sender === "assistant";
            const showDate =
              index === 0 ||
              new Date(message.createdAt).toDateString() !==
                new Date(messages[index - 1].createdAt).toDateString();
            const isConsecutive =
              index > 0 &&
              messages[index - 1].sender === message.sender &&
              new Date(message.createdAt).getTime() -
                new Date(messages[index - 1].createdAt).getTime() <
                5 * 60 * 1000;

            return (
              <div
                key={index}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {showDate && (
                  <div className="flex justify-center my-6 sm:my-8">
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-500 bg-white/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                )}
                <div
                  className={`flex items-start gap-2 sm:gap-3 ${
                    isUser ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <Avatar
                    className={`h-8 w-8 sm:h-10 sm:w-10 border-2 shrink-0 ${
                      isUser
                        ? "border-indigo-500/30"
                        : isAssistant
                        ? "border-purple-500/30"
                        : "border-orange-500/30"
                    } shadow-lg`}
                  >
                    {isUser ? (
                      <AvatarImage src={undefined} />
                    ) : isAssistant ? (
                      <AvatarImage src="/img/proshir.jpg" />
                    ) : (
                      <AvatarImage src="/img/proshir.jpg" />
                    )}
                    <AvatarFallback
                      className={`${
                        isUser
                          ? "bg-gradient-to-br from-indigo-500 to-indigo-600"
                          : isAssistant
                          ? "bg-gradient-to-br from-purple-500 to-purple-600"
                          : "bg-gradient-to-br from-orange-500 to-orange-600"
                      } text-white text-xs sm:text-sm font-bold`}
                    >
                      {isUser ? (
                        <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : isAssistant ? (
                        <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div
                    className={`max-w-[75%] sm:max-w-[80%] md:max-w-[70%] rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3.5 shadow-lg backdrop-blur-sm transition-all hover:scale-[1.01] ${
                      isUser
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-bl-md rounded-br-xl sm:rounded-br-2xl"
                        : isAssistant
                        ? "bg-gradient-to-br from-purple-600/80 to-purple-700/80 text-white rounded-bl-xl sm:rounded-bl-2xl rounded-br-md"
                        : "bg-gradient-to-br from-white/15 to-white/10 text-slate-100 rounded-bl-xl sm:rounded-bl-2xl rounded-br-md border border-white/10"
                    }`}
                  >
                    {!isConsecutive && (
                      <div
                        className={`text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 ${
                          isUser
                            ? "text-indigo-200"
                            : isAssistant
                            ? "text-purple-200"
                            : "text-slate-400"
                        }`}
                      >
                        {isUser
                          ? "شما"
                          : isAssistant
                          ? "هوش مصنوعی"
                          : "پشتیبانی"}
                      </div>
                    )}

                    {/* Message Content */}
                    {message.content && (
                      <p className="whitespace-pre-wrap break-words text-xs sm:text-sm leading-relaxed mb-2">
                        {message.content}
                      </p>
                    )}

                    {/* User Uploaded Images */}
                    {message.images && message.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {message.images.map((imgUrl, imgIndex) => (
                          <div
                            key={imgIndex}
                            className="relative group rounded-lg overflow-hidden border border-white/20"
                          >
                            <img
                              src={imgUrl}
                              alt={`Uploaded ${imgIndex + 1}`}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div
                      className={`flex items-center gap-1 sm:gap-1.5 mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] ${
                        isUser
                          ? "text-indigo-200"
                          : isAssistant
                          ? "text-purple-200"
                          : "text-slate-400"
                      } justify-end`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                      {isUser && (
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 opacity-80" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-3 sm:px-4 md:px-6 pt-2">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 flex items-start gap-2">
            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400 flex-1">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-400 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-3 sm:p-4 md:p-6 border-t border-white/5">
        {ticket?.status !== "closed" ? (
          <form onSubmit={handleSendMessage} className="space-y-3">
            {/* Attached Images Preview */}
            {attachedImages.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachedImages.map((img, index) => (
                  <div key={index} className="relative shrink-0">
                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-indigo-500/30">
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="flex items-end gap-2 sm:gap-3 relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                size="icon"
                variant="ghost"
                className="rounded-xl text-slate-400 hover:bg-white/10 hover:text-white shrink-0 h-[44px] w-[44px] sm:h-[52px] sm:w-[52px]"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>

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
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                />
              </div>

              <Button
                type="submit"
                disabled={
                  (!newMessage.trim() && attachedImages.length === 0) ||
                  isSending
                }
                size="icon"
                className="h-[44px] w-[44px] sm:h-[52px] sm:w-[52px] rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/30 hover:from-indigo-500 hover:to-indigo-600 hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 sm:h-5 sm:w-5 ml-0.5" />
                )}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-500/5 border border-slate-500/20 p-3 sm:p-4 text-xs sm:text-sm text-slate-400 backdrop-blur-sm">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
            <span className="text-center">
              این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
