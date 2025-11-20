"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, Send } from "lucide-react";

export default function TextToTextPage() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setOutputText(`نتیجه پردازش متن:\n${inputText}`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-pink-500/20">
            <FileText className="h-6 w-6 text-yellow-400" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-white">متن به متن</h1>
            <p className="text-slate-400">تبدیل و پردازش متن با هوش مصنوعی</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="input-text"
              className="text-sm font-semibold text-white/80 block text-right"
            >
              متن ورودی
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="متن خود را اینجا وارد کنید..."
              className="w-full rounded-lg border border-white/10 bg-white/5 p-4 text-right text-white placeholder:text-white/30 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 min-h-[200px] resize-y"
              dir="rtl"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="w-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 font-bold text-slate-950 shadow-[0_10px_35px_rgba(251,191,36,0.35)] hover:scale-[1.02] hover:opacity-90 h-12 text-base"
          >
            {isLoading ? (
              "در حال پردازش..."
            ) : (
              <>
                <Send className="h-5 w-5 ml-2" />
                پردازش متن
              </>
            )}
          </Button>
        </form>

        {outputText && (
          <div className="space-y-2">
            <label className="text-sm font-semibold text-white/80 block text-right">
              نتیجه
            </label>
            <div className="rounded-lg border border-white/10 bg-slate-900/50 p-4 text-right text-white min-h-[200px] whitespace-pre-wrap">
              {outputText}
            </div>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(outputText);
              }}
              className="w-full border-white/10 text-white/80 hover:border-white/30 hover:text-white"
            >
              کپی کردن نتیجه
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

