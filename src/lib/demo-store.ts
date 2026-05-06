// Demo localStorage store for auth + messaging.
// 100% client-side. No backend.

export type Role = "director" | "teacher" | "student";

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  avatar_url?: string;
  provider: "email" | "google" | "guest";
  createdAt: number;
  app_code?: string;
  institution_id?: string;
  institutionName?: string;
  carrera?: string;
  semestre?: string;
  numeroControl?: string;
  fecha_ingreso?: string;
  modalidad?: string;
  phone?: string;
  domicilio?: string;
  status?: string;
  last_category_id?: string;
  group_id?: string;
}

export interface DemoMessage {
  id: string;
  fromId: string;
  toId: string; // user id (1:1 chat)
  text: string;
  createdAt: number;
  readBy: string[]; // user ids that have read it
}

const K_USERS = "demo.users";
const K_SESSION = "demo.session";
const K_MESSAGES = "demo.messages";
const K_PASSWORDS = "demo.passwords";
const K_INSTITUTION_COUNTER = "demo.institution.counter";
const K_INSTITUTIONS = "demo.institutions";
const K_USER_APP_CODE_COUNTER = "demo.user.app_code.counter";
const K_GROUPS = "demo.groups";

const SEED_GROUPS: DemoGroup[] = [
  {
    id: "grp-001",
    name: "Grupo 1 - Inglés A1",
    modulo: 1,
    teacher_id: "u-tea-1",
    director_id: "u-dir-1",
    anio_escolar: "2025-2026",
    capacidad: 25,
    horario: "Lun-Mié 8:00-10:00",
    status: "ACTIVO",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "grp-002",
    name: "Grupo 2 - Inglés A1",
    modulo: 1,
    teacher_id: "u-tea-2",
    director_id: "u-dir-1",
    anio_escolar: "2025-2026",
    capacidad: 25,
    horario: "Mar-Jue 10:00-12:00",
    status: "ACTIVO",
    createdAt: Date.now() - 86400000,
  },
  {
    id: "grp-003",
    name: "Grupo 1 - Inglés A2",
    modulo: 2,
    teacher_id: "u-tea-1",
    director_id: "u-dir-1",
    anio_escolar: "2025-2026",
    capacidad: 20,
    horario: "Lun-Mié 10:00-12:00",
    status: "ACTIVO",
    createdAt: Date.now() - 86400000,
  },
];

const SEED_USERS: DemoUser[] = [
  {
    id: "u-dir-1",
    name: "Dra. Patricia López",
    email: "director@demo.mx",
    role: "director",
    avatar: "👩‍💼",
    provider: "email",
    createdAt: Date.now() - 9e6,
  },
  {
    id: "u-tea-1",
    name: "Prof. Carlos Méndez",
    email: "carlos@demo.mx",
    role: "teacher",
    avatar: "👨‍🏫",
    provider: "email",
    createdAt: Date.now() - 8e6,
  },
  {
    id: "u-tea-2",
    name: "Prof. Ana Ruiz",
    email: "ana@demo.mx",
    role: "teacher",
    avatar: "👩‍🏫",
    provider: "email",
    createdAt: Date.now() - 7e6,
  },
  {
    id: "u-stu-1",
    name: "Diego Hernández",
    email: "diego@demo.mx",
    role: "student",
    avatar: "🧑‍🎓",
    provider: "email",
    createdAt: Date.now() - 6e6,
    group_id: "grp-001",
  },
  {
    id: "u-stu-2",
    name: "Sofía Pérez",
    email: "sofia@demo.mx",
    role: "student",
    avatar: "👩‍🎓",
    provider: "email",
    createdAt: Date.now() - 5e6,
    group_id: "grp-001",
  },
  {
    id: "u-stu-3",
    name: "Mateo García",
    email: "mateo@demo.mx",
    role: "student",
    avatar: "👦",
    provider: "email",
    createdAt: Date.now() - 4e6,
    group_id: "grp-002",
  },
];

const SEED_PWD: Record<string, string> = {
  "director@demo.mx": "demo1234",
  "carlos@demo.mx": "demo1234",
  "ana@demo.mx": "demo1234",
  "diego@demo.mx": "demo1234",
  "sofia@demo.mx": "demo1234",
  "mateo@demo.mx": "demo1234",
};

