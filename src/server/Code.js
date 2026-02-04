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
 * 新增主題：對應 A, B, C, D 欄
 */
function addNewWish(newWish) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET_NAME);
  const userEmail = Session.getActiveUser().getEmail();
  
  // 寫入：A(0票), B(標題), C(描述), D(推薦者)
  sheet.appendRow([0, newWish.title, newWish.desc, userEmail]);
  
  return "許願成功！";
}

/**
 * 投票功能：更新 A 欄
 */
function addVote(wishId) {
  const userEmail = Session.getActiveUser().getEmail();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let logSheet = ss.getSheetByName(LOG_SHEET_NAME);
  
  // 檢查是否投過
  const logData = logSheet.getDataRange().getValues();
  if (logData.some(row => row[0] === userEmail && row[1] === wishId)) {
    throw new Error("你已經投過囉！");
  }

  // 1. 紀錄投票
  logSheet.appendRow([userEmail, wishId, new Date()]);

  // 2. 更新票數 (A 欄是第 1 欄)
  const wishSheet = ss.getSheetByName(WISH_SHEET_NAME);
  const voteRange = wishSheet.getRange(wishId, 1); 
  voteRange.setValue((voteRange.getValue() || 0) + 1);
  
  return "投票成功！";
}

/**
 * 刪除許願主題
 * @param {number} wishId - 試算表中的列號
 */
function deleteWish(wishId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(WISH_SHEET_NAME);
  const userEmail = Session.getActiveUser().getEmail();
  
  // 1. 取得該列的推薦者 Email (D 欄是第 4 欄)
  const creatorEmail = sheet.getRange(wishId, 4).getValue();
  
  // 2. 權限檢查：只有提案人或是管理員(你)可以刪除
  if (userEmail !== creatorEmail && userEmail !== ADMIN_EMAIL) {
    throw new Error("抱歉，只有提案人可以刪除此內容。");
  }
  
  // 3. 執行刪除列
  sheet.deleteRow(wishId);
  
  return "提案已成功刪除。";
}

function getUserVotedThemes() {
  const userEmail = Session.getActiveUser().getEmail();
  const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LOG_SHEET_NAME);
  if (!logSheet) return [];
  return logSheet.getDataRange().getValues()
    .filter(row => row[0] === userEmail)
    .map(row => row[1]);
}