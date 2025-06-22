#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <ESP32QRCodeReader.h>
#include <SD_MMC.h>
#include <esp32cam.h>
#include <FS.h>
#include <HTTPClient.h>
#include "functions.h"
#include <WiFiClientSecure.h>

#include <mbedtls/md.h>
#include <mbedtls/base64.h>

#define WIFI_SSID "SCOTT"
#define WIFI_PASS "08696037"
#define FLASH_LED_PIN 41
#define LOG_USED_TOKENS "/used_tokens.txt"
#define LOG_INVALID_TOKENS "/invalid_tokens.txt"

using namespace std;

String BACKEND_URL = "https://dtaquito-backend.azurewebsites.net"
                     "/api/v1/reservations/use-qr-token?token=";
const String SECRET_KEY = "WriteHereYourSecretStringForTokenSigningCredentials";
const String ESP32_DEVKIT_URL_SUCCESS = "http://192.168.1.38/led/success";
const String ESP32_DEVKIT_URL_FAIL = "http://192.168.1.38/led/fail";
const String TOKEN_FILE = "/used_local_tokens.txt";


bool scanningEnabled = true;

WebServer server(80);
ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
String lastPayload = "";
String logBuffer = "";

void saveDataToSD(String data) {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_APPEND);
  if (file) {
    file.println(data);
    file.close();
    appendLog("Data guardado en SD" + data);
    Serial.println("Data guardada en SD: " + data);
  } else {
    Serial.println("Error al abrir el archivo");
    appendLog("Error al abrir el archivo");

  }
}

void loadUsedLocalTokens() {
  usedTokens.clear();

  File file = SD_MMC.open("/used_tokens.txt", FILE_READ);
  if (!file) {
    Serial.println("No se encontró el archivo used_tokens.txt");
    return;
  }

  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() > 0) {
      usedTokens.push_back(line);
    }
  }
  file.close();
  // appendLog("Tokens usados cargados en memoria.");
  Serial.println("Tokens usados cargados en memoria.");
}

bool isTokenInMemory(String token) {
  for (const String& t : usedTokens) {
    if (t == token) return true;
  }
  return false;
}

String getJwtPayload(const String &token) {
  int firstDot  = token.indexOf('.');
  int secondDot = token.indexOf('.', firstDot + 1);
  if (firstDot < 0 || secondDot < 0) return "";

  String payloadB64 = token.substring(firstDot + 1, secondDot);
  payloadB64 += String("==").substring(0, (4 - payloadB64.length() % 4) % 4);
  payloadB64.replace('-', '+');
  payloadB64.replace('_', '/');

  static unsigned char outBuf[512];
  size_t outLen = 0;
  int rc = mbedtls_base64_decode(
    outBuf, sizeof(outBuf), &outLen,
    (const unsigned char*)payloadB64.c_str(), payloadB64.length()
  );
  if (rc != 0) return "";

  return String((char*)outBuf, outLen);
}

bool isTokenUsed(String token) {
  File file = SD_MMC.open("/used_tokens.txt", FILE_READ);
  if (!file) return false;

  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line == token) {
      file.close();
      return true;
    }
  }
  file.close();
  return false;
}

String validateWithBackend(String token) {
  String fullURL = BACKEND_URL + token;

  Serial.println("Enviando token al backend: " + fullURL);
  appendLog("Enviando token al backend: " + fullURL);

  HTTPClient http;
  http.begin(fullURL);
  Serial.println(fullURL);
  http.setTimeout(5000);

  int httpCode = http.POST("");
  http.end();

  if (httpCode == 200) {
    return "ok";
  } else if (httpCode == 401) {
    appendLog("Prohibido (401 Unauthorized)");
    Serial.println("Prohibido (401 Unauthorized)");
    return "forbidden";
  } else if (httpCode == 403 || httpCode == 503) {
    appendLog("Servicio no disponible (HTTP " + String(httpCode) + ")");
    Serial.println("Servicio no disponible (HTTP " + String(httpCode) + ")");
    return "timeout";
  } else if (httpCode >= 500) {
    appendLog("Error servidor 5xx: " + String(httpCode));
    Serial.println("Error servidor 5xx: " + String(httpCode));
    return "timeout";
  } else {
    appendLog("Error genérico (HTTP " + String(httpCode) + ")");
    Serial.println("Error genérico (HTTP " + String(httpCode) + ")");
    return "error";
  }
}

