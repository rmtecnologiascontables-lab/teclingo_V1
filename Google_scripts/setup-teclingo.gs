/**
 * TecLingo AI - Script de Configuración y Limpieza (Setup V2)
 * Este script organiza la base de datos eliminando redundancias y asegurando la integridad de las tablas.
 */

function setupDatabase() {
  const spreadsheetId = "1Fv8mFOVpO2ScZP-xP-imU2Ms1UtoJiKC4_RMsDSkZYQ";
  const ss = SpreadsheetApp.openById(spreadsheetId);
  
  // --- 0. 🦸 SUPERADMIN (si no existe) ---
  const sheetUsers = ss.getSheetByName("Usuarios");
  const superAdminEmail = "rmtecnologiascontables@gmail.com";
  let superAdminExists = false;
  if (sheetUsers) {
    const userData = sheetUsers.getDataRange().getValues();
    for (let i = 1; i < userData.length; i++) {
      if (userData[i][2] === superAdminEmail) {
        superAdminExists = true;
        break;
      }
    }
  }
  if (!superAdminExists && sheetUsers) {
    sheetUsers.appendRow([
      "id-superadmin",
      "RM SUPER ADMIN",
      superAdminEmail,
      "superadmin",
      "TECNM-4194",
      "RM TECNOLOGIAS CONTABLES",
      "", "", "superadmin2024", "", "", new Date().toISOString(), "Presencial", "", "", new Date().toISOString(), "ACTIVO", "", ""
    ]);
    Logger.log("Superadmin creado: " + superAdminEmail);
  }
  
  // --- 1. 🗄️ MAESTRO DE USUARIOS ---
  setupSheet(ss, "Usuarios", [
    "id", "name", "email", "role", "app_code", 
    "institutionName", "carrera", "semestre", "numeroControl", 
    "password", "avatar_url", "fecha_ingreso", "modalidad", 
    "phone", "domicilio", "created_at", "status", "group_id", "last_category_id"
  ], "#cfe2f3");

  // --- 2. 📚 MAESTRO DE ITEMS ---
  setupSheet(ss, "Items", [
    "id", "type", "title", "category", "content", "audio_url", "image_url", "difficulty", "created_at"
  ], "#d9ead3");

  // --- 3. 🏫 DATOS INSTITUCIONALES (Configuración del Director/CLE) ---
  setupSheet(ss, "Instituciones", [
    "app_code", "nombre_institucion", "unidad_academica", "direccion", "telefono", "director_name", "last_updated"
  ], "#fff2cc");

  // Insertamos la fila inicial del ITSP si la hoja está vacía
  const sheetInst = ss.getSheetByName("Instituciones");
  if (sheetInst.getLastRow() === 1) {
    sheetInst.appendRow([
      "TECNM-4194", 
      "ITSP (INSTITUTO TECNOLOGICO DE PANUCO)", 
      "CLE · Centro de Lenguas Extranjeras",
      "Av. México #123, Pánuco, Ver.",
      "' +52 876 543 210",
      "RM TECNOLOGIAS CONTABLES",
      new Date()
    ]);
  }

  // --- 4. 📈 ESTADISTICAS ---
  setupSheet(ss, "Estadisticas", [
    "id", "user_id", "metric", "value", "date"
  ], "#f4cccc");

  // --- 5. 📂 GRUPOS ---
  setupSheet(ss, "Grupos", [
    "id", "name", "modulo", "teacher_id", "director_id",
    "anio_escolar", "capacidad", "horario", "status", "created_at"
  ], "#e8d4e8");

  // --- 6. 💬 MENSAJES ---
  setupSheet(ss, "Mensajes", [
    "id", "fromId", "toId", "text", "createdAt", "readBy"
  ], "#d4e5f7");

  // --- 7. 📝 SOLICITUDES DE INSCRIPCIÓN ---
  setupSheet(ss, "Solicitudes", [
    "id", "codigo_inscripcion", "nombre", "email", "numero_control",
    "institutionName", "app_code", "status", "created_at", "aprobado_por", "aprobado_at"
  ], "#fef3c7");

  // --- 7. 🧹 LIMPIEZA DE HOJAS REDUNDANTES ---
  const redundantSheets = ["Alumnos", "Docentes", "Director"];
  redundantSheets.forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (sheet) {
      ss.deleteSheet(sheet);
      Logger.log("Eliminada hoja redundante: " + name);
    }
  });

  Logger.log("✅ Base de datos TecLingo consolidada y limpia.");
}

/**
 * Función auxiliar para crear/actualizar una hoja y sus cabeceras
 */
function setupSheet(ss, name, headers, color) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  
  // Sincronizar cabeceras sin borrar datos
  const currentHeaders = sheet.getLastColumn() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
  
  // Solo actualizamos si las cabeceras son diferentes o la hoja es nueva
  if (JSON.stringify(currentHeaders) !== JSON.stringify(headers)) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground(color);
    sheet.setFrozenRows(1);
  }
}