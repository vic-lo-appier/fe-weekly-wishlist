const WISH_SHEET_NAME = '💡 主題願望清單';
const LOG_SHEET_NAME = '投票紀錄';
const ADMIN_EMAIL =
  PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');

function doGet() {
  // 注意：這裡的 'index' 必須對應到你編譯後輸出的 index.html 檔名
  return HtmlService.createTemplateFromFile('index')
    .evaluate()
    .setTitle('FE Weekly 許願池')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // 增加相容性
}
/**
 * 取得主題 (對應：A=票數, B=主題名稱, C=想了解的點, D=推薦者, E=uuid)
 */
function getWishes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(WISH_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const userEmail = Session.getActiveUser().getEmail();

  // 檢查是否有資料，避免 slice 噴錯
  if (data.length <= 1) return [];

  return data.slice(1).map((row) => {
    return {
      votes: row[0],
      title: row[1],
      desc: row[2],
      creator: row[3],
      id: row[4] ? row[4].toString() : "", // ✨ 確保 UUID 從第五欄 (E欄) 讀取並轉為字串
      isOwner: row[3] === userEmail || userEmail === ADMIN_EMAIL
    };
  });
}

/**
 * 編輯功能：對準 B 欄與 C 欄
 */
function updateWish(updateData) {
  const sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET_NAME);
  const userEmail = Session.getActiveUser().getEmail();

  // 推薦者在 D 欄 (第 4 欄)
  const creatorEmail = sheet.getRange(updateData.id, 4).getValue();

  if (userEmail !== creatorEmail && userEmail !== ADMIN_EMAIL) {
    throw new Error('只有原推薦者可以編輯。');
  }

  // 更新主題名稱 (B 欄 = 2) 與 想了解的點 (C 欄 = 3)
  sheet.getRange(updateData.id, 2).setValue(updateData.title);
  sheet.getRange(updateData.id, 3).setValue(updateData.desc);

  return '更新成功！';
}

/**
 * 新增時存入 UUID
 */
function addNewWish(payload) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wishSheet = ss.getSheetByName(WISH_SHEET_NAME);
  const logSheet = ss.getSheetByName("投票紀錄");
  const userEmail = Session.getActiveUser().getEmail();
  
  // 1. 寫入主表
  wishSheet.appendRow([
    1,                // A: 票數
    payload.title,    // B: 標題
    payload.desc,     // C: 描述
    userEmail,        // D: 提案者 Email
    payload.id        // E: UUID
  ]);

  // 2. 寫入投票紀錄 (對齊你的格式：Email, UUID, 時間)
  if (logSheet) {
    logSheet.appendRow([
      userEmail,      // A: 投票者 Email
      payload.id,     // B: uuid
      new Date()      // C: 投票時間
    ]);
  }
  
  return "OK";
}

/**
 * 透過 UUID 找到對應的列進行操作
 */
function findRowById(sheet, id) {
  const data = sheet.getDataRange().getValues();
  // 假設 UUID 存在第 E 欄 (index 為 4)
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === id) return i + 1; // 回傳真正的列號
  }
  throw new Error('找不到該項目');
}

function addVote(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wishSheet = ss.getSheetByName(WISH_SHEET_NAME);
  const logSheet = ss.getSheetByName("投票紀錄");
  const userEmail = Session.getActiveUser().getEmail();

  // 增加主表票數 (邏輯同前...)
  const rowIndex = findRowById(wishSheet, id);
  const cell = wishSheet.getRange(rowIndex, 1);
  cell.setValue(cell.getValue() + 1);

  // 寫入投票紀錄 (Email, UUID, 時間)
  if (logSheet) {
    logSheet.appendRow([
      userEmail, 
      id, 
      new Date()
    ]);
  }
  return "投票成功";
}

/**
 * 刪除許願主題（支援 UUID 與 跨表清理）
 * @param {string} id - 前端傳入的 UUID
 */
function deleteWish(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wishSheet = ss.getSheetByName(WISH_SHEET_NAME);
  const logSheet = ss.getSheetByName("投票紀錄");
  const userEmail = Session.getActiveUser().getEmail();
  
  // --- 處理主表 ---
  const wishData = wishSheet.getDataRange().getValues();
  let rowIndex = -1;
  let creatorEmail = "";

  for (let i = 1; i < wishData.length; i++) {
    if (wishData[i][4] === id) { // 主表 UUID 在 E 欄 (Index 4)
      rowIndex = i + 1;
      creatorEmail = wishData[i][3]; // 提案者在 D 欄 (Index 3)
      break;
    }
  }

  if (rowIndex === -1) throw new Error("找不到該提案。");
  if (userEmail !== creatorEmail && userEmail !== ADMIN_EMAIL) {
    throw new Error("權限不足。");
  }
  
  wishSheet.deleteRow(rowIndex);

  // --- 處理投票紀錄 (對齊你的格式) ---
  if (logSheet) {
    const logData = logSheet.getDataRange().getValues();
    // 由後往前刪除
    for (let j = logData.length - 1; j >= 1; j--) {
      // 你的格式中 uuid 在 B 欄，所以索引是 1
      if (logData[j][1] === id) { 
        logSheet.deleteRow(j + 1);
      }
    }
  }
  
  return "提案及其相關紀錄已成功刪除。";
}

function getUserVotedThemes() {
  const userEmail = Session.getActiveUser().getEmail();
  const logSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) return [];
  return logSheet
    .getDataRange()
    .getValues()
    .filter((row) => row[0] === userEmail)
    .map((row) => row[1]);
}
