const WISH_SHEET_NAME = "💡 主題願望清單";
const LOG_SHEET_NAME = "投票紀錄";
const ADMIN_EMAIL = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL');

function doGet() {
  // 注意：這裡的 'index' 必須對應到你編譯後輸出的 index.html 檔名
  return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('FE Weekly 許願池')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL); // 增加相容性
}
/**
 * 取得主題 (對應：A=票數, B=主題名稱, C=想了解的點, D=推薦者)
 */
function getWishes() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  data.shift(); // 移除標題列
  
  const currentUser = Session.getActiveUser().getEmail();

  return data.map((row, index) => ({
    id: index + 2,        // 試算表實際列號
    votes: row[0] || 0,   // A 欄 (索引0)：票數
    title: row[1] || "",  // B 欄 (索引1)：主題名稱
    desc: row[2] || "",   // C 欄 (索引2)：想了解的點
    // 比對 D 欄 (索引3)：推薦者 Email
    isOwner: (row[3] === currentUser || currentUser === ADMIN_EMAIL) 
  }));
}

/**
 * 編輯功能：對準 B 欄與 C 欄
 */
function updateWish(updateData) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET_NAME);
  const userEmail = Session.getActiveUser().getEmail();
  
  // 推薦者在 D 欄 (第 4 欄)
  const creatorEmail = sheet.getRange(updateData.id, 4).getValue();
  
  if (userEmail !== creatorEmail && userEmail !== ADMIN_EMAIL) {
    throw new Error("只有原推薦者可以編輯。");
  }
  
  // 更新主題名稱 (B 欄 = 2) 與 想了解的點 (C 欄 = 3)
  sheet.getRange(updateData.id, 2).setValue(updateData.title); 
  sheet.getRange(updateData.id, 3).setValue(updateData.desc);  
  
  return "更新成功！";
}

/**
 * 新增時存入 UUID
 */
function addNewWish(payload) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("💡 主題願望清單");
  const userEmail = Session.getActiveUser().getEmail();
  
  // 欄位規劃：A:票數, B:標題, C:描述, D:Email, E:UUID
  sheet.appendRow([
    1, 
    payload.title, 
    payload.desc, 
    userEmail, 
    payload.id // 存入前端生成的 UUID
  ]);
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
  throw new Error("找不到該項目");
}

function addVote(id) {
  const sheet = SpreadsheetApp.getActive().getSheetByName("💡 主題願望清單");
  const row = findRowById(sheet, id);
  const cell = sheet.getRange(row, 1);
  cell.setValue(cell.getValue() + 1);
  return "OK";
}

/**
 * 刪除許願主題（支援 UUID 與 跨表清理）
 * @param {string} id - 前端傳入的 UUID
 */
function deleteWish(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const wishSheet = ss.getSheetByName(WISH_SHEET_NAME);
  const logSheet = ss.getSheetByName("投票紀錄"); // 確保這裡名稱對應你的 Tab
  const userEmail = Session.getActiveUser().getEmail();
  
  // 1. 透過 UUID 尋找該提案在第幾列
  const data = wishSheet.getDataRange().getValues();
  let rowIndex = -1;
  let creatorEmail = "";

  // 假設你的欄位是：A:票數, B:標題, C:描述, D:Email, E:UUID (Index 4)
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === id) { 
      rowIndex = i + 1;
      creatorEmail = data[i][3]; // D 欄 (Email)
      break;
    }
  }

  if (rowIndex === -1) throw new Error("找不到該提案，可能已被刪除。");

  // 2. 權限檢查
  if (userEmail !== creatorEmail && userEmail !== ADMIN_EMAIL) {
    throw new Error("抱歉，只有提案人或管理員可以刪除。");
  }
  
  // 3. 執行刪除主表提案
  wishSheet.deleteRow(rowIndex);
  
  // 4. 同步清理「投票紀錄」表
  if (logSheet) {
    const logData = logSheet.getDataRange().getValues();
    // 從後往前刪除，避免 Index 位移
    for (let j = logData.length - 1; j >= 1; j--) {
      // 假設投票紀錄表的 UUID 存在 B 欄 (Index 1)
      if (logData[j][1] === id) {
        logSheet.deleteRow(j + 1);
      }
    }
  }
  
  return "提案及其相關紀錄已成功刪除。";
}

function getUserVotedThemes() {
  const userEmail = Session.getActiveUser().getEmail();
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) return [];
  return logSheet.getDataRange().getValues()
    .filter(row => row[0] === userEmail)
    .map(row => row[1]);
}