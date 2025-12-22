"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, Clock, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  credits: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "خطا در حذف کاربر");
        setIsDeleting(false);
        return;
      }

      // Remove user from list
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      setError("");
    } catch (error) {
      console.error("Error deleting user:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsDeleting(false);
    }
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
                  اعتبارات
                </TableHead>
                <TableHead className="text-right text-slate-300 font-semibold">
                  عملیات
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
                  <TableCell className="text-slate-300 font-semibold">
                    {user.credits}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(user)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">حذف کاربر</DialogTitle>
            <DialogDescription className="text-slate-400">
              آیا مطمئن هستید که می‌خواهید کاربر{" "}
              <span className="font-semibold text-white">
                {userToDelete?.firstName} {userToDelete?.lastName}
              </span>{" "}
              را حذف کنید؟
              <br />
              <span className="text-red-400 mt-2 block">
                این عمل تمام تصاویر کاربر را از سرور حذف می‌کند و قابل بازگشت
                نیست.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDeleteDialogOpen(false);
                setUserToDelete(null);
              }}
              disabled={isDeleting}
              className="text-slate-400 hover:text-white"
            >
              انصراف
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? "در حال حذف..." : "حذف کاربر"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