bool decodeJWT(String token) {
  int firstDot  = token.indexOf('.');
  int secondDot = token.indexOf('.', firstDot + 1);
  if (firstDot < 0 || secondDot < 0) {
    appendLog("Formato de token inválido");
    Serial.println("Formato de token inválido");
    return false;
  }

  String headerB64    = token.substring(0, firstDot);
  String payloadB64   = token.substring(firstDot + 1, secondDot);
  String signatureB64 = token.substring(secondDot + 1);
  String dataToSign   = headerB64 + "." + payloadB64;

  uint8_t hmacResult[32];

  mbedtls_md_context_t ctx;
  const mbedtls_md_info_t* info = mbedtls_md_info_from_type(MBEDTLS_MD_SHA256);
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, info, 1);
  mbedtls_md_hmac_starts(&ctx, (const unsigned char*)SECRET_KEY.c_str(), SECRET_KEY.length());
  mbedtls_md_hmac_update(&ctx, (const unsigned char*)dataToSign.c_str(), dataToSign.length());
  mbedtls_md_hmac_finish(&ctx, hmacResult);
  mbedtls_md_free(&ctx);

  unsigned char sigOut[64];
  size_t sigOutLen = 0;
  int rc = mbedtls_base64_encode(sigOut, sizeof(sigOut), &sigOutLen, hmacResult, sizeof(hmacResult));
  if (rc != 0) {
    appendLog("Error al codificar Base64 firma: %d\n");
    Serial.printf("Error al codificar Base64 firma: %d\n", rc);
    return false;
  }
  String signatureCalcB64 = String((char*)sigOut, sigOutLen);

  signatureCalcB64.replace('+','-');
  signatureCalcB64.replace('/','_');
  while (signatureCalcB64.endsWith("=")) signatureCalcB64.remove(signatureCalcB64.length()-1);

  if (signatureB64 != signatureCalcB64) {
    appendLog("Firma JWT inválida");
    Serial.println("Firma JWT inválida");
    return false;
  }

  payloadB64 += String("==").substring(0,(4 - payloadB64.length()%4)%4);
  payloadB64.replace('-','+');
  payloadB64.replace('_','/');
  unsigned char outBuf[512];
  size_t outLen = 0;
  rc = mbedtls_base64_decode(outBuf, sizeof(outBuf), &outLen,
                             (const unsigned char*)payloadB64.c_str(), payloadB64.length());
  if (rc != 0) {
    appendLog("Error al decodificar Base64 payload: %d\n");
    Serial.printf("Error al decodificar Base64 payload: %d\n", rc);
    return false;
  }

  String payloadJson = String((char*)outBuf, outLen);
  Serial.println("JWT válido. Payload:");
  Serial.println(payloadJson);
  appendLog("JWT válido. Payload:");
  appendLog(payloadJson);
  return true;
}

void saveUsedLocalToken(String token) {
  File file = SD_MMC.open("/used_tokens.txt", FILE_APPEND);
  if (file) {
    file.println(token);
    file.close();
    usedTokens.push_back(token);
    Serial.println("Token guardado en used_tokens.txt: " + token);
    appendLog("Token guardado en used_tokens.txt: " + token);
  } else {
    Serial.println("Error al guardar el token en used_tokens.txt");
    appendLog("Error al guardar el token en used_tokens.txt");
  }
}

void loadInvalidLocalTokens() {
  File f = SD_MMC.open("/invalid_tokens.txt", FILE_READ);
  if (!f) return;
  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length()) invalidTokens.push_back(line);
  }
  f.close();
}

void saveInvalidLocalToken(const String& token) {
  invalidTokens.push_back(token);
  File f = SD_MMC.open("/invalid_tokens.txt", FILE_APPEND);
  if (!f) {
    Serial.println("Error abriendo invalid_tokens.txt");
    return;
  }
  f.println(token);
  f.close();
}

bool removeTokenFromSD(String tokenToRemove) {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_READ);
  if (!file) return false;

  String newContent = "";
  while (file.available()) {
    String line = file.readStringUntil('\n');
    line.trim();
    if (line.length() > 0 && line != tokenToRemove) {
      newContent += line + "\n";
    }
  }
  file.close();

  file = SD_MMC.open("/qrcode_data.txt", FILE_WRITE);
  if (!file) return false;
  file.print(newContent);
  file.close();
  return true;
}