const SEED_MESSAGES = (): DemoMessage[] => {
  const now = Date.now();
  return [
    {
      id: "m1",
      fromId: "u-dir-1",
      toId: "u-tea-1",
      text: "Carlos, ¿podemos revisar los resultados del simulacro?",
      createdAt: now - 3600_000 * 5,
      readBy: ["u-dir-1"],
    },
    {
      id: "m2",
      fromId: "u-tea-1",
      toId: "u-dir-1",
      text: "Claro, los subo hoy mismo 📊",
      createdAt: now - 3600_000 * 4,
      readBy: ["u-tea-1"],
    },
    {
      id: "m3",
      fromId: "u-tea-1",
      toId: "u-stu-1",
      text: "Diego, recuerda entregar el writing del Unit 1.",
      createdAt: now - 3600_000 * 2,
      readBy: ["u-tea-1"],
    },
    {
      id: "m4",
      fromId: "u-stu-1",
      toId: "u-tea-1",
      text: "Ya casi termino, profe 🙌",
      createdAt: now - 3600_000,
      readBy: ["u-stu-1"],
    },
    {
      id: "m5",
      fromId: "u-tea-2",
      toId: "u-stu-2",
      text: "Sofía, excelente speaking de hoy.",
      createdAt: now - 1800_000,
      readBy: ["u-tea-2"],
    },
  ];
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("demo-store-change", { detail: { key } }));
}

export function ensureSeed() {
  if (typeof window === "undefined") return;
  if (!window.localStorage.getItem(K_USERS)) write(K_USERS, SEED_USERS);
  if (!window.localStorage.getItem(K_PASSWORDS)) write(K_PASSWORDS, SEED_PWD);
  if (!window.localStorage.getItem(K_MESSAGES)) write(K_MESSAGES, SEED_MESSAGES());
  if (!window.localStorage.getItem(K_GROUPS)) write(K_GROUPS, SEED_GROUPS);
}

export function resetDemo() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(K_USERS);
  window.localStorage.removeItem(K_PASSWORDS);
  window.localStorage.removeItem(K_MESSAGES);
  window.localStorage.removeItem(K_SESSION);
  window.localStorage.removeItem(K_GROUPS);
  ensureSeed();
}

export function getUsers(): DemoUser[] {
  return read<DemoUser[]>(K_USERS, []);
}
export function setUsers(users: DemoUser[]) {
  write(K_USERS, users);
}
export function getMessages(): DemoMessage[] {
  return read<DemoMessage[]>(K_MESSAGES, []);
}
export function setMessages(msgs: DemoMessage[]) {
  write(K_MESSAGES, msgs);
}
export function getPasswords(): Record<string, string> {
  return read<Record<string, string>>(K_PASSWORDS, {});
}
export function setPasswords(p: Record<string, string>) {
  write(K_PASSWORDS, p);
}

// ---- Session ----
export function getSession(): DemoUser | null {
  return read<DemoUser | null>(K_SESSION, null);
}
export function setSession(user: DemoUser | null) {
  write(K_SESSION, user);
}

// ---- Auth helpers ----
export async function loginEmail(
  email: string,
  password: string,
): Promise<DemoUser | { error: string }> {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "getUsers" }),
      });
      const data = await response.json();
      if (data.success) {
        const users = data.data;
        const u = users.find((x: any) => x.email.toString().toLowerCase() === email.toLowerCase());
        if (!u) return { error: "Usuario no registrado." };
        if (u.password !== password) return { error: "Contraseña incorrecta." };
        setSession(u);
        return u as DemoUser;
      }
    } catch (err) {
      return { error: "Error conectando con el servidor." };
    }
  }
  ensureSeed();
  const users = getUsers();
  const pwds = getPasswords();
  const u = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!u) return { error: "Usuario no encontrado" };
  if (pwds[email] !== password) return { error: "Contraseña incorrecta" };
  setSession(u);
  return u;
}

