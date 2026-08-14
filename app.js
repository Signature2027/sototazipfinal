const DEMO={
  admins:[{id:"admin",password:"1234",name:"School Admin"}],
  teachers:[{id:"teacher01",password:"1234",name:"Class Teacher",className:"Class 5"}],
  classes:["Play","Nursery","Class 1","Class 2","Class 3","Class 4","Class 5"],
  students:[
    ["S001","রাহিম","01","Class 5","A"],["S002","করিম","02","Class 5","A"],
    ["S003","সুমাইয়া","03","Class 5","A"],["S004","মিম","04","Class 5","A"],
    ["S005","আরিফ","05","Class 5","A"],["S006","সাদিয়া","01","Class 4","A"]
  ]
};
let role="admin", user=null, current="dashboard", data={};
let roleButtons=document.querySelectorAll(".role");
roleButtons.forEach(b=>b.onclick=()=>{role=b.dataset.role;roleButtons.forEach(x=>x.classList.remove("active"));b.classList.add("active")});
document.getElementById("loginBtn").onclick=doLogin;
document.getElementById("logoutBtn").onclick=()=>location.reload();
document.getElementById("themeBtn").onclick=()=>document.body.classList.toggle("light");
document.getElementById("menuBtn").onclick=()=>document.getElementById("sidebar").classList.toggle("open");

