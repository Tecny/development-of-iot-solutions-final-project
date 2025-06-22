#ifndef FUNCTIONS_H
#define FUNCTIONS_H

#include <Arduino.h>
#include <WebServer.h>
#include <SD_MMC.h>

extern WebServer server;
extern String BACKEND_URL;

extern std::vector<String> usedTokens;
extern std::vector<String> invalidTokens;

void saveDataToSD(String data);
bool removeTokenFromSD(String token);

void handleSaveData();
void handleListFiles();
void handleDownloadData();
void handleProcessTokens();
void handleRemoveToken();
void handleDeleteData();
void handleDeleteAllData();
void handleDeleteDataUsedTokens();
void handleDownloadUsedTokens();
void handleDownloadInvalidTokens();
void handleTokensStatus();
void handleDeleteUsedTokens();
void handleDeleteInvalidTokens();


#endif