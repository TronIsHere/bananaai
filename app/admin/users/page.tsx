"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در دریافت کاربران");
        setIsLoading(false);
        return;
      }

      setUsers(data.users || []);
      setError("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">
            مدیریت کاربران
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            مشاهده لیست کاربران و اطلاعات ثبت‌نام آن‌ها
          </p>
        </div>
      </div>

      {/* Statistics Card */}
      {!isLoading && users.length > 0 && (
        <div className="rounded-xl sm:rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-3 sm:p-4 backdrop-blur-sm">
          <div className="flex flex-col">
            <p className="text-[10px] sm:text-xs text-slate-400 mb-1 truncate">
              تعداد کل کاربران
            </p>
            <p className="text-xl sm:text-2xl font-bold text-white">
              {users.length}
            </p>
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
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] py-20 text-center backdrop-blur-sm">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-white/10 to-white/5 mb-6 shadow-lg">
            <Users className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">کاربری یافت نشد</h3>
          <p className="text-slate-400 text-sm max-w-xs mx-auto">
            هنوز هیچ کاربری ثبت‌نام نکرده است.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-white/5">
                <TableHead className="text-right text-slate-300 font-semibold">
                  ردیف
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  نام و نام خانوادگی
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  شماره تماس
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  تاریخ ثبت‌نام
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  شناسه
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user, index) => (
                <TableRow
                  key={user.id}
                  className="border-white/10 hover:bg-white/5 transition-colors"
                >
                  <TableCell className="text-slate-300 font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-white font-semibold">
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell className="text-slate-400 font-mono">
                    {user.mobileNumber}
                  </TableCell>
                  <TableCell className="text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      {formatDate(user.createdAt)}
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-xs">
                    {user.id.slice(-6)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
