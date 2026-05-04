/**
 * Google Apps Script for TecLingo - Versión Institucional Final (V4)
 * Basado en tu código estable de 300 líneas.
 */

const CONFIG = {
  SPREADSHEET_ID: "1Fv8mFOVpO2ScZP-xP-imU2Ms1UtoJiKC4_RMsDSkZYQ",
  FOLDERS: {
    AVATARS: "1lUEbFhXA9Mt_4TH8Xwiq-epRiqCFnrzp",
    IMAGES: "1gKFgMilPox4Kk5N0b3WowCqf6mDzAKSw",
    AUDIOS: "1W0wcYhSqx8HW-aKnxvYa0kbVDrz0PpDH",
  },
  SHEETS: {
    USUARIOS: "Usuarios",
    ITEMS: "Items",
    ESTADISTICAS: "Estadisticas",
    INSTITUCIONES: "Instituciones", // <--- NUEVO
  },
};

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "TecLingo API is active and running smoothly! 🚀" }))
    .setMimeType(ContentService.MimeType.JSON);
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
      case "getInstitution": result = getInstitution(data.app_code); break; // <--- NUEVO
      case "updateInstitution": result = updateInstitution(data.app_code, data.updates); break; // <--- NUEVO
      case "sendWelcomeEmail": result = sendWelcomeEmail(data); break; 
      case "getFileBase64": result = getFileBase64(data.fileId); break; // <--- NUEVO PUENTE
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
