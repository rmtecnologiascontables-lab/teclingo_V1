// Google Sheets & Drive API via Google Apps Script
// This version works with any frontend (Vite, Cloudflare Workers, etc.)

const APPS_SCRIPT_URL = import.meta.env.VITE_APPS_SCRIPT_URL || "https://script.google.com/macros/s/AKfycbyng--gILDcyPV-rpTCoUbrzc1bZzYR8BQ3iVPdtlIYgpI906M_5nBVXXWb2KmtVoU/exec";

export interface GSheetUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "director";
  password?: string;
  avatar_url?: string;
  created_at: string;
}

export interface GSheetItem {
  id: string;
  title: string;
  description: string;
  type: "image" | "audio" | "video" | "text";
  url?: string;
  category: string;
  created_at: string;
}

export interface GSheetStats {
  id: string;
  user_id: string;
  metric: string;
  value: number;
  date: string;
}

async function callGScript<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
    console.warn("⚠️ APPS_SCRIPT_URL not configured. Using mock mode.");
    return mockResponse(action, data);
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
  });

  if (!response.ok) {
    throw new Error(`GScript error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || "Unknown error");
  }

  return result.data;
}

function mockResponse<T>(action: string, data?: Record<string, unknown>): T {
  console.log(`[MOCK] ${action}`, data);
  return [] as T;
}

export const gapi = {
  async getUsers(): Promise<GSheetUser[]> {
    return callGScript<GSheetUser[]>("getUsers");
  },

  async createUser(user: Omit<GSheetUser, "id" | "created_at">): Promise<GSheetUser> {
    const id = "u-" + Math.random().toString(36).substring(2, 11);
    const created_at = new Date().toISOString();
    const result = await callGScript<GSheetUser>("createUser", {
      user: { ...user, id, created_at },
    });
    return result;
  },

  async updateUser(id: string, updates: Partial<GSheetUser>): Promise<GSheetUser> {
    return callGScript<GSheetUser>("updateUser", { id, updates });
  },

  async deleteUser(id: string): Promise<void> {
    return callGScript<void>("deleteUser", { id });
  },

  async getItems(category?: string): Promise<GSheetItem[]> {
    return callGScript<GSheetItem[]>("getItems", { category });
  },

  async createItem(item: Omit<GSheetItem, "id" | "created_at">): Promise<GSheetItem> {
    return callGScript<GSheetItem>("createItem", { item });
  },

  async uploadFile(
    file: File,
    folderType: "avatars" | "images" | "audios",
  ): Promise<{ webViewLink: string; webContentLink: string }> {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    return callGScript<{ webViewLink: string; webContentLink: string }>("uploadFile", {
      fileName: file.name,
      mimeType: file.type,
      data: base64,
      folderType,
    });
  },

  async getStats(userId?: string): Promise<GSheetStats[]> {
    return callGScript<GSheetStats[]>("getStats", { userId });
  },

  async saveStats(stats: Omit<GSheetStats, "id">): Promise<GSheetStats> {
    return callGScript<GSheetStats>("saveStats", { stats });
  },

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    return callGScript<void>("sendWelcomeEmail", { email, name });
  },

  isConfigured(): boolean {
    return APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";
  },
};