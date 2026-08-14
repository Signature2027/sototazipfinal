// ============================================
// SOTOTA ATTENDANCE - Google Apps Script
// Deploys web app to receive attendance data
// ============================================

const SS = SpreadsheetApp.getActiveSpreadsheet();

function setup() {
  const sheets = {
    "Students": ["Timestamp", "Student ID", "Name", "Roll", "Class", "Section", "Status"],
    "Teachers": ["Timestamp", "Teacher ID", "Name", "Class", "Status"],
    "Classes": ["Timestamp", "Class Name", "Status"],
    "Attendance": ["Timestamp", "Date", "Class", "Roll", "Student", "Attendance", "Dress", "Shoes", "Socks", "ID Card", "Teacher"]
  };

  Object.entries(sheets).forEach(([name, headers]) => {
    let sh = SS.getSheetByName(name) || SS.insertSheet(name);
    if (sh.getLastRow() === 0) {
      sh.appendRow(headers);
    }
  });
}

function doGet() {
  setup();
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    service: "Sotota Attendance v2.0"
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  setup();
  const payload = JSON.parse(e.postData.contents || "{}");
  const now = new Date();

  try {
    if (payload.action === "attendance") {
      const attendanceSheet = SS.getSheetByName("Attendance");
      (payload.records || []).forEach(r => {
        attendanceSheet.appendRow([
          now,
          payload.date,
          payload.className,
          r.roll,
          r.name,
          r.attendance,
          r.dress ? "OK" : "Issue",
          r.shoes ? "OK" : "Issue",
          r.socks ? "OK" : "Issue",
          r.id ? "OK" : "Issue",
          payload.teacher || ""
        ]);
      });
    }

    if (payload.action === "student") {
      SS.getSheetByName("Students").appendRow([
        now,
        payload.student[0],
        payload.student[1],
        payload.student[2],
        payload.student[3],
        payload.student[4],
        "Active"
      ]);
    }

    if (payload.action === "deactivate") {
      SS.getSheetByName("Students").appendRow([
        now,
        payload.studentId,
        "",
        "",
        "",
        "",
        "Inactive"
      ]);
    }

    if (payload.action === "class") {
      SS.getSheetByName("Classes").appendRow([
        now,
        payload.className,
        "Active"
      ]);
    }

    if (payload.action === "teacher") {
      SS.getSheetByName("Teachers").appendRow([
        now,
        payload.teacher.id,
        payload.teacher.name,
        payload.teacher.class,
        "Active"
      ]);
    }

    return ContentService.createTextOutput(JSON.stringify({
      ok: true,
      message: "Data received successfully"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      ok: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