export async function loginGoogleReal(
  email: string,
): Promise<DemoUser | { error: string; isNew: boolean }> {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (scriptUrl) {
    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({ action: "getUsers" }),
      });
      const data = await response.json();
      if (data.success) {
        const users = data.data;
        const u = users.find(
          (x: any) => String(x.email).toLowerCase().trim() === String(email).toLowerCase().trim(),
        );

        if (!u) {
          return {
            error: "Tu cuenta de Google no está registrada. Por favor regístrate primero.",
            isNew: true,
          };
        }

        setSession(u);
        return u as DemoUser;
      } else {
        return { error: "Error de servidor: " + data.error, isNew: false };
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  ensureSeed();
  const users = getUsers();
  const u = users.find(
    (x) => String(x.email).toLowerCase().trim() === String(email).toLowerCase().trim(),
  );
  if (!u) return { error: "Usuario no registrado. Por favor regístrate primero.", isNew: true };
  setSession(u);
  return u;
}

export async function registerEmail(
  name: string,
  email: string,
  password: string,
  role: Role,
  institutionCode?: string,
  extraFields?: {
    institutionName?: string;
    carrera?: string;
    semestre?: string;
    numeroControl?: string;
    fecha_ingreso?: string;
    modalidad?: string;
    phone?: string;
    domicilio?: string;
  },
): Promise<DemoUser | { error: string }> {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;

  if (scriptUrl) {
    // Si es director y no hay código, generamos uno único
    let finalAppCode = institutionCode || "";
    if (role === "director" && !finalAppCode) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      finalAppCode = `TECNM-${randomSuffix}`;
    }

    const backendUser = {
      name,
      email,
      password,
      role,
      app_code: finalAppCode,
      institutionName: extraFields?.institutionName || (role === "director" ? name : ""),
      carrera: extraFields?.carrera || "",
      semestre: extraFields?.semestre || "",
      numeroControl: extraFields?.numeroControl || "",
      fecha_ingreso: extraFields?.fecha_ingreso || "",
      modalidad: extraFields?.modalidad || "",
      avatar_url: "",
    };

    try {
      const response = await fetch(scriptUrl, {
        method: "POST",
        body: JSON.stringify({
          action: "createUser",
          user: backendUser,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setSession(data.data);
        return data.data;
      } else {
        return { error: data.error };
      }
    } catch (err) {
      return { error: "Error conectando con el servidor." };
    }
  }
  ensureSeed();
  const users = getUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: "Ese correo ya está registrado" };
  }

  const trimmedControl = extraFields?.numeroControl?.trim();
  if (trimmedControl) {
    if (users.some((u) => u.numeroControl === trimmedControl)) {
      return { error: "Ese número de control ya está en uso por otro alumno" };
    }
  }

  let app_code: string | undefined;
  let institution_id: string | undefined;

  if (role === "director") {
    const newInst = createInstitution({
      id: "",
      name,
      email,
      role,
      provider: "email",
      createdAt: Date.now(),
    });
    app_code = newInst.app_code;
    institution_id = newInst.id;
  } else if (institutionCode) {
    const inst = getInstitutionByCode(institutionCode);
    if (inst) {
      institution_id = inst.id;
    }
  }

  const counter = getUserAppCodeCounter() + 1;
  setUserAppCodeCounter(counter);
  if (!app_code) {
    app_code = `USER-${String(counter).padStart(4, "0")}`;
  }

  const u: DemoUser = {
    id: `u-${Math.random().toString(36).slice(2, 9)}`,
    name,
    email,
    role,
    provider: "email",
    avatar: role === "director" ? "👔" : role === "teacher" ? "👨‍🏫" : "🧑‍🎓",
    createdAt: Date.now(),
    app_code,
    institution_id,
    institutionName: extraFields?.institutionName || (role === "director" ? name : undefined),
    carrera: extraFields?.carrera,
    semestre: extraFields?.semestre,
    numeroControl: extraFields?.numeroControl,
  };

  setUsers([...users, u]);
  setPasswords({ ...getPasswords(), [email]: password });
  setSession(u);
  return u;
}

