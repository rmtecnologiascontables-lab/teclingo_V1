const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyng--gILDcyPV-rpTCoUbrzc1bZzYR8BQ3iVPdtlIYgpI906M_5nBVXXWb2KmtVoU/exec";

async function runTest() {
  console.log("🚀 Iniciando prueba de conexión con el backend TecLingo...\n");

  try {
    // 1. Probar GET (Disponibilidad de la API)
    console.log("1️⃣  Verificando estado de la API (GET)...");
    const getRes = await fetch(SCRIPT_URL);
    const getText = await getRes.text();
    console.log("✅ Respuesta del servidor:", getText, "\n");

    // 2. Crear un usuario de prueba (POST)
    console.log("2️⃣  Enviando usuario de prueba (POST createUser)...");
    const testUser = {
      name: "Usuario de Prueba",
      email: "test.admin@teclingo.com", // Puedes cambiarlo si quieres probar el email real
      role: "student",
      password: "password123",
      app_code: "ITSP-TEST",
      institutionName: "TecNM Pánuco",
      carrera: "Ingeniería en Sistemas",
      semestre: "8",
      numeroControl: "TEST-" + Math.floor(Math.random() * 1000)
    };

    const postRes = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({
        action: 'createUser',
        user: testUser
      }),
      headers: { 'Content-Type': 'application/json' }
    });

    const postData = await postRes.json();
    
    if (postData.success) {
      console.log("✅ ¡Conexión exitosa! El backend guardó al usuario y devolvió esta estructura:");
      console.log(postData.data);
      console.log("\n🔍 Análisis de Columnas Frontend vs Backend:");
      
      const expectedColumns = ["id", "name", "email", "role", "app_code", "institutionName", "carrera", "semestre", "numeroControl", "password", "avatar_url", "created_at"];
      const receivedColumns = Object.keys(postData.data);
      
      let allMatch = true;
      expectedColumns.forEach(col => {
        if (!receivedColumns.includes(col)) {
          console.log(`❌ Falta mapear la columna: ${col}`);
          allMatch = false;
        } else {
          console.log(`✅ Columna emparejada correctamente: ${col}`);
        }
      });

      if (allMatch) {
        console.log("\n🎉 ¡Las columnas coinciden perfectamente! La base de datos y el front están 100% sincronizados.");
        console.log("👉 IMPORTANTE: Revisa tu Google Sheet, deberías ver la fila insertada.");
      }
    } else {
      console.log("❌ Error en el backend (ej. correo duplicado):", postData.error);
    }

  } catch (error) {
    console.error("💥 Error fatal de red:", error);
  }
}

runTest();
