/**
 * Google Apps Script for TecLingo - Versión Institucional Final (V4)
 * Basado en tu código estable de 300 líneas.
 */

const CONFIG = {
  SPREADSHEET_ID: "1Fv8mFOVpO2ScZP-xP-imU2Ms1UtoJiKC4_RMsDSkZYQ",
  SUPERADMIN_EMAIL: "rmtecnologiascontables@gmail.com",
  FOLDERS: {
    AVATARS: "1lUEbFhXA9Mt_4TH8Xwiq-epRiqCFnrzp",
    IMAGES: "1gKFgMilPox4Kk5N0b3WowCqf6mDzAKSw",
    AUDIOS: "1W0wcYhSqx8HW-aKnxvYa0kbVDrz0PpDH",
  },
  SHEETS: {
    USUARIOS: "Usuarios",
    ITEMS: "Items",
    ESTADISTICAS: "Estadisticas",
    INSTITUCIONES: "Instituciones",
    GRUPOS: "Grupos",
    MENSAJES: "Mensajes",
    SOLICITUDES: "Solicitudes",
  },
};

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "TecLingo API is active!" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  const postData = JSON.parse(e.postData.contents);
  const action = postData.action;
  const data = postData;

  try {
    let result;
    switch (action) {
      case "getUsers": result = getUsers(); break;
      case "createUser": result = createUser(data.user); break;
      case "updateUser": result = updateUser(data.id, data.updates); break;
      case "deleteUser": result = deleteUser(data.id); break;
      case "getItems": result = getItems(data.category); break;
      case "createItem": result = createItem(data.item); break;
      case "uploadFile": result = uploadFile(data); break;
      case "getStats": result = getStats(data.userId); break;
      case "saveStats": result = saveStats(data.stats); break;
      case "getInstitution": result = getInstitution(data.app_code); break;
      case "updateInstitution": result = updateInstitution(data.app_code, data.updates); break;
      case "sendWelcomeEmail": result = sendWelcomeEmail(data); break;
      case "getFileBase64": result = getFileBase64(data.fileId); break;
      case "getGroups": result = getGroups(data.filters); break;
      case "createGroup": result = createGroup(data.group); break;
      case "updateGroup": result = updateGroup(data.id, data.updates); break;
      case "deleteGroup": result = deleteGroup(data.id); break;
      case "assignStudentToGroup": result = assignStudentToGroup(data.studentId, data.groupId); break;
      case "getStudentsByGroup": result = getStudentsByGroup(data.groupId); break;
      case "canMessage": result = canMessage(data.fromRole, data.toRole, data.fromId, data.toId); break;
      case "getMessagesByUser": result = getMessagesByUser(data.userId); break;
      case "getConversation": result = getConversation(data.userId1, data.userId2); break;
      case "createMessage": result = createMessage(data.message); break;
      case "markMessageRead": result = markMessageRead(data.messageId, data.userId); break;
      case "getUnreadCount": result = getUnreadCount(data.userId); break;
      case "createSolicitud": result = createSolicitud(data.solicitud); break;
      case "getSolicitudes": result = getSolicitudes(data.filters); break;
      case "approveSolicitud": result = approveSolicitud(data.id, data.aprobado_por); break;
      case "rejectSolicitud": result = rejectSolicitud(data.id, data.aprobado_por); break;
      default: throw new Error("Unknown action: " + action);
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheet(sheetName) {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(sheetName);
}

function generateId() {
  return "id-" + Utilities.getUuid();
}

function getUsers() {
  try {
    const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    return data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
  } catch (e) {
    return [];
  }
}

function createUser(user) {
  const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  const existingUsers = getUsers();
  
  if (existingUsers.some(u => u.email.toString().toLowerCase() === user.email.toString().toLowerCase())) {
    throw new Error("Este correo electrónico ya está registrado.");
  }
  
  if (user.numeroControl && user.numeroControl.trim() !== "") {
    if (existingUsers.some(u => u.numeroControl === user.numeroControl.trim())) {
      throw new Error("Este número de control ya está en uso por otro alumno.");
    }
  }

  const id = user.id || generateId();
  const created_at = user.created_at || new Date().toISOString();
  
  const row = [
    id, user.name, user.email, user.role, user.app_code || "",
    user.institutionName || "", user.carrera || "", user.semestre || "",
    user.numeroControl || "", user.password || "", user.avatar_url || "", 
    user.fecha_ingreso || "", user.modalidad || "", 
    user.phone || "", user.domicilio || "", 
    created_at,
    user.status || "ACTIVO",
    user.last_category_id || ""
  ];
  sheet.appendRow(row);
  
  try {
    sendWelcomeEmail({
      name: user.name,
      email: user.email,
      role: user.role,
      app_code: user.app_code || "N/A"
    });
  } catch (e) {
    Logger.log("Email error: " + e.message);
  }
  
  return { id, ...user, created_at };
}

function updateUser(id, updates) {
  const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      headers.forEach((h, j) => {
        if (updates[h] !== undefined) {
          // Usamos setValue directamente para mayor precisión
          sheet.getRange(i + 1, j + 1).setValue(updates[h]);
        }
      });
      return { id, ...updates };
    }
  }
  throw new Error("User not found");
}

