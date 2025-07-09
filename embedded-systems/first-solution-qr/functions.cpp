#include "functions.h"
#include <SD_MMC.h>

using namespace std;

#define LOG_USED_TOKENS "/used_tokens.txt"
#define LOG_INVALID_TOKENS "/invalid_tokens.txt"

vector<String> usedTokens;
vector<String> invalidTokens;

void handleSaveData() {
  if (server.hasArg("data")) {
    String data = server.arg("data");
    saveDataToSD(data);
    server.send(200, "text/plain", "Data guardada correctamente");
  } else {
    server.send(400, "text/plain", "Falta el parámetro 'data'");
  }
}

void handleListFiles() {
  File root = SD_MMC.open("/");
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

void handleDownloadData() {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_READ);
  if (!file) {
    server.send(404, "text/plain", "Archivo no encontrado");
    return;
  }

  server.sendHeader("Content-Type", "application/octet-stream");
  server.sendHeader("Content-Disposition", "attachment; filename=\"data.txt\"");
  server.sendHeader("Connection", "close");
  server.streamFile(file, "application/octet-stream");
  file.close();
}

void handleDownloadUsedTokens() {
  if (SD_MMC.exists(LOG_USED_TOKENS)) {
    File file = SD_MMC.open(LOG_USED_TOKENS, FILE_READ);
    server.streamFile(file, "text/plain");
    file.close();
  } else {
    server.send(404, "text/plain", "Archivo de tokens usados no encontrado");
  }
}

void handleDownloadInvalidTokens() {
  if (SD_MMC.exists(LOG_INVALID_TOKENS)) {
    File file = SD_MMC.open(LOG_INVALID_TOKENS, FILE_READ);
    server.streamFile(file, "text/plain");
    file.close();
  } else {
    server.send(404, "text/plain", "Archivo de tokens inválidos no encontrado");
  }
}

void handleProcessTokens() {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_READ);
  if (!file) {
    server.send(404, "text/plain", "Archivo no encontrado");
    return;
  }

  String response = "Tokens procesados:\n";
  while (file.available()) {
    String token = file.readStringUntil('\n');
    token.trim();
    if (token.length() > 0) {
      response += token + "\n";
    }
  }
  file.close();
  server.send(200, "text/plain", response);
}

void handleRemoveToken() {
  if (server.hasArg("data")) {
    String token = server.arg("data");
    if (removeTokenFromSD(token)) {
      server.send(200, "text/plain", "Token eliminado");
    } else {
      server.send(500, "text/plain", "Error al eliminar el token");
    }
  } else {
    server.send(400, "text/plain", "Falta el parámetro 'data'");
  }
}

void handleDeleteData() {
  File file = SD_MMC.open("/qrcode_data.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteUsedTokens() {
  File file = SD_MMC.open("/used_tokens.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteInvalidTokens() {
  File file = SD_MMC.open("/invalid_tokens.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteDataUsedTokens() {

  File file = SD_MMC.open("/qrcode_data.txt", FILE_WRITE);
  if (!file) {
    server.send(500, "text/plain", "No se pudo abrir el archivo");
    return;
  }
  file.print("");
  file.close();
  server.send(200, "text/plain", "Contenido del archivo eliminado");
}

void handleDeleteAllData() {
  handleDeleteData();
  server.send(200, "text/plain", "Datos eliminados correctamente");
}