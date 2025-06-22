#include <SPI.h>
#include <SD.h>
#include <SD_MMC.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <WiFi.h>
#include "time.h"

const int pirPin   = 25;
const int ledPin   = 4;
const char* ntpServer     = "pool.ntp.org";
const long  gmtOffset_sec = -5 * 3600;
const int   daylightOffset_sec = 0;

#define WIFI_SSID "SCOTT"
#define WIFI_PASS "08696037"
const String BACKEND_URL = "https://dtaquito-backend.azurewebsites.net"
                           "/api/v1/sport-spaces/create-number/2/update-amount-people?";
WebServer server(80);

typedef int HourCountArr[24];
volatile bool isDownloading = false;
int state = 0;
int peopleCount = 0;
HourCountArr hourlyCounts = {0};
HourCountArr lastSentCount = {0};
int lastSendMinute = -1;
int lastHour = -1;      
int lastMinute = -1;
bool pendingMergedForHour = false;
bool leftoverSentThisHour = false;
bool wifiWasConnected = false;

String logBuffer = "";

void appendLog(const String &msg) {
  Serial.println(msg);
  logBuffer += msg + "\n";
  if (logBuffer.length() > 10 * 1024) {
    logBuffer = logBuffer.substring(logBuffer.length() - 10 * 1024);
  }
}

void saveState() {
  File f = SD.open("/state.bin", FILE_WRITE);
  if (!f) return;
  f.write((uint8_t*)&peopleCount, sizeof(peopleCount));
  f.write((uint8_t*)lastSentCount, sizeof(lastSentCount));
  f.write((uint8_t*)hourlyCounts,  sizeof(hourlyCounts));
  f.close();
}

void loadState() {
  if (!SD.exists("/state.bin")) return;
  File f = SD.open("/state.bin", FILE_READ);
  if (!f) return;
  if (f.read((uint8_t*)&peopleCount, sizeof(peopleCount)) != sizeof(peopleCount)) {
    peopleCount = 0;
  }
  f.read((uint8_t*)lastSentCount, sizeof(lastSentCount));
  f.read((uint8_t*)hourlyCounts,  sizeof(hourlyCounts));
  f.close();
}

void retryAllPending() {
  if (!SD.exists("/pending.txt")) return;
  File fin = SD.open("/pending.txt", FILE_READ);
  if (!fin) {
    appendLog("No se pudo abrir pending.txt para reintento general");
    return;
  }
  if (SD.exists("/temp.txt")) SD.remove("/temp.txt");
  File fout = SD.open("/temp.txt", FILE_WRITE);
  if (!fout) { fin.close(); appendLog("Error al crear temp.txt para reintento general"); return; }
  while (fin.available()) {
    String line = fin.readStringUntil('\n');
    int hour, cnt;
    if (sscanf(line.c_str(), "%d %d", &hour, &cnt) == 2) {
      String url = BACKEND_URL + "amountPeople=" + String(cnt);
      HTTPClient http;
      http.begin(url);
      http.addHeader("Content-Type", "application/json");
      int code = http.sendRequest("PATCH", "");
      http.end();
      if (code == 200) {
        appendLog("Reintento general PATCH OK para hora " + String(hour) + " cnt " + String(cnt));
        continue;
      } else {
        appendLog("Reintento general PATCH ERROR code " + String(code) + " para hora " + String(hour));
      }
    }
    fout.println(line);
  }
  fin.close();
  fout.close();
  SD.remove("/pending.txt");
  SD.rename("/temp.txt", "/pending.txt");
}