void processToken(String token) {
  token.trim();
  if (token.length() == 0) return;

  Serial.println("Procesando token: " + token);
  appendLog("Procesando token: " + token);

  if (isTokenUsed(token)) {
    Serial.println("Token ya fue usado localmente: " + token);
    appendLog("Token ya fue usado localmente: " + token);
    return;
  }

  String result = validateWithBackend(token);

  if (result == "ok") {
    logTokenToFile(LOG_USED_TOKENS, "Usado", token);
    Serial.println("Token validado por backend.");
    appendLog("Token validado por backend.");
  } 
  else if (result == "timeout" || result == "error") {
    if (decodeJWT(token)) {
      Serial.println("Token válido localmente (JWT).");
      appendLog("Token válido localmente (JWT).");
      logTokenToFile(LOG_USED_TOKENS, "Usado", token);
      saveUsedLocalToken(token);
    } else {
      Serial.println("Token inválido localmente.");
      logTokenToFile(LOG_INVALID_TOKENS, "Rechazado (401 Unauthorized)", token);
      appendLog("Token inválido localmente.");
    }
  } 
  else {
    Serial.println("Token rechazado por backend.");
    logTokenToFile(LOG_INVALID_TOKENS, "Rechazado (401 Unauthorized)", token);
    appendLog("Token rechazado por backend.");
  }
}

void resendTokensFromSD() {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_READ);
  if (!file) {
    Serial.println("No hay tokens para reintentar.");
    appendLog("No hay tokens para reintentar.");
    return;
  }

  vector<String> tokensToKeep;

  while (file.available()) {
    String token = file.readStringUntil('\n');
    token.trim();
    if (token.length() == 0) continue;

    Serial.println("Reintentando token: " + token);
    appendLog("Reintentando token: " + token);

    String url = BACKEND_URL;
    url.reserve(512);
    url += token;

    HTTPClient http;
    http.begin(url);
    http.setTimeout(5000);
    int code = http.POST("");
    http.end();

    if (code == 200) {
      Serial.println("Token aceptado en reintento: " + token);
      appendLog("Token aceptado en reintento: " + token);
    } else {
      Serial.println("Sigue fallando, lo mantenemos: " + token);
      appendLog("Sigue fallando, lo mantenemos: " + token);
      tokensToKeep.push_back(token);
    }
  }
  file.close();

  File wf = SD_MMC.open("/qrcode_data.txt", FILE_WRITE);
  if (!wf) {
    Serial.println("Error al abrir qrcode_data.txt para actualizar.");
    appendLog("Error al abrir qrcode_data.txt para actualizar.");
    return;
  }
  for (auto &t : tokensToKeep) {
    wf.println(t);
  }
  wf.close();
  Serial.println("Archivo de reintento actualizado.");
  appendLog("Archivo de reintento actualizado.");
}

void onQrCodeTask(void *pvParameters) {
  struct QRCodeData qrCodeData;
  HTTPClient httpDev;

  unsigned long lastScanTime = 0;

  while (true) {
    unsigned long currentTime = millis();

    if (!scanningEnabled) {
      vTaskDelay(500 / portTICK_PERIOD_MS);
      continue;
    }

    if (currentTime - lastScanTime < 1000) {
      vTaskDelay(50 / portTICK_PERIOD_MS);
      continue;
    }


    if (reader.receiveQrCode(&qrCodeData, 100) && qrCodeData.valid) {
      String payload = String((const char*)qrCodeData.payload);

      if (payload.startsWith("http")) {
        appendLog("QR inválido o no es un token: " + payload);
        saveInvalidLocalToken(payload);
        Serial.println("QR inválido o no es un token: " + payload);
        vTaskDelay(100 / portTICK_PERIOD_MS);
        continue;
      }

      if (payload == lastPayload) {
        appendLog("QR repetido. Ignorando...");
        vTaskDelay(100 / portTICK_PERIOD_MS);
        continue;
      }

      lastPayload   = payload;
      lastScanTime  = currentTime;
      appendLog("Nuevo QR escaneado: " + payload);

      if (isTokenUsed(payload)) {
        appendLog("Token ya usado previamente.");
        httpDev.begin(ESP32_DEVKIT_URL_FAIL);
        httpDev.GET();
        httpDev.end();
        continue;
      }

      String result = validateWithBackend(payload);

      if (result == "ok") {
        appendLog("Token validado por backend.");
        String json = getJwtPayload(payload);
        appendLog("Payload JSON: " + json);
        saveUsedLocalToken(payload);
        httpDev.begin(ESP32_DEVKIT_URL_SUCCESS);
        httpDev.GET();
        httpDev.end();

      } else if (result == "timeout") {
        appendLog("Backend no disponible o timeout. Procesando localmente...");
        if (decodeJWT(payload)) {
          appendLog("JWT válido localmente. Guardando y notificando éxito.");
          appendLog("Payload JSON: " + payload);
          saveDataToSD(payload);
          saveUsedLocalToken(payload);
          httpDev.begin(ESP32_DEVKIT_URL_SUCCESS);
          httpDev.GET();
          httpDev.end();
        } else {
          appendLog("JWT inválido localmente.");
          saveInvalidLocalToken(payload);
          httpDev.begin(ESP32_DEVKIT_URL_FAIL);
          httpDev.GET();
          httpDev.end();
        }

      } else if (result == "forbidden") {
        appendLog("Acceso prohibido (401 Unauthorized)");
        saveInvalidLocalToken(payload);
        httpDev.begin(ESP32_DEVKIT_URL_FAIL);
        httpDev.GET();
        httpDev.end();

      } else {
        appendLog("Error en token o rechazo del backend: " + result);
        saveInvalidLocalToken(payload);
        httpDev.begin(ESP32_DEVKIT_URL_FAIL);
        httpDev.GET();
        httpDev.end();
      }

    } else {
      Serial.println("QR inválido o no detectado.");
    }

    vTaskDelay(100 / portTICK_PERIOD_MS);
  }
}

