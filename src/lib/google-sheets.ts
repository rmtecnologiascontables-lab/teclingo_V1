// Google Sheets & Drive API via Google Apps Script
// This version works with any frontend (Vite, Cloudflare Workers, etc.)

const APPS_SCRIPT_URL =
  import.meta.env.VITE_APPS_SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbzMalcgobIMdMFXQFMMQooROkT4v2TKjB8zPA5CsY_XrAmxnQ6m-tz-mHhwc4D6u6DT/exec";

export interface GSheetUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "teacher" | "director";
  password?: string;
  avatar_url?: string;
  created_at: string;
  app_code?: string;
  institutionName?: string;
  group_id?: string;
  numeroControl?: string;
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

export interface GSheetGroup {
  id: string;
  name: string;
  modulo: number;
  teacher_id: string;
  director_id: string;
  anio_escolar: string;
  capacidad: number;
  horario: string;
  status: "ACTIVO" | "INACTIVO";
  created_at: string;
}

export interface GSheetMessage {
  id: string;
  fromId: string;
  toId: string;
  text: string;
  createdAt: string;
  readBy: string;
}

async function callGScript<T>(action: string, data?: Record<string, unknown>): Promise<T> {
  if (APPS_SCRIPT_URL === "YOUR_APPS_SCRIPT_URL_HERE") {
    console.warn("⚠️ APPS_SCRIPT_URL not configured. Using mock mode.");
    return mockResponse(action, data);
  }

  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    redirect: "follow",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action, ...data }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GS API Error:", response.status, errorText);
    throw new Error(`GScript HTTP error: ${response.status} - ${errorText}`);
  }

  const text = await response.text();
  let result;
  try {
    result = JSON.parse(text);
  } catch (e) {
    console.error("GS API Invalid JSON:", text.substring(0, 200));
    throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
  }

  if (!result.success) {
    console.error("GS API Error:", result.error);
    throw new Error(result.error || "Unknown GS API error");
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

  async getGroups(filters?: {
    modulo?: number;
    teacher_id?: string;
    director_id?: string;
    anio_escolar?: string;
  }): Promise<GSheetGroup[]> {
    return callGScript<GSheetGroup[]>("getGroups", { filters });
  },

  async createGroup(group: Omit<GSheetGroup, "id" | "created_at">): Promise<GSheetGroup> {
    return callGScript<GSheetGroup>("createGroup", { group });
  },

  async updateGroup(id: string, updates: Partial<GSheetGroup>): Promise<GSheetGroup> {
    return callGScript<GSheetGroup>("updateGroup", { id, updates });
  },

  async deleteGroup(id: string): Promise<void> {
    return callGScript<void>("deleteGroup", { id });
  },

  async assignStudentToGroup(
    studentId: string,
    groupId: string,
  ): Promise<{ studentId: string; groupId: string }> {
    return callGScript<{ studentId: string; groupId: string }>("assignStudentToGroup", {
      studentId,
      groupId,
    });
  },

  async getStudentsByGroup(groupId: string): Promise<GSheetUser[]> {
    return callGScript<GSheetUser[]>("getStudentsByGroup", { groupId });
  },

  async canMessage(
    fromRole: string,
    toRole: string,
    fromId: string,
    toId: string,
  ): Promise<boolean> {
    return callGScript<boolean>("canMessage", { fromRole, toRole, fromId, toId });
  },

  async getMessagesByUser(userId: string): Promise<GSheetMessage[]> {
    return callGScript<GSheetMessage[]>("getMessagesByUser", { userId });
  },

  async getConversation(userId1: string, userId2: string): Promise<GSheetMessage[]> {
    return callGScript<GSheetMessage[]>("getConversation", { userId1, userId2 });
  },

  async createMessage(message: {
    fromId: string;
    toId: string;
    text: string;
  }): Promise<GSheetMessage> {
    return callGScript<GSheetMessage>("createMessage", { message });
  },

  async markMessageRead(messageId: string, userId: string): Promise<{ success: boolean }> {
    return callGScript<{ success: boolean }>("markMessageRead", { messageId, userId });
  },

  async getUnreadCount(userId: string): Promise<number> {
    return callGScript<number>("getUnreadCount", { userId });
  },

  isConfigured(): boolean {
    return APPS_SCRIPT_URL !== "YOUR_APPS_SCRIPT_URL_HERE";
  },
};