void handleDownloadDetections() {
  isDownloading = true;
  File f = SD.open("/detections.txt", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "detections.txt no encontrado");
    appendLog("Error: detections.txt no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"detections.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("detections.txt enviado por endpoint");
  isDownloading = false;
}

void handleDownloadTest() {
  isDownloading = true;
  File f = SD.open("/test.txt", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "test.txt no encontrado");
    appendLog("Error: detections.txt no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"test.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("test.txt enviado por endpoint");
  isDownloading = false;
}

void handleDownloadFoo() {
  isDownloading = true;
  File f = SD.open("/foo.txt", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "foo.txt no encontrado");
    appendLog("Error: foo.txt no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"foo.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("foo.txt enviado por endpoint");
  isDownloading = false;
}

void handleDownloadSendLog() {
  isDownloading = true;
  File f = SD.open("/send_log.txt", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "send_log.txt no encontrado");
    appendLog("Error: send_log.txt no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"send_log.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("send_log.txt enviado por endpoint");
  isDownloading = false;
}

void handleDownloadState() {
  isDownloading = true;
  File f = SD.open("/state.bin", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "state.bin no encontrado");
    appendLog("Error: state.bin no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"state.bin\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("state.bin enviado por endpoint");
  isDownloading = false;
}

void sendLeftover(int hour) {
  int total = hourlyCounts[hour];
  if (total <= 0) return;

  String url = BACKEND_URL + "amountPeople=" + String(total);
  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type","application/json");
  int code = http.sendRequest("PATCH", "");
  http.end();

  if (code == 200) {
    lastSentCount[hour] = total;
    saveState();
    appendLog("Final hora " + String(hour) + ": enviado total " + String(total));
    logSend(total);
    hourlyCounts[hour] = 0;
    peopleCount = 0;
    saveState();
    appendLog("Contador hora " + String(hour) + " reiniciado tras leftover");
  } else {
    appendLog("Error final hora " + String(hour) + " code " + String(code));
    File p = SD.open("/pending.txt", FILE_APPEND);
    if (p) { p.printf("%02d %d\n", hour, total); p.close(); }
  }
  retryAllPending();
}

void handleDownloadPending() {
  isDownloading = true;
  File f = SD.open("/pending.txt", FILE_READ);
  if (!f) {
    server.send(404, "text/plain", "pending.txt no encontrado");
    appendLog("Error: pending.txt no encontrado para descarga");
    isDownloading = false;
    return;
  }
  server.sendHeader("Content-Type", "text/plain");
  server.sendHeader("Content-Disposition", "attachment; filename=\"pending.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(f, "text/plain");
  f.close();
  appendLog("pending.txt enviado por endpoint");
  isDownloading = false;
}

bool deleteRecursive(File dir) {
  if (!dir.isDirectory()) {
    return SD.remove(dir.name());
  }

  File entry = dir.openNextFile();
  while (entry) {
    String path = entry.name();
    if (entry.isDirectory()) {
      if (!deleteRecursive(entry)) {
        Serial.println("No se pudo eliminar directorio: " + path);
      }
    } else {
      entry.close(); // Cierra antes de eliminar
      if (!SD.remove(path)) {
        Serial.println("No se pudo eliminar archivo: " + path);
      } else {
        Serial.println("Archivo eliminado: " + path);
      }
    }
    entry = dir.openNextFile();
  }

  dir.close();

  if (String(dir.name()) != "/") {
    if (!SD.rmdir(dir.name())) {
      Serial.println("No se pudo eliminar carpeta: " + String(dir.name()));
      return false;
    }
    Serial.println("Carpeta eliminada: " + String(dir.name()));
  }

  return true;
}


void handleDeleteAllFiles() {
  File root = SD.open("/");
  if (!root) {
    server.send(500, "text/plain", "Error abriendo el directorio raíz");
    return;
  }

  if (!deleteRecursive(root)) {
    server.send(500, "text/plain", "No se pudieron eliminar todos los archivos");
    return;
  }

  server.send(200, "text/plain", "SD limpiada completamente");
}


void handleDeleteDetections() {
  SD.remove("/detections.txt");
  server.send(200, "text/plain", "detections.txt eliminado");
  appendLog("detections.txt eliminado via endpoint");
}

void handleDeletePending() {
  SD.remove("/pending.txt");
  server.send(200, "text/plain", "pending.txt eliminado");
  appendLog("pending.txt eliminado via endpoint");
}

void handleDeleteTest() {
  SD.remove("/test.txt");
  server.send(200, "text/plain", "test.txt eliminado");
  appendLog("pending.txt eliminado via endpoint");
}

void handleDeleteFoo() {
  SD.remove("/foo.txt");
  server.send(200, "text/plain", "foo.txt eliminado");
  appendLog("pending.txt eliminado via endpoint");
}

void handlePostPending() {
  File file = SD.open("/pending.txt", FILE_WRITE);
  if (file) {
    file.println("Archivo creado desde endpoint");
    file.close();
    server.send(200, "text/plain", "pending.txt creado correctamente");
    appendLog("pending.txt creado via endpoint");
  } else {
    server.send(500, "text/plain", "Error al crear pending.txt");
    appendLog("Error al crear pending.txt via endpoint");
  }
}

void handlePostDetections() {
  File file = SD.open("/detections.txt", FILE_WRITE);
  if (file) {
    file.println("Archivo creado desde endpoint");
    file.close();
    server.send(200, "text/plain", "detections.txt creado correctamente");
    appendLog("detections.txt creado via endpoint");
  } else {
    server.send(500, "text/plain", "Error al crear detections.txt");
    appendLog("Error al crear detections.txt via endpoint");
  }
}

void retryPendingData(int targetHour) {
  if (!SD.exists("/pending.txt")) return;
  File fin = SD.open("/pending.txt", FILE_READ);
  if (!fin) { appendLog("No se pudo abrir pending.txt para reintento"); return; }
  if (SD.exists("/temp.txt")) SD.remove("/temp.txt");
  File fout = SD.open("/temp.txt", FILE_WRITE);
  if (!fout) { fin.close(); appendLog("Error al crear temp.txt para reintento"); return; }
  while (fin.available()) {
    String line = fin.readStringUntil('\n');
    int hour, cnt;
    if (sscanf(line.c_str(), "%d %d", &hour, &cnt) == 2) {
      if (hour == targetHour) {
        String url = BACKEND_URL + "amountPeople=" + String(cnt);
        HTTPClient http;
        http.begin(url);
        http.addHeader("Content-Type", "application/json");
        int code = http.sendRequest("PATCH", "");
        http.end();
        if (code == 200) {
          appendLog("Reintento PATCH OK para hora " + String(hour) + " count " + String(cnt));
          continue;
        } else {
          appendLog("Reintento PATCH ERROR code " + String(code) + " para hora " + String(hour));
        }
      }
      fout.println(line);
    }
  }
  fin.close();
  fout.close();
  SD.remove("/pending.txt");
  SD.rename("/temp.txt", "/pending.txt");
}

void logDetection(int h, int m) {
  if (isDownloading) return;
  SD.remove("/detections.txt");
  File f = SD.open("/detections.txt", FILE_WRITE);
  if (!f) { appendLog("Error al abrir detections.txt para escritura"); return; }
  f.printf("%02d:%02d — tot:%d hr%02d:%d\n",
           h, m, peopleCount, h, hourlyCounts[h]);
  f.close();
  appendLog("Registro de detección escrito: hora " + String(h) + ", total " + String(peopleCount));
}


void handleListFiles() {
  File root = SD.open("/");
  if (!root || !root.isDirectory()) {
    server.send(500, "text/plain", "No se pudo abrir el directorio");
    return;
  }

  String response = "Archivos:\n";
  File file = root.openNextFile();
  while (file) {
    response += String(file.name()) + "\n";
    file = root.openNextFile();
  }

  server.send(200, "text/plain", response);
}

void logSend(int cumulative) {
  File f = SD.open("/send_log.txt", FILE_APPEND);
  if (!f) { appendLog("Error al abrir send_log.txt"); return; }
  f.println(cumulative);
  f.close();
  appendLog("Registro de envío acumulado: " + String(cumulative));
}


void handleDeleteStateBin() {
  File file = SD.open("/state.bin", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteDataDetections() {
  File file = SD.open("/detections.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteDataSendLog() {
  File file = SD.open("/send_log.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void setup() {
  pinMode(pirPin, INPUT);
  pinMode(ledPin, OUTPUT);
  Serial.begin(9600);
  appendLog("Iniciando ESP32");
  if (!SD.begin(5)) { appendLog("Error al inicializar SD"); while (1); }
  appendLog("SD inicializada correctamente");
  
  loadState();
  appendLog("Estado previo cargado desde SD");

  File f = SD.open("/detections.txt", FILE_APPEND);
  if (f) { f.println("=== Inicio registro ==="); f.close(); }
  appendLog("Archivo de detecciones listo");
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int retries = 0;
  while (WiFi.status() != WL_CONNECTED && retries < 20) { delay(500); appendLog("Conectando a WiFi..."); retries++; }
  if (WiFi.status() == WL_CONNECTED) appendLog("WiFi conectado: " + WiFi.localIP().toString());
  else appendLog("Fallo al conectar WiFi");
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  struct tm ti;
  while (!getLocalTime(&ti)) { delay(500); appendLog("Esperando hora NTP..."); }
  appendLog("Hora sincronizada: " + String(ti.tm_hour) + ":" + String(ti.tm_min));
  server.on("/download/detections", handleDownloadDetections);
  server.on("/download/pending",    handleDownloadPending);
  server.on("/delete/detections",   handleDeleteDetections);
  server.on("/delete/pending",      handleDeletePending);
  server.on("/delete/state", handleDeleteStateBin);
  server.on("/deleteAll", HTTP_GET, handleDeleteAllFiles);
  server.on("/list_files", handleListFiles);
  server.on("/download/test", handleDownloadTest);
  server.on("/download/foo", handleDownloadFoo);
  server.on("/download/send_log", handleDownloadSendLog);
  server.on("/download/state", handleDownloadState);
  server.on("/delete/foo", handleDeleteFoo);
  server.on("/delete/test", handleDeleteTest);
  server.on("/delete/data/detections", handleDeleteDataDetections);
  server.on("/post/pending", handlePostPending);
  server.on("/delete/send", handleDeleteDataSendLog);
  server.on("/logs", HTTP_GET, [](){ server.send(200, "text/plain", logBuffer); });
  server.on("/", HTTP_GET, [](){
    server.send(200, "text/html", R"rawliteral(
    <!DOCTYPE html>
    <html><head><meta charset="utf-8"><title>ESP32 Logs</title>
    <style>body{font-family:monospace;white-space:pre-wrap;}</style></head>
    <body><div id="logs">Cargando…</div>
    <script>
      async function fetchLogs() {
        let res = await fetch('/logs');
        document.getElementById('logs').textContent = await res.text();
      }
      setInterval(fetchLogs, 1000); fetchLogs();
    </script></body></html>
    )rawliteral");
  });
  server.begin();
  appendLog("Servidor HTTP iniciado");
}

void loop() {
  struct tm ti;
  if (!getLocalTime(&ti)) { server.handleClient(); return; }
  int ch = ti.tm_hour;
  int cm = ti.tm_min;
  int cs = ti.tm_sec;

  bool wifiNow = (WiFi.status() == WL_CONNECTED);
  if (!wifiWasConnected && wifiNow) {
    appendLog("WiFi reconectado → recargando state.bin y reseteando contadores");
    loadState();  
    pendingMergedForHour = false;
    leftoverSentThisHour = false;
  }
  wifiWasConnected = wifiNow;

  if (lastMinute == 59 && cm == 0) {
    lastHour = ch;
    lastSendMinute = -1;
    pendingMergedForHour = false;
    leftoverSentThisHour = false;
    hourlyCounts[ch] = 0;
    appendLog("Hora cambiada a " + String(ch) + " → contador reiniciado");
  }
  lastMinute = cm;

  if (true/*ch >= 8 && ch <= 22*/) {

    if (cm == 59 && cs == 59 && !leftoverSentThisHour) {
      sendLeftover(ch);
      leftoverSentThisHour = true;
    }

    if (cm % 5 == 0 && cm != lastSendMinute) {
      if (!pendingMergedForHour) {
        File fin = SD.open("/pending.txt", FILE_READ);
        if (fin) {
          int sumPend = 0;
          String keep = "";
          while (fin.available()) {
            String line = fin.readStringUntil('\n');
            int h, cnt;
            if (sscanf(line.c_str(), "%d %d", &h, &cnt) == 2) {
              if (h == ch) sumPend += cnt;
              else keep += line + "\n";
            }
          }
          fin.close();
          File fout = SD.open("/pending.txt", FILE_WRITE);
          if (fout) { fout.print(keep); fout.close(); }
          if (sumPend > 0) {
            hourlyCounts[ch] += sumPend;
            appendLog("Merged pending " + String(sumPend) + " into hour " + String(ch));
          }
        }
        pendingMergedForHour = true;
      }

      int total = hourlyCounts[ch];
      if (total > 0) {
        String url = BACKEND_URL + "amountPeople=" + String(total);
        HTTPClient http;
        http.begin(url);
        http.addHeader("Content-Type","application/json");
        int code = http.sendRequest("PATCH", "");
        http.end();

        if (code == 200) {
          lastSentCount[ch] = total;
          saveState();
          appendLog("5m PATCH OK " + String(ch) + ":" + String(cm) + " → total " + String(total));
          logSend(total);

          hourlyCounts[ch] = 0;
          peopleCount = 0;
          saveState();
          appendLog("Contador hora " + String(ch) + " reiniciado tras envío 5m");
        } else {
          appendLog("Error PATCH " + String(code) + " @ " + String(ch) + ":" + String(cm) + " → total " + String(total));
        }
        retryPendingData(ch);
        lastSendMinute = cm;
      }
    }

    state = digitalRead(pirPin);
    if (state == HIGH) {
      digitalWrite(ledPin, HIGH);
      peopleCount++;
      hourlyCounts[ch]++;
      saveState();
      appendLog("Detectado @ " + String(ch) + ":" + String(ti.tm_min) +
                " tot:" + String(peopleCount) +
                " hr" + String(ch) + ":" + String(hourlyCounts[ch]));
      logDetection(ch, ti.tm_min);
      delay(2000);
    } else {
      digitalWrite(ledPin, LOW);
      delay(100);
    }
  } else {
    digitalWrite(ledPin, LOW);
  }

  server.handleClient();
}