void appendLog(const String &msg) {
  Serial.println(msg);
  logBuffer += msg + "\n";
  if (logBuffer.length() > 10 * 1024) {
    logBuffer = logBuffer.substring(logBuffer.length() - 10 * 1024);
  }
}

String getCurrentTimestamp() {
  unsigned long now = millis() / 1000;
  unsigned long hours = now / 3600;
  unsigned long minutes = (now % 3600) / 60;
  unsigned long seconds = now % 60;
  char buf[20];
  sprintf(buf, "%02lu:%02lu:%02lu", hours, minutes, seconds);
  return String(buf);
}

void logTokenToFile(const char* filename, const String& status, const String& token) {
  File file = SD_MMC.open(filename, FILE_APPEND);
  if (file) {
    String timestamp = getCurrentTimestamp();
    String logLine = timestamp + " | " + status + " | " + token + "\n";
    file.print(logLine);
    file.close();
  } else {
    Serial.println("Error al abrir archivo de logs: " + String(filename));
  }
}

void processScannedToken(const String& rawToken) {
  if (decodeJWT(rawToken)) {
    saveUsedLocalToken(rawToken);
  } else {
    saveInvalidLocalToken(rawToken);
  }
}
void handleTokensStatus() {
  usedTokens.clear();
  invalidTokens.clear();
  loadUsedLocalTokens();
  loadInvalidLocalTokens();

  String resp = "{\n  \"used\": [";
  for (size_t i = 0; i < usedTokens.size(); ++i) {
    resp += "{\"token\":\"" + usedTokens[i] + "\"}";
    if (i + 1 < usedTokens.size()) resp += ", ";
  }
  resp += "],\n  \"invalid\": [";
  for (size_t j = 0; j < invalidTokens.size(); ++j) {
    resp += "{\"token\":\"" + invalidTokens[j] + "\"}";
    if (j + 1 < invalidTokens.size()) resp += ", ";
  }
  resp += "]\n}";
  
  server.send(200, "application/json", resp);
}

unsigned long lastResend = 0;