function deleteUser(id) {
  const sheet = getSheet(CONFIG.SHEETS.USUARIOS);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("User not found");
}

function getItems(category) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ITEMS);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    let items = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });
    
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    return items;
  } catch (e) {
    return [];
  }
}

function createItem(item) {
  const sheet = getSheet(CONFIG.SHEETS.ITEMS);
  const id = generateId();
  const created_at = new Date().toISOString();
  
  const row = [id, item.title, item.description, item.type, item.url || "", item.category, created_at];
  sheet.appendRow(row);
  
  return { id, ...item, created_at };
}

function uploadFile(data) {
  const { fileName, mimeType, data: fileData, folderType } = data;
  
  let folderId;
  switch (folderType) {
    case "avatars": folderId = CONFIG.FOLDERS.AVATARS; break;
    case "images": folderId = CONFIG.FOLDERS.IMAGES; break;
    case "audios": folderId = CONFIG.FOLDERS.AUDIOS; break;
    default: throw new Error("Invalid folder type");
  }
  
  const folder = DriveApp.getFolderById(folderId);
  const blob = Utilities.newBlob(Utilities.base64Decode(fileData), mimeType, fileName);
  const file = folder.createFile(blob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  
  const fileId = file.getId();
  // El formato lh3 debe ser limpio (sin parámetros extra) para evitar Error 400
  const directLink = "https://lh3.googleusercontent.com/d/" + fileId;
  
  return {
    id: fileId,
    url: directLink,
    webViewLink: file.getUrl()
  };
}

function getFileBase64(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    const blob = file.getBlob();
    const base64 = Utilities.base64Encode(blob.getBytes());
    return "data:" + blob.getContentType() + ";base64," + base64;
  } catch (e) {
    return null;
  }
}

function getStats(userId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.ESTADISTICAS);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    let stats = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });
    
    if (userId) {
      stats = stats.filter(s => s.user_id === userId);
    }
    
    return stats;
  } catch (e) {
    return [];
  }
}

function saveStats(stats) {
  const sheet = getSheet(CONFIG.SHEETS.ESTADISTICAS);
  const id = generateId();
  const date = stats.date || new Date().toISOString();
  
  const row = [id, stats.user_id, stats.metric, stats.value, date];
  sheet.appendRow(row);
  
  return { id, ...stats, date };
}

function getInstitution(app_code) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.INSTITUCIONES);
    if (!sheet) return null;
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === app_code) {
        const obj = {};
        headers.forEach((h, j) => obj[h] = data[i][j]);
        return obj;
      }
    }
    return data.length > 1 ? { [headers[0]]: data[1][0] } : null;
  } catch (e) { return null; }
}