function toast(t){const e=document.getElementById("toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),2200)}
function doLogin(){
 const id=loginId.value.trim(), pw=loginPassword.value;
 const list=role==="admin"?DEMO.admins:DEMO.teachers;
 const found=list.find(x=>x.id===id&&x.password===pw);
 if(!found){toast("ID অথবা Password ভুল");return}
 user={...found}; loginScreen.classList.add("hidden");appScreen.classList.remove("hidden");
 userName.textContent=user.name;userRole.textContent=role==="admin"?"Administrator":"Teacher";avatar.textContent=user.name.charAt(0);roleText.textContent=role==="admin"?"Admin Panel":"Teacher Panel";buildNav();go(role==="admin"?"dashboard":"attendance");
}
function buildNav(){
 const items=role==="admin"?[
  ["dashboard","▦","Dashboard"],["students","♙","Students"],["classes","▤","Classes"],["teachers","♟","Teachers"],["reports","▥","Reports"]
 ]:[["attendance","✓","Attendance"],["reports","▥","My Reports"]];
 nav.innerHTML=items.map(x=>`<button class="nav-item" data-page="${x[0]}"><span>${x[1]}</span>${x[2]}</button>`).join("");
 nav.querySelectorAll(".nav-item").forEach(b=>b.onclick=()=>go(b.dataset.page));
}
function go(p){current=p;document.querySelectorAll(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.page===p));document.getElementById("sidebar").classList.remove("open");({dashboard:dashboard,students:studentsPage,classes:classesPage,teachers:teachersPage,reports:reportsPage,attendance:attendancePage}[p]||dashboard)()}
function dashboard(){
 const total=DEMO.students.length;view.innerHTML=`<div class="page-head"><div><h2>Good day, ${user.name.split(" ")[0]} 👋</h2><p>School overview & quick actions</p></div></div>
 <div class="grid4"><div class="stat"><span>👨‍🎓 STUDENTS</span><b>${total}</b></div><div class="stat"><span>👨‍🏫 TEACHERS</span><b>${DEMO.teachers.length}</b></div><div class="stat"><span>🏫 CLASSES</span><b>${DEMO.classes.length}</b></div><div class="stat"><span>📅 TODAY</span><b>${new Date().getDate()}</b></div></div>
 <div class="panel" style="margin-top:14px"><div class="page-head"><div><h3>Quick Actions</h3><p>Add students, manage classes and view reports.</p></div></div><div class="toolbar"><button class="btn primary" onclick="go('students')">＋ Add Student</button><button class="btn ghost" onclick="go('classes')">＋ Add Class</button><button class="btn ghost" onclick="go('reports')">View Reports</button></div></div>`;
}
function studentsPage(){
 view.innerHTML=`<div class="page-head"><div><h2>Students</h2><p>Manage students from Play to Class 5</p></div><button class="btn primary" onclick="openStudent()">＋ Add Student</button></div>
 <div class="panel"><div class="toolbar"><input id="studentSearch" class="search" placeholder="Search student..."><select id="studentClass" class="select"><option value="">All Classes</option>${DEMO.classes.map(c=>`<option>${c}</option>`).join("")}</select></div><div id="studentCards" class="cards"></div></div>`;
 studentSearch.oninput=renderStudents;studentClass.onchange=renderStudents;renderStudents();
}
function renderStudents(){let q=(studentSearch.value||"").toLowerCase(),c=studentClass.value;let arr=DEMO.students.filter(s=>(!q||s[1].toLowerCase().includes(q)||s[0].toLowerCase().includes(q))&&(!c||s[3]===c));studentCards.innerHTML=arr.length?arr.map(s=>`<div class="student-card"><div class="student-head"><div><div class="student-name">${s[1]}</div><div class="student-meta">${s[0]} · Roll ${s[2]} · ${s[3]} · ${s[4]}</div></div><span class="chip">Active</span></div><div class="toolbar" style="margin-top:12px"><button class="btn ghost" onclick="openStudent('${s[0]}')">Edit</button><button class="btn danger" onclick="removeStudent('${s[0]}')">Deactivate</button></div></div>`).join(""):`<div class="empty">No students found</div>`}
function openStudent(id=""){let s=DEMO.students.find(x=>x[0]===id)||["","",String(DEMO.students.length+1),"Class 1","A"];document.body.insertAdjacentHTML("beforeend",`<div class="modal-back" id="modal"><div class="modal glass"><h3>${id?"Edit Student":"Add New Student"}</h3><div class="form-grid"><div><label class="label">STUDENT ID</label><input id="mId" class="input" value="${s[0]}"></div><div><label class="label">NAME</label><input id="mName" class="input" value="${s[1]}"></div><div><label class="label">ROLL</label><input id="mRoll" class="input" value="${s[2]}"></div><div><label class="label">CLASS</label><select id="mClass" class="select">${DEMO.classes.map(c=>`<option ${c===s[3]?"selected":""}>${c}</option>`).join("")}</select></div><div><label class="label">SECTION</label><input id="mSection" class="input" value="${s[4]}"></div></div><div class="modal-actions"><button class="btn ghost" onclick="modal.remove()">Cancel</button><button class="btn primary" onclick="saveStudent('${id}')">Save Student</button></div></div></div>`)}
function saveStudent(oldId){let row=[mId.value.trim(),mName.value.trim(),mRoll.value.trim(),mClass.value,mSection.value.trim()||"A"];if(!row[0]||!row[1])return toast("Student ID ও Name দিন");let i=DEMO.students.findIndex(x=>x[0]===oldId);if(i>=0)DEMO.students[i]=row;else DEMO.students.push(row);modal.remove();toast("Student saved");studentsPage();sync({action:"student",student:row})}
function removeStudent(id){let i=DEMO.students.findIndex(x=>x[0]===id);if(i>=0){DEMO.students.splice(i,1);toast("Student deactivated");renderStudents();sync({action:"deactivate",studentId:id})}}
function classesPage(){view.innerHTML=`<div class="page-head"><div><h2>Classes</h2><p>Play, Nursery and Class 1–5</p></div><button class="btn primary" onclick="addClass()">＋ Add Class</button></div><div class="cards">${DEMO.classes.map((c,i)=>`<div class="student-card"><div class="student-name">🏫 ${c}</div><div class="student-meta">${DEMO.students.filter(s=>s[3]===c).length} students</div></div>`).join("")}</div>`}
function addClass(){let c=prompt("Class name (e.g. Class 6):");if(c&&!DEMO.classes.includes(c)){DEMO.classes.push(c);toast("Class added");classesPage();sync({action:"class",className:c})}}
function teachersPage(){view.innerHTML=`<div class="page-head"><div><h2>Teachers</h2><p>Manage teacher accounts and assigned classes</p></div><button class="btn primary" onclick="addTeacher()">＋ Add Teacher</button></div><div class="cards">${DEMO.teachers.map(t=>`<div class="student-card"><div class="student-name">👨‍🏫 ${t.name}</div><div class="student-meta">${t.id} · Assigned: ${t.className}</div></div>`).join("")}</div>`}
function addTeacher(){let name=prompt("Teacher name:"),id=prompt("Teacher ID:"),cls=prompt("Assigned class:");if(name&&id&&cls){DEMO.teachers.push({id,password:"1234",name,className:cls});toast("Teacher added (default password 1234)");teachersPage();sync({action:"teacher",teacher:DEMO.teachers.at(-1)})}}
function attendancePage(){
 let cls=role==="teacher"?user.className:"Class 5";let arr=DEMO.students.filter(s=>s[3]===cls);view.innerHTML=`<div class="page-head"><div><h2>Daily Attendance</h2><p>${cls} · ${new Date().toLocaleDateString("en-GB")}</p></div><span class="chip">Teacher: ${user.name}</span></div><div class="panel"><div class="toolbar"><select id="attClass" class="select" ${role==="teacher"?"disabled":""}>${DEMO.classes.map(c=>`<option ${c===cls?"selected":""}>${c}</option>`).join("")}</select><button class="btn ghost" onclick="markAll()">✓ Everyone Present</button></div><div id="attList" class="cards"></div><button class="btn primary full" onclick="saveAttendance()">Save Attendance</button></div>`;attClass.onchange=attendancePage;renderAttendance(arr)}
function renderAttendance(arr){attList.innerHTML=arr.length?arr.map(s=>{let x=data[s[0]]||{att:"",dress:true,shoes:true,socks:true,id:true};return `<div class="student-card"><div class="student-head"><div><div class="student-name">${s[1]}</div><div class="student-meta">Roll ${s[2]} · ${s[3]} · ${s[4]}</div></div><span class="chip">${x.att||"Not marked"}</span></div><div class="status-row"><button class="status present ${x.att==="Present"?"active":""}" onclick="setAtt('${s[0]}','Present')">✓ Present</button><button class="status absent ${x.att==="Absent"?"active":""}" onclick="setAtt('${s[0]}','Absent')">✕ Absent</button><button class="status leave ${x.att==="Leave"?"active":""}" onclick="setAtt('${s[0]}','Leave')">• Leave</button></div><div class="uniform">${[['dress','👕 Dress'],['shoes','👞 Shoes'],['socks','🧦 Socks'],['id','🪪 ID Card']].map(u=>`<button class="${x[u[0]]?'ok':'bad'}" onclick="toggleU('${s[0]}','${u[0]}')">${u[1]} ${x[u[0]]?'✓':'✕'}</button>`).join("")}</div></div>`}).join(""):`<div class="empty">এই class-এ কোনো student নেই। Admin Panel থেকে Student যোগ করুন।</div>`}
function setAtt(id,v){data[id]??={dress:true,shoes:true,socks:true,id:true};data[id].att=v;renderAttendance(DEMO.students.filter(s=>s[3]===(attClass?.value||user.className)))}
function toggleU(id,u){data[id]??={att:"",dress:true,shoes:true,socks:true,id:true};data[id][u]=!data[id][u];renderAttendance(DEMO.students.filter(s=>s[3]===(attClass?.value||user.className)))}
function markAll(){DEMO.students.filter(s=>s[3]===(attClass?.value||user.className)).forEach(s=>{data[s[0]]??={dress:true,shoes:true,socks:true,id:true};data[s[0]].att="Present"});attendancePage()}
function saveAttendance(){let cls=attClass?.value||user.className,date=new Date().toISOString().slice(0,10),records=DEMO.students.filter(s=>s[3]===cls).map(s=>{let x=data[s[0]]||{};return{roll:s[2],name:s[1],attendance:x.att||"",dress:x.dress!==false,shoes:x.shoes!==false,socks:x.socks!==false,id:x.id!==false}});sync({action:"attendance",date,className:cls,teacher:user.name,records});toast("Attendance saved");}
function reportsPage(){view.innerHTML=`<div class="page-head"><div><h2>Reports</h2><p>Attendance & uniform monitoring overview</p></div></div><div class="panel"><div class="table-wrap"><table class="table"><thead><tr><th>Student</th><th>Class</th><th>Attendance</th><th>Dress</th><th>Shoes</th><th>Socks</th><th>ID</th></tr></thead><tbody>${DEMO.students.map(s=>{let x=data[s[0]]||{};return `<tr><td>${s[1]}</td><td>${s[3]}</td><td>${x.att||"—"}</td><td class="${x.dress===false?"danger-text":"good-text"}">${x.dress===false?"Issue":"OK"}</td><td class="${x.shoes===false?"danger-text":"good-text"}">${x.shoes===false?"Issue":"OK"}</td><td class="${x.socks===false?"danger-text":"good-text"}">${x.socks===false?"Issue":"OK"}</td><td class="${x.id===false?"danger-text":"good-text"}">${x.id===false?"Issue":"OK"}</td></tr>`}).join("")}</tbody></table></div></div>`}
async function sync(payload){if(!window.SOTOTA_CONFIG?.WEB_APP_URL)return;try{await fetch(window.SOTOTA_CONFIG.WEB_APP_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)})}catch(e){console.log(e)}}
