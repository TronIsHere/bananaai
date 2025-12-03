"use client";

import React from "react";
import { toast as sonnerToast } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

interface ToastProps {
  id: string | number;
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info" | "loading";
  action?: {
    label: string;
    onClick: () => void;
  };
  cancel?: {
    label: string;
    onClick: () => void;
  };
}

const getIcon = (type: ToastProps["type"]) => {
  switch (type) {
    case "success":
      return <CircleCheckIcon className="size-5 text-green-600" />;
    case "error":
      return <OctagonXIcon className="size-5 text-red-600" />;
    case "warning":
      return <TriangleAlertIcon className="size-5 text-yellow-600" />;
    case "info":
      return <InfoIcon className="size-5 text-blue-600" />;
    case "loading":
      return <Loader2Icon className="size-5 text-purple-600 animate-spin" />;
    default:
      return <InfoIcon className="size-5 text-blue-600" />;
  }
};

const getToastStyles = (type: ToastProps["type"]) => {
  switch (type) {
    case "success":
      return {
        bg: "bg-green-50 border-green-200",
        text: "text-green-900",
        desc: "text-green-700",
        icon: "text-green-600",
      };
    case "error":
      return {
        bg: "bg-red-50 border-red-200",
        text: "text-red-900",
        desc: "text-red-700",
        icon: "text-red-600",
      };
    case "warning":
      return {
        bg: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-900",
        desc: "text-yellow-700",
        icon: "text-yellow-600",
      };
    case "info":
      return {
        bg: "bg-blue-50 border-blue-200",
        text: "text-blue-900",
        desc: "text-blue-700",
        icon: "text-blue-600",
      };
    case "loading":
      return {
        bg: "bg-purple-50 border-purple-200",
        text: "text-purple-900",
        desc: "text-purple-700",
        icon: "text-purple-600",
      };
    default:
      return {
        bg: "bg-gray-50 border-gray-200",
        text: "text-gray-900",
        desc: "text-gray-700",
        icon: "text-gray-600",
      };
  }
};

function PersianToast(props: ToastProps) {
  const { title, description, type = "info", action, cancel, id } = props;
  const styles = getToastStyles(type);

  return (
    <div
      className={`flex rounded-lg ${styles.bg} border shadow-lg w-full md:max-w-[400px] items-start p-4 gap-3 font-iran-sans-light`}
      style={{ fontFamily: "var(--font-iran-sans-bold)", direction: "rtl" }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{getIcon(type)}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{title}</p>
            {description && (
              <p className={`mt-1 text-sm ${styles.desc}`}>{description}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => sonnerToast.dismiss(id)}
            className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Action buttons */}
        {(action || cancel) && (
          <div className="mt-3 flex gap-2 justify-end">
            {cancel && (
              <button
                onClick={() => {
                  cancel.onClick();
                  sonnerToast.dismiss(id);
                }}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {cancel.label}
              </button>
            )}
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  sonnerToast.dismiss(id);
                }}
                className={`px-3 py-1 text-xs font-medium text-white rounded-md transition-colors ${
                  type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : type === "info"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : type === "loading"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Dark mode styles
function PersianToastDark(props: ToastProps) {
  const { title, description, type = "info", action, cancel, id } = props;

  const getDarkStyles = (type: ToastProps["type"]) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-900/20 border-green-800/30",
          text: "text-green-100",
          desc: "text-green-200",
          icon: "text-green-400",
        };
      case "error":
        return {
          bg: "bg-red-900/20 border-red-800/30",
          text: "text-red-100",
          desc: "text-red-200",
          icon: "text-red-400",
        };
      case "warning":
        return {
          bg: "bg-yellow-900/20 border-yellow-800/30",
          text: "text-yellow-100",
          desc: "text-yellow-200",
          icon: "text-yellow-400",
        };
      case "info":
        return {
          bg: "bg-blue-900/20 border-blue-800/30",
          text: "text-blue-100",
          desc: "text-blue-200",
          icon: "text-blue-400",
        };
      case "loading":
        return {
          bg: "bg-purple-900/20 border-purple-800/30",
          text: "text-purple-100",
          desc: "text-purple-200",
          icon: "text-purple-400",
        };
      default:
        return {
          bg: "bg-gray-900/20 border-gray-800/30",
          text: "text-gray-100",
          desc: "text-gray-200",
          icon: "text-gray-400",
        };
    }
  };

  const styles = getDarkStyles(type);

  return (
    <div
      className={`flex rounded-lg ${styles.bg} border shadow-lg w-full md:max-w-[400px] items-start p-4 gap-3 font-sans`}
      style={{ fontFamily: "var(--font-iran-sans-bold)", direction: "rtl" }}
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">
        {React.cloneElement(getIcon(type), {
          className: `size-5 ${styles.icon}`,
        })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className={`text-sm font-medium ${styles.text}`}>{title}</p>
            {description && (
              <p className={`mt-1 text-sm ${styles.desc}`}>{description}</p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={() => sonnerToast.dismiss(id)}
            className="flex-shrink-0 mr-2 text-gray-400 hover:text-gray-300 transition-colors"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* Action buttons */}
        {(action || cancel) && (
          <div className="mt-3 flex gap-2 justify-end">
            {cancel && (
              <button
                onClick={() => {
                  cancel.onClick();
                  sonnerToast.dismiss(id);
                }}
                className="px-3 py-1 text-xs font-medium text-gray-300 bg-gray-800 rounded-md hover:bg-gray-700 transition-colors"
              >
                {cancel.label}
              </button>
            )}
            {action && (
              <button
                onClick={() => {
                  action.onClick();
                  sonnerToast.dismiss(id);
                }}
                className={`px-3 py-1 text-xs font-medium text-white rounded-md transition-colors ${
                  type === "success"
                    ? "bg-green-600 hover:bg-green-700"
                    : type === "error"
                    ? "bg-red-600 hover:bg-red-700"
                    : type === "warning"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : type === "info"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : type === "loading"
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Main toast function
function toast(toast: Omit<ToastProps, "id">) {
  return sonnerToast.custom((id) => {
    // Check if dark mode is active
    const isDark = document.documentElement.classList.contains("dark");

    if (isDark) {
      return <PersianToastDark {...toast} id={id} />;
    }

    return <PersianToast {...toast} id={id} />;
  });
}

// Convenience functions for different toast types
export const persianToast = {
  success: (
    title: string,
    description?: string,
    options?: Partial<ToastProps>
  ) => toast({ ...options, title, description, type: "success" }),

  error: (title: string, description?: string, options?: Partial<ToastProps>) =>
    toast({ ...options, title, description, type: "error" }),

  warning: (
    title: string,
    description?: string,
    options?: Partial<ToastProps>
  ) => toast({ ...options, title, description, type: "warning" }),

  info: (title: string, description?: string, options?: Partial<ToastProps>) =>
    toast({ ...options, title, description, type: "info" }),

  loading: (
    title: string,
    description?: string,
    options?: Partial<ToastProps>
  ) => toast({ ...options, title, description, type: "loading" }),

  custom: toast,
};

export default persianToast;