function updateInstitution(app_code, updates) {
  const sheet = getSheet(CONFIG.SHEETS.INSTITUCIONES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === app_code) {
      headers.forEach((h, j) => {
        if (updates[h] !== undefined) sheet.getRange(i + 1, j + 1).setValue(updates[h]);
      });
      const lastUpdatedIdx = headers.indexOf("last_updated");
      if (lastUpdatedIdx !== -1) sheet.getRange(i + 1, lastUpdatedIdx + 1).setValue(new Date());
      return { app_code, ...updates };
    }
  }
  throw new Error("Institución no encontrada");
}

function sendWelcomeEmail(userData) {
  const name = userData.name || "Usuario";
  const email = userData.email;
  const role = userData.role || "Estudiante";
  const app_code = userData.app_code || "N/A";

  if (!email) return;

  const subject = "¡Bienvenido a TecLingo del ITSP - TecNM! 🚀";
  const qrUrl = `https://quickchart.io/qr?text=${encodeURIComponent(app_code)}&size=200`;

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #0b5394; text-align: center;">¡Felicidades y Bienvenido, ${name}! 🎉</h2>
      <p style="font-size: 16px; color: #333; line-height: 1.5;">Estamos muy emocionados de tenerte en <strong>TecLingo</strong>.</p>
      <div style="background-color: #f3f6f9; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <img src="${qrUrl}" alt="QR Code ID" style="width: 150px; height: 150px;" />
        <p style="font-size: 22px; font-weight: bold; margin: 15px 0;">${app_code}</p>
        <p>Perfil: <strong>${role}</strong></p>
      </div>
      <p>Mucho éxito,<br><strong>El Equipo de TecLingo - ITSP TecNM</strong></p>
    </div>
  `;

  MailApp.sendEmail({
    to: email,
    subject: subject,
    htmlBody: htmlBody,
    name: "TecLingo ITSP - TecNM"
  });
}

// ============ GESTIÓN DE GRUPOS ============

function getGroups(filters) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.GRUPOS);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    let groups = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });

    if (filters) {
      if (filters.modulo) groups = groups.filter(g => g.modulo == filters.modulo);
      if (filters.teacher_id) groups = groups.filter(g => g.teacher_id === filters.teacher_id);
      if (filters.director_id) groups = groups.filter(g => g.director_id === filters.director_id);
      if (filters.anio_escolar) groups = groups.filter(g => g.anio_escolar === filters.anio_escolar);
    }

    return groups;
  } catch (e) { return []; }
}

function createGroup(group) {
  const sheet = getSheet(CONFIG.SHEETS.GRUPOS);
  const existing = getGroups({ modulo: group.modulo, anio_escolar: group.anio_escolar });
  const countInModulo = existing.filter(g => g.modulo == group.modulo).length + 1;

  if (countInModulo > 8) {
    throw new Error("Máximo 8 grupos por módulo alcanzado.");
  }

  const id = "grp-" + Utilities.getUuid().substring(0, 8);
  const created_at = new Date().toISOString();
  const name = group.name || `Grupo ${countInModulo} - Módulo ${group.modulo}`;

  const row = [
    id, name, group.modulo, group.teacher_id || "", group.director_id || "",
    group.anio_escolar || "2025-2026", group.capacidad || 25,
    group.horario || "", "ACTIVO", created_at
  ];

  sheet.appendRow(row);
  return { id, ...group, name, created_at };
}

function updateGroup(id, updates) {
  const sheet = getSheet(CONFIG.SHEETS.GRUPOS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      headers.forEach((h, j) => {
        if (updates[h] !== undefined) {
          sheet.getRange(i + 1, j + 1).setValue(updates[h]);
        }
      });
      return { id, ...updates };
    }
  }
  throw new Error("Grupo no encontrado");
}

function deleteGroup(id) {
  const sheet = getSheet(CONFIG.SHEETS.GRUPOS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
  throw new Error("Grupo no encontrado");
}

function assignStudentToGroup(studentId, groupId) {
  const studentSheet = getSheet(CONFIG.SHEETS.USUARIOS);
  const data = studentSheet.getDataRange().getValues();
  const headers = data[0];
  const groupIdIdx = headers.indexOf("group_id");

  if (groupIdIdx === -1) {
    throw new Error("La columna group_id no existe en la hoja de Usuarios");
  }

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === studentId) {
      studentSheet.getRange(i + 1, groupIdIdx + 1).setValue(groupId);
      return { studentId, groupId };
    }
  }
  throw new Error("Estudiante no encontrado");
}

function getStudentsByGroup(groupId) {
  const users = getUsers();
  return users.filter(u => u.group_id === groupId && u.role === "student");
}

function getGroupsByStudent(studentId) {
  const user = getUsers().find(u => u.id === studentId);
  if (!user || !user.group_id) return [];
  return getGroups({ teacher_id: user.group_id });
}

// ============ MENSAJERÍA ============

function getMessagesByUser(userId) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.MENSAJES);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const messages = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });

    return messages.filter(m => m.fromId === userId || m.toId === userId);
  } catch (e) { return []; }
}

function getConversation(userId1, userId2) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.MENSAJES);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    const messages = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });

    return messages.filter(m =>
      (m.fromId === userId1 && m.toId === userId2) ||
      (m.fromId === userId2 && m.toId === userId1)
    ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } catch (e) { return []; }
}

function createMessage(msg) {
  const sheet = getSheet(CONFIG.SHEETS.MENSAJES);

  // TODO: Implementar verificación de permisos cuando los IDs de sesión coincidan con Google Sheets
  // Temporalmente permitimos todos los mensajes para pruebas
  // const fromUser = getUsers().find(u => u.id === msg.fromId);
  // const toUser = getUsers().find(u => u.id === msg.toId);
  // if (!fromUser || !toUser) { throw new Error("Usuario no encontrado"); }
  // const canSend = canMessage(fromUser.role, toUser.role, msg.fromId, msg.toId);
  // if (!canSend) { throw new Error("No tienes permiso para enviar mensajes a este usuario"); }

  const id = "msg-" + Utilities.getUuid().substring(0, 12);
  const createdAt = new Date().toISOString();

  const row = [
    id, msg.fromId, msg.toId, msg.text, createdAt, msg.fromId // readBy
  ];

  sheet.appendRow(row);

  return { id, ...msg, createdAt, readBy: [msg.fromId] };
}

function markMessageRead(messageId, userId) {
  const sheet = getSheet(CONFIG.SHEETS.MENSAJES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const readByIdx = headers.indexOf("readBy");

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === messageId) {
      const currentReadBy = data[i][readByIdx] || "";
      const readArr = currentReadBy ? currentReadBy.split(",") : [];

      if (!readArr.includes(userId)) {
        readArr.push(userId);
        sheet.getRange(i + 1, readByIdx + 1).setValue(readArr.join(","));
      }
      return { success: true };
    }
  }
  throw new Error("Mensaje no encontrado");
}

function getUnreadCount(userId) {
  const messages = getMessagesByUser(userId);
  return messages.filter(m =>
    m.toId === userId &&
    (!m.readBy || !m.readBy.split(",").includes(userId))
  ).length;
}

// ============ RESTRICCIONES DE MENSAJERÍA ============

function canMessage(fromRole, toRole, fromId, toId) {
  // Director puede messaging a todos
  if (fromRole === "director") return true;

  // Teacher puede messaging a director y sus estudiantes
  if (fromRole === "teacher") {
    if (toRole === "director") return true;
    if (toRole === "student") {
      const teacherStudents = getUsers().filter(u =>
        u.role === "student" && u.group_id &&
        getGroups().some(g => g.teacher_id === fromId && g.id === u.group_id)
      );
      return teacherStudents.some(s => s.id === toId);
    }
    return false;
  }

  // Student solo puede messaging a su teacher y director
  if (fromRole === "student") {
    if (toRole === "director") return true;
    if (toRole === "teacher") {
      const user = getUsers().find(u => u.id === fromId);
      const group = user?.group_id ? getGroups().find(g => g.id === user.group_id) : null;
      return group?.teacher_id === toId;
    }
    return false;
  }

  return false;
}

// ============ SOLICITUDES DE INSCRIPCIÓN ============

function createSolicitud(solicitud) {
  const sheet = getSheet(CONFIG.SHEETS.SOLICITUDES);
  
  // Verificar si email ya tiene solicitud pendiente o aprobada
  const existing = getSolicitudes({ email: solicitud.email });
  const active = existing.filter(s => s.status === "pendiente" || s.status === "aprobado");
  if (active.length > 0) {
    throw new Error("Ya existe una solicitud activa para este email.");
  }
  
  const id = "sol-" + Utilities.getUuid().substring(0, 8);
  const codigo_inscripcion = "INS-" + new Date().getFullYear() + "-" + Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  const created_at = new Date().toISOString();
  
  const row = [
    id, 
    codigo_inscripcion, 
    solicitud.nombre, 
    solicitud.email, 
    solicitud.numero_control || "",
    solicitud.institutionName || "ITSP (INSTITUTO TECNOLOGICO DE PANUCO)", 
    solicitud.app_code || "TECNM-4194",
    "pendiente",
    created_at,
    "",
    ""
  ];
  
  sheet.appendRow(row);
  
  // Enviar email al superadmin
  sendSolicitudEmailToAdmin({
    nombre: solicitud.nombre,
    email: solicitud.email,
    numero_control: solicitud.numero_control,
    institutionName: solicitud.institutionName,
    app_code: solicitud.app_code || "TECNM-4194",
    codigo_inscripcion: codigo_inscripcion
  });
  
  // Enviar email al estudiante confirmando solicitud recibida
  sendSolicitudRecibidaEmail({
    nombre: solicitud.nombre,
    email: solicitud.email,
    codigo_inscripcion: codigo_inscripcion
  });
  
  return { id, codigo_inscripcion, ...solicitud, status: "pendiente", created_at };
}

function getSolicitudes(filters) {
  try {
    const sheet = getSheet(CONFIG.SHEETS.SOLICITUDES);
    if (!sheet) return [];
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    
    let solicitudes = data.slice(1).filter(row => row[0]).map(row => {
      const obj = {};
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });
    
    if (filters) {
      if (filters.status) solicitudes = solicitudes.filter(s => s.status === filters.status);
      if (filters.email) solicitudes = solicitudes.filter(s => s.email === filters.email);
      if (filters.id) solicitudes = solicitudes.filter(s => s.id === filters.id);
    }
    
    return solicitudes;
  } catch (e) {
    return [];
  }
}

function approveSolicitud(id, aprobado_por) {
  const sheet = getSheet(CONFIG.SHEETS.SOLICITUDES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      // Actualizar solicitud
      sheet.getRange(i + 1, 8).setValue("aprobado"); // status
      sheet.getRange(i + 1, 10).setValue(aprobado_por); // aprobado_por
      sheet.getRange(i + 1, 11).setValue(new Date()); // aprobado_at
      
      // Obtener datos para crear usuario
      const codigo_inscripcion = data[i][1]; // codigo_inscripcion
      const nombre = data[i][2]; // nombre
      const email = data[i][3]; // email
      const numero_control = data[i][4]; // numero_control
      const institutionName = data[i][5]; // institutionName
      const app_code = data[i][6]; // app_code
      
      // Crear usuario automáticamente
      const newUser = createUser({
        name: nombre,
        email: email,
        role: "student",
        app_code: app_code,
        institutionName: institutionName,
        numeroControl: numero_control,
        password: codigo_inscripcion
      });
      
      // Enviar email de bienvenida
      sendWelcomeEmail({
        name: nombre,
        email: email,
        role: "student",
        app_code: app_code
      });
      
      // Enviar email de aprobación
      sendApprovalEmail({
        nombre: nombre,
        email: email,
        codigo_inscripcion: codigo_inscripcion
      });
      
      return { success: true, user: newUser };
    }
  }
  throw new Error("Solicitud no encontrada");
}

function rejectSolicitud(id, aprobado_por) {
  const sheet = getSheet(CONFIG.SHEETS.SOLICITUDES);
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 8).setValue("rechazado");
      sheet.getRange(i + 1, 10).setValue(aprobado_por);
      sheet.getRange(i + 1, 11).setValue(new Date());
      return { success: true };
    }
  }
  throw new Error("Solicitud no encontrada");
}

function sendSolicitudEmailToAdmin(data) {
  const subject = "Nueva Solicitud de Inscripción - TecLingo";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
      <h2 style="color: #0b5394; text-align: center;">📝 Nueva Solicitud de Inscripción</h2>
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Nombre:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.nombre}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Email:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Número de Control:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.numero_control || "N/A"}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Institución:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.institutionName}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>App Code:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd;">${data.app_code}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; background: #f9f9f9;"><strong>Código de Inscripción:</strong></td>
          <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #0b5394;">${data.codigo_inscripcion}</td>
        </tr>
      </table>
      <p style="margin-top: 20px; text-align: center;">
        <a href="https://teclingov1.rmtecnologiascontables.workers.dev/superadmin" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Ir al Panel de Superadmin</a>
      </p>
    </div>
  `;

  MailApp.sendEmail({
    to: CONFIG.SUPERADMIN_EMAIL,
    subject: subject,
    htmlBody: htmlBody,
    name: "TecLingo - Sistema de Inscripción"
  });
}