export function loginGoogleStub(
  role: Role,
  isLogin = false,
): DemoUser | { error: string; isNew: boolean } {
  ensureSeed();
  const users = getUsers();
  const email = `google.${role}@gmail.com`;
  let u = users.find((x) => x.email === email);
  if (!u) {
    if (isLogin) {
      return {
        error: "Usuario no registrado. Debes registrarte con el código de tu institución.",
        isNew: true,
      };
    }
    u = {
      id: `u-g-${Math.random().toString(36).slice(2, 7)}`,
      name: `Google ${role === "director" ? "Director" : role === "teacher" ? "Docente" : "Alumno"}`,
      email,
      role,
      provider: "google",
      avatar: "🟢",
      createdAt: Date.now(),
    };
    setUsers([...users, u]);
  }
  setSession(u);
  return u;
}

export function loginGuest(role: Role): DemoUser {
  ensureSeed();
  const u: DemoUser = {
    id: `u-guest-${Math.random().toString(36).slice(2, 7)}`,
    name: `Invitado · ${role === "director" ? "Director" : role === "teacher" ? "Docente" : "Alumno"}`,
    email: "guest@demo.local",
    role,
    provider: "guest",
    avatar: "👤",
    createdAt: Date.now(),
  };
  // Guests are session-only — not persisted to users list.
  setSession(u);
  return u;
}

export function logout() {
  setSession(null);
}

// ---- Messaging ----

export function canMessage(fromId: string, toId: string): boolean {
  const from = getUsers().find((u) => u.id === fromId);
  const to = getUsers().find((u) => u.id === toId);
  if (!from || !to) return false;

  // Director puede messaging a todos
  if (from.role === "director") return true;

  // Teacher: puede messaging a director y a sus estudiantes
  if (from.role === "teacher") {
    if (to.role === "director") return true;
    if (to.role === "student") {
      const teacherGroups = getGroupsByTeacher(from.id);
      const fromGroupIds = teacherGroups.map((g) => g.id);
      return fromGroupIds.includes(to.group_id || "");
    }
    return false;
  }

  // Student: solo puede messaging a su teacher y director
  if (from.role === "student") {
    if (to.role === "director") return true;
    if (to.role === "teacher") {
      const fromUser = getUsers().find((u) => u.id === fromId);
      const group = getGroups().find((g) => g.id === fromUser?.group_id);
      return group?.teacher_id === toId;
    }
    return false;
  }

  return false;
}

export function sendMessage(fromId: string, toId: string, text: string): DemoMessage {
  if (!canMessage(fromId, toId)) {
    throw new Error("No tienes permiso para messaging a este usuario");
  }

  const msg: DemoMessage = {
    id: `m-${Math.random().toString(36).slice(2, 9)}`,
    fromId,
    toId,
    text: text.trim(),
    createdAt: Date.now(),
    readBy: [fromId],
  };
  setMessages([...getMessages(), msg]);
  return msg;
}

export function markConversationRead(meId: string, otherId: string) {
  const msgs = getMessages().map((m) =>
    m.fromId === otherId && m.toId === meId && !m.readBy.includes(meId)
      ? { ...m, readBy: [...m.readBy, meId] }
      : m,
  );
  setMessages(msgs);
}

export function unreadCountFor(userId: string): number {
  return getMessages().filter((m) => m.toId === userId && !m.readBy.includes(userId)).length;
}

export function conversationBetween(a: string, b: string): DemoMessage[] {
  return getMessages()
    .filter((m) => (m.fromId === a && m.toId === b) || (m.fromId === b && m.toId === a))
    .sort((x, y) => x.createdAt - y.createdAt);
}

export interface Institution {
  id: string;
  app_code: string;
  name: string;
  director_id: string;
  createdAt: number;
}

export interface DemoGroup {
  id: string;
  name: string;
  modulo: number;
  teacher_id: string;
  director_id: string;
  anio_escolar: string;
  capacidad: number;
  horario: string;
  status: "ACTIVO" | "INACTIVO";
  createdAt: number;
}

function getGroupsList(): DemoGroup[] {
  return read<DemoGroup[]>(K_GROUPS, []);
}

function setGroupsList(groups: DemoGroup[]) {
  write(K_GROUPS, groups);
}

export function getGroups(): DemoGroup[] {
  return getGroupsList();
}