void setup() {
  Serial.begin(115200);
  pinMode(FLASH_LED_PIN, OUTPUT);

  reader.setup();
  reader.beginOnCore(1);

  sensor_t * s = esp_camera_sensor_get();
  if (s) {
  
    s->set_exposure_ctrl(s, 1);
    s->set_aec2(s, 0);
    s->set_aec_value(s, 600);

    s->set_gainceiling(s, (gainceiling_t)4);

    s->set_framesize(s, FRAMESIZE_QVGA);
    
  }

  xTaskCreate(onQrCodeTask, "onQrCode", 8 * 1024, NULL, 4, NULL);

  if (!SD_MMC.begin()) {
    Serial.println("Error al montar SD");
    return;
  }

  loadUsedLocalTokens();
  loadInvalidLocalTokens();

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado: " + WiFi.localIP().toString());

  server.on("/save_data", HTTP_POST, handleSaveData);
  server.on("/list_files", handleListFiles);
  server.on("/download", handleDownloadData);
  server.on("/remove_token", HTTP_POST, handleRemoveToken);
  server.on("/process_tokens", HTTP_GET, handleProcessTokens);
  server.on("/delete_all_data", HTTP_GET, handleDeleteAllData);
  server.on("/download_used_tokens", HTTP_GET, handleDownloadUsedTokens);
  server.on("/download_tokens", HTTP_GET, handleDownloadInvalidTokens);
  server.on("/delete_used_tokens", HTTP_GET, handleDeleteDataUsedTokens);
  server.on("/delete_qr_data", HTTP_GET, handleDeleteData);
  server.on("/clear_used_tokens", HTTP_GET, handleDeleteUsedTokens);
  server.on("/clear_invalid_tokens", HTTP_GET, handleDeleteInvalidTokens);
  server.on("/toggle-scan", HTTP_GET, []() {
    scanningEnabled = !scanningEnabled;
    if (scanningEnabled) {
      server.send(200, "text/plain", "Escaneo ACTIVADO");
    } else {
      server.send(200, "text/plain", "Escaneo PAUSADO");
    }
  });
  server.on("/logs", HTTP_GET, [](){
    server.send(200, "text/plain", logBuffer);
  });
  server.on("/tokens_status", HTTP_GET, []() {
    handleTokensStatus();
  });
  server.on("/", HTTP_GET, [](){
    server.send(200, "text/html", R"rawliteral(
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>ESP32 Logs y Tokens</title>
          <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet" />
          <style>
            body { font-family: 'Roboto Mono', monospace; background-color: #1e1e2f; color: #e0e0e0; margin:0; padding:0; display:flex; gap:20px; height:100vh; }
            .container { flex:1; display:flex; flex-direction:column; padding:10px; }
            #logs, #tokens { background:#2c2c3a; padding:16px; border-radius:12px; height:90vh; overflow-y:auto; box-shadow:0 0 10px #00ffc380; white-space:pre-wrap; }
            .footer { font-size:12px; color:#777; margin-top:auto; text-align:center; }
            .used { color:#0f0; }
            .invalid { color:#f44; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Logs Serial</h1>
            <div id="logs">Cargando...</div>
            <div class="footer">Actualizando cada segundo</div>
          </div>
          <div class="container">
            <h1>Tokens usados / inválidos</h1>
            <div id="tokens">Cargando...</div>
            <div class="footer">Actualizando cada 3 segundos</div>
          </div>
          <script>
            async function fetchLogs() {
              try {
                const res = await fetch('/logs');
                document.getElementById('logs').textContent = await res.text();
              } catch {
                document.getElementById('logs').textContent = 'Error cargando logs';
              }
            }

            async function fetchTokens() {
              try {
                const res = await fetch('/tokens_status');
                const data = await res.json();
                const container = document.getElementById('tokens');
                container.innerHTML = '';

                if (data.used?.length) {
                  container.appendChild(Object.assign(document.createElement('div'),{textContent:'Tokens usados:'}));
                  data.used.forEach(t => {
                    const d = document.createElement('div');
                    d.className = 'used';
                    d.textContent = '✅ ' + t.token;
                    container.appendChild(d);
                  });
                }

                if (data.invalid?.length) {
                  container.appendChild(Object.assign(document.createElement('div'),{style:'margin-top:15px',textContent:'Tokens inválidos:'}));
                  data.invalid.forEach(t => {
                    const d = document.createElement('div');
                    d.className = 'invalid';
                    d.textContent = '❌ ' + t.token;
                    container.appendChild(d);
                  });
                }

                if (!(data.used?.length) && !(data.invalid?.length)) {
                  container.textContent = 'No hay tokens usados ni inválidos.';
                }
              } catch {
                document.getElementById('tokens').textContent = 'Error cargando tokens';
              }
            }

            setInterval(fetchLogs, 1000);
            fetchLogs();
            setInterval(fetchTokens, 3000);
            fetchTokens();
          </script>
      </body>
      </html>
    )rawliteral");
  });

  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  server.handleClient();

  unsigned long now = millis();
  if (now - lastResend >= 60000) {
    Serial.println("⏱ Reintentando envío de tokens almacenados...");
    resendTokensFromSD();
    lastResend = now;
  }
}