function sendSolicitudRecibidaEmail(data) {
  const subject = "📝 Tu solicitud de inscripción ha sido recibida - TecLingo";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #f59e0b; border-radius: 10px;">
      <h2 style="color: #f59e0b; text-align: center;">📝 Solicitud Recibida</h2>
      <p style="font-size: 16px; color: #333;">Hola <strong>${data.nombre}</strong>,</p>
      <p style="color: #333;">Tu solicitud de inscripción ha sido recibida exitosamente.</p>
      <div style="background-color: #f3f6f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; margin: 5px 0;"><strong>Número de Solicitud:</strong> <span style="color: #0b5394; font-weight: bold;">${data.codigo_inscripcion}</span></p>
      </div>
      <p style="color: #333;">Tu solicitud está siendo revisada. Recibirás un correo confirmando la aprobación una vez que sea procesada.</p>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">Equipo TecLingo - ITSP TecNM</p>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
    name: "TecLingo ITSP - TecNM"
  });
}

function sendApprovalEmail(data) {
  const subject = "✅ Tu inscripción ha sido aprobada - TecLingo";
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #10b981; border-radius: 10px;">
      <h2 style="color: #10b981; text-align: center;">¡Felicidades! Tu inscripción ha sido aprobada 🎉</h2>
      <p style="font-size: 16px; color: #333;">Hola <strong>${data.nombre}</strong>,</p>
      <p style="color: #333;">Tu solicitud de inscripción ha sido aprobada. Ahora puedes acceder a la plataforma TecLingo.</p>
      <div style="background-color: #f3f6f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="font-size: 14px; margin: 5px 0;"><strong>Código de Inscripción:</strong> <span style="color: #0b5394; font-weight: bold;">${data.codigo_inscripcion}</span></p>
        <p style="font-size: 14px; margin: 5px 0; color: #666;">Guarda este código para tus registros.</p>
      </div>
      <p style="text-align: center; margin-top: 20px;">
        <a href="https://teclingov1.rmtecnologiascontables.workers.dev/login" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ir a Iniciar Sesión</a>
      </p>
      <p style="margin-top: 20px; color: #666; font-size: 12px;">Equipo TecLingo - ITSP TecNM</p>
    </div>
  `;

  MailApp.sendEmail({
    to: data.email,
    subject: subject,
    htmlBody: htmlBody,
    name: "TecLingo ITSP - TecNM"
  });
}
