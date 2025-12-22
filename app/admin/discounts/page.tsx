"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag, Plus, Clock, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Discount {
  id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  capacity: number;
  usedCount: number;
  expiresAt: Date | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: "",
    capacity: "",
    expiresAt: "",
    isActive: true,
  });

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/discounts");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت کدهای تخفیف");
        setIsLoading(false);
        return;
      }

      setDiscounts(data.discounts || []);
      setError("");
    } catch (error) {
      console.error("Error fetching discounts:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDiscounts();
  }, [fetchDiscounts]);

  const handleCreateDiscount = async () => {
    if (!formData.code.trim()) {
      setError("کد تخفیف الزامی است");
      return;
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      setError("مقدار تخفیف باید یک عدد مثبت باشد");
      return;
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      setError("ظرفیت باید حداقل ۱ باشد");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: formData.code,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          capacity: parseInt(formData.capacity),
          expiresAt: formData.expiresAt || null,
          isActive: formData.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در ایجاد کد تخفیف");
        setIsCreating(false);
        return;
      }

      // Reset form and close dialog
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: "",
        capacity: "",
        expiresAt: "",
        isActive: true,
      });
      setCreateDialogOpen(false);
      setError("");

      // Refresh list
      await fetchDiscounts();
    } catch (error) {
      console.error("Error creating discount:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateInput: Date | string | null) => {
    if (!dateInput) return "بدون انقضا";
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isExpired = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    return new Date() > new Date(expiresAt);
  };

  const isFull = (usedCount: number, capacity: number) => {
    return usedCount >= capacity;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            مدیریت کدهای تخفیف
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            ایجاد و مدیریت کدهای تخفیف
          </p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:opacity-90"
        >
          <Plus className="h-4 w-4 ml-2" />
          ایجاد کد تخفیف جدید
        </Button>
      </div>

      {/* Statistics Card */}
      {!isLoading && discounts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">
                تعداد کل
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {discounts.length}
              </p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-green-400 mb-1 truncate">
                فعال
              </p>
              <p className="text-xl sm:text-2xl font-bold text-green-400">
                {
                  discounts.filter(
                    (d) =>
                      d.isActive &&
                      !isExpired(d.expiresAt) &&
                      !isFull(d.usedCount, d.capacity)
                  ).length
                }
              </p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-yellow-400 mb-1 truncate">
                استفاده شده
              </p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-400">
                {discounts.reduce((sum, d) => sum + d.usedCount, 0)}
              </p>
            </div>
          </div>
          <div className="rounded-xl sm:rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-500/5 p-3 sm:p-4 backdrop-blur-sm">
            <div className="flex flex-col">
              <p className="text-[10px] sm:text-xs text-red-400 mb-1 truncate">
                غیرفعال/منقضی
              </p>
              <p className="text-xl sm:text-2xl font-bold text-red-400">
                {
                  discounts.filter(
                    (d) =>
                      !d.isActive ||
                      isExpired(d.expiresAt) ||
                      isFull(d.usedCount, d.capacity)
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      )}

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
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] py-20 text-center backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-6 shadow-lg">
            <Tag className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            کد تخفیفی یافت نشد
          </h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            هنوز هیچ کد تخفیفی ایجاد نشده است.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-right text-slate-300 font-semibold">
                  کد تخفیف
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  نوع و مقدار
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  ظرفیت
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  تاریخ انقضا
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  وضعیت
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discounts.map((discount) => {
                const expired = isExpired(discount.expiresAt);
                const full = isFull(discount.usedCount, discount.capacity);
                const active = discount.isActive && !expired && !full;

                return (
                  <TableRow
                    key={discount.id}
                    className="border-white/10 hover:bg-white/5 transition-colors"
                  >
                    <TableCell className="text-white font-mono font-semibold">
                      {discount.code}
                    </TableCell>
                    <TableCell className="text-slate-300">
                      {discount.discountType === "percentage"
                        ? `${discount.discountValue}%`
                        : `${discount.discountValue.toLocaleString()} تومان`}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {discount.usedCount} / {discount.capacity}
                    </TableCell>
                    <TableCell className="text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {formatDate(discount.expiresAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {active ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 text-xs font-semibold">
                          <CheckCircle className="h-3 w-3" />
                          فعال
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 text-xs font-semibold">
                          <XCircle className="h-3 w-3" />
                          {!discount.isActive
                            ? "غیرفعال"
                            : expired
                            ? "منقضی"
                            : "پر شده"}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Discount Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              ایجاد کد تخفیف جدید
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              اطلاعات کد تخفیف را وارد کنید
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                کد تخفیف *
              </label>
              <Input
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="مثال: SUMMER2024"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                نوع تخفیف *
              </label>
              <Select
                value={formData.discountType}
                onValueChange={(value: "percentage" | "fixed") =>
                  setFormData({ ...formData, discountType: value })
                }
              >
                <SelectTrigger className="bg-slate-800 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="percentage">درصدی</SelectItem>
                  <SelectItem value="fixed">مقدار ثابت (تومان)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                {formData.discountType === "percentage"
                  ? "درصد تخفیف *"
                  : "مقدار تخفیف (تومان) *"}
              </label>
              <Input
                type="number"
                value={formData.discountValue}
                onChange={(e) =>
                  setFormData({ ...formData, discountValue: e.target.value })
                }
                placeholder={
                  formData.discountType === "percentage"
                    ? "مثال: 20"
                    : "مثال: 50000"
                }
                min="0"
                max={formData.discountType === "percentage" ? "100" : undefined}
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                ظرفیت (تعداد استفاده) *
              </label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                placeholder="مثال: 100"
                min="1"
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300">
                تاریخ انقضا (اختیاری)
              </label>
              <Input
                type="datetime-local"
                value={formData.expiresAt}
                onChange={(e) =>
                  setFormData({ ...formData, expiresAt: e.target.value })
                }
                className="bg-slate-800 border-white/10 text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 rounded border-white/10 bg-slate-800 text-yellow-400 focus:ring-yellow-400"
              />
              <label htmlFor="isActive" className="text-sm text-slate-300">
                فعال
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setCreateDialogOpen(false);
                setFormData({
                  code: "",
                  discountType: "percentage",
                  discountValue: "",
                  capacity: "",
                  expiresAt: "",
                  isActive: true,
                });
                setError("");
              }}
              disabled={isCreating}
              className="text-slate-400 hover:text-white"
            >
              انصراف
            </Button>
            <Button
              onClick={handleCreateDiscount}
              disabled={isCreating}
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 text-white hover:opacity-90"
            >
              {isCreating ? "در حال ایجاد..." : "ایجاد کد تخفیف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