export function getGroupsByTeacher(teacherId: string): DemoGroup[] {
  return getGroupsList().filter((g) => g.teacher_id === teacherId);
}

export function getGroupsByStudent(studentId: string): DemoGroup[] {
  const student = getUsers().find((u) => u.id === studentId);
  if (!student?.group_id) return [];
  return getGroupsList().filter((g) => g.id === student.group_id);
}

export function assignStudentToGroup(studentId: string, groupId: string): void {
  const users = getUsers().map((u) => (u.id === studentId ? { ...u, group_id: groupId } : u));
  setUsers(users);
}

export function createGroup(group: Omit<DemoGroup, "id" | "createdAt">): DemoGroup {
  const newGroup: DemoGroup = {
    ...group,
    id: `grp-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    status: group.status || "ACTIVO",
  };
  setGroupsList([...getGroupsList(), newGroup]);
  return newGroup;
}

export function updateGroup(id: string, updates: Partial<DemoGroup>): DemoGroup | null {
  const groups = getGroupsList().map((g) => (g.id === id ? { ...g, ...updates } : g));
  setGroupsList(groups);
  return groups.find((g) => g.id === id) || null;
}

export function deleteGroup(id: string): void {
  setGroupsList(getGroupsList().filter((g) => g.id !== id));
}

function getInstitutionCounter(): number {
  return read<number>(K_INSTITUTION_COUNTER, 0);
}

function setInstitutionCounter(n: number) {
  write(K_INSTITUTION_COUNTER, n);
}

function getUserAppCodeCounter(): number {
  return read<number>(K_USER_APP_CODE_COUNTER, 0);
}

function setUserAppCodeCounter(n: number) {
  write(K_USER_APP_CODE_COUNTER, n);
}

function getInstitutions(): Institution[] {
  return read<Institution[]>(K_INSTITUTIONS, []);
}

export function createInstitution(directorUser: DemoUser): Institution {
  const counter = getInstitutionCounter() + 1;
  setInstitutionCounter(counter);
  const app_code = `ITSP-${String(counter).padStart(4, "0")}`;
  const inst: Institution = {
    id: `inst-${app_code}`,
    app_code,
    name: `Institución ${app_code}`,
    director_id: directorUser.id,
    createdAt: Date.now(),
  };
  write(K_INSTITUTIONS, [...getInstitutions(), inst]);
  return inst;
}

export function getInstitutionByCode(code: string): Institution | null {
  return getInstitutions().find((i) => i.app_code === code) || null;
}

export function getInstitutionByDirector(directorId: string): Institution | null {
  return getInstitutions().find((i) => i.director_id === directorId) || null;
}

// ---- Google Sheets Persistence ----

export async function getInstitutionData(app_code: string) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!scriptUrl) return null;
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "getInstitution", app_code }),
    });
    const data = await response.json();
    return data.success ? data.data : null;
  } catch (err) {
    console.error("Error fetching institution:", err);
    return null;
  }
}

export async function updateInstitutionData(app_code: string, updates: any) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!scriptUrl) return { success: false, error: "No API URL" };
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "updateInstitution", app_code, updates }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    return { success: false, error: "Connection error" };
  }
}

export async function updateUserData(userId: string, updates: any) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!scriptUrl) return { success: false, error: "No API URL" };
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "updateUser", id: userId, updates }),
    });
    const data = await response.json();

    // Sincronizar sesión local si es el usuario actual
    const session = getSession();
    if (session && session.id === userId && data.success) {
      setSession({ ...session, ...updates });
    }

    return data;
  } catch (err) {
    return { success: false, error: "Connection error" };
  }
}

export async function getItemsData(category?: string) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!scriptUrl) return [];
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "getItems", category }),
    });
    const data = await response.json();
    return data.success ? data.data : [];
  } catch (err) {
    return [];
  }
}

export async function saveStatsData(stats: {
  user_id: string;
  metric: string;
  value: string | number;
}) {
  const scriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (!scriptUrl) return { success: false };
  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      body: JSON.stringify({ action: "saveStats", stats }),
    });
    const data = await response.json();
    return data;
  } catch (err) {
    return { success: false };
  }
}
