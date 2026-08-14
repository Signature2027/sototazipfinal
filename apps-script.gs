const SS = SpreadsheetApp.getActiveSpreadsheet();

function setup() {
  const sheets = {
    "Students":["Timestamp","Student ID","Name","Roll","Class","Section","Status"],
    "Teachers":["Timestamp","Teacher ID","Name","Class","Status"],
    "Classes":["Timestamp","Class Name","Status"],
    "Attendance":["Timestamp","Date","Class","Roll","Student","Attendance","Dress","Shoes","Socks","ID Card","Teacher"]
  };
  Object.entries(sheets).forEach(([name,headers])=>{
    let sh=SS.getSheetByName(name)||SS.insertSheet(name);
    if(sh.getLastRow()===0) sh.appendRow(headers);
  });
}

function doGet(){
  setup();
  return ContentService.createTextOutput(JSON.stringify({ok:true,service:"Sotota Attendance"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  setup();
  const b=JSON.parse(e.postData.contents||"{}");
  const now=new Date();
  if(b.action==="attendance"){
    const sh=SS.getSheetByName("Attendance");
    (b.records||[]).forEach(r=>sh.appendRow([now,b.date,b.className,r.roll,r.name,r.attendance,r.dress?"OK":"Issue",r.shoes?"OK":"Issue",r.socks?"OK":"Issue",r.id?"OK":"Issue",b.teacher||""]));
  }
  if(b.action==="student"){
    SS.getSheetByName("Students").appendRow([now,b.student[0],b.student[1],b.student[2],b.student[3],b.student[4],"Active"]);
  }
  if(b.action==="deactivate"){
    SS.getSheetByName("Students").appendRow([now,b.studentId,"","","","","Inactive"]);
  }
  if(b.action==="class") SS.getSheetByName("Classes").appendRow([now,b.className,"Active"]);
  if(b.action==="teacher") SS.getSheetByName("Teachers").appendRow([now,b.teacher.id,b.teacher.name,b.teacher.className,"Active"]);
  return ContentService.createTextOutput(JSON.stringify({ok:true})).setMimeType(ContentService.MimeType.JSON);
}