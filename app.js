// ============================================
// SOTOTA ATTENDANCE SYSTEM v2.0
// Professional Admin & Teacher Dashboard
// ============================================

// DATABASE (In production, replace with server calls)
const DB = {
  admins: new Map(),
  teachers: new Map(),
  classes: ["Play", "Nursery", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
  students: [
    { id: "S001", name: "রাহিম", roll: "01", class: "Class 5", section: "A" },
    { id: "S002", name: "করিম", roll: "02", class: "Class 5", section: "A" },
    { id: "S003", name: "সুমাইয়া", roll: "03", class: "Class 5", section: "A" },
    { id: "S004", name: "মিম", roll: "04", class: "Class 5", section: "A" },
    { id: "S005", name: "আরিফ", roll: "05", class: "Class 5", section: "A" },
    { id: "S006", name: "সাদিয়া", roll: "01", class: "Class 4", section: "A" },
  ],
  attendance: []
};

// Initialize with default users (hashed passwords)
DB.admins.set("admin", {
  id: "admin",
  password: hashPassword("1234"),
  name: "School Admin",
  role: "admin"
});

DB.teachers.set("teacher01", {
  id: "teacher01",
  password: hashPassword("1234"),
  name: "Class Teacher",
  role: "teacher",
  class: "Class 5"
});

// ============================================
// GLOBAL STATE
// ============================================

let currentUser = null;
let currentRole = "admin";
let currentPage = "dashboard";
let attendanceData = {};
let selectedClass = null;

// ============================================
// UTILITY FUNCTIONS
// ============================================

function hashPassword(pwd) {
  // Simple hash for demo (in production use bcrypt)
  let hash = 0;
  for (let i = 0; i < pwd.length; i++) {
    const char = pwd.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

function toast(message, type = "info") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => toast.classList.remove("show"), 2500);
}

function togglePasswordVisibility() {
  const input = document.getElementById("loginPassword");
  input.type = input.type === "password" ? "text" : "password";
}

function togglePwdViz(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === "password" ? "text" : "password";
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("theme", document.body.classList.contains("dark") ? "dark" : "light");
}

// ============================================
// AUTHENTICATION
// ============================================

function handleLogin() {
  const id = document.getElementById("loginId").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!id || !password) {
    toast("Please enter your ID and password", "error");
    return;
  }

  let user = null;
  if (currentRole === "admin") {
    const admin = DB.admins.get(id);
    if (admin && admin.password === hashPassword(password)) {
      user = admin;
    }
  } else {
    const teacher = DB.teachers.get(id);
    if (teacher && teacher.password === hashPassword(password)) {
      user = teacher;
    }
  }

  if (!user) {
    toast("Invalid ID or password", "error");
    return;
  }

  // Successful login
  currentUser = user;
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("appScreen").classList.remove("hidden");

  initializeApp();
  toast(`Welcome, ${user.name}!`, "success");
}

function initializeApp() {
  // Set user info
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileAvatar").textContent = currentUser.name.charAt(0);

  if (currentUser.role === "admin") {
    document.getElementById("profileRole").textContent = "Administrator";
    document.getElementById("roleBadge").textContent = "Admin Panel";
    buildAdminNav();
    navigateTo("dashboard");
  } else {
    document.getElementById("profileRole").textContent = "Teacher";
    document.getElementById("roleBadge").textContent = "Teacher Panel";
    buildTeacherNav();
    navigateTo("attendance");
  }

  // Load theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    document.getElementById("darkModeToggle").checked = true;
  }
}

function buildAdminNav() {
  const nav = document.getElementById("navMenu");
  nav.innerHTML = `
    <button class="nav-item active" data-page="dashboard">
      <span>▦</span> Dashboard
    </button>
    <button class="nav-item" data-page="students">
      <span>♙</span> Students
    </button>
    <button class="nav-item" data-page="classes">
      <span>▤</span> Classes
    </button>
    <button class="nav-item" data-page="teachers">
      <span>♟</span> Teachers
    </button>
    <button class="nav-item" data-page="attendance">
      <span>✓</span> Attendance
    </button>
    <button class="nav-item" data-page="reports">
      <span>▥</span> Reports
    </button>
  `;

  nav.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      navigateTo(btn.dataset.page);
    });
  });
}

function buildTeacherNav() {
  const nav = document.getElementById("navMenu");
  nav.innerHTML = `
    <button class="nav-item active" data-page="attendance">
      <span>✓</span> Mark Attendance
    </button>
    <button class="nav-item" data-page="reports">
      <span>▥</span> My Reports
    </button>
  `;

  nav.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      navigateTo(btn.dataset.page);
    });
  });
}

function navigateTo(page) {
  currentPage = page;

  // Update nav
  document.querySelectorAll(".nav-item").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.page === page);
  });

  // Load page
  const views = {
    dashboard: showDashboard,
    students: showStudents,
    classes: showClasses,
    teachers: showTeachers,
    attendance: showAttendance,
    reports: showReports
  };

  if (views[page]) {
    views[page]();
  }
}

// ============================================
// DASHBOARD PAGE
// ============================================

function showDashboard() {
  const content = document.getElementById("contentView");
  const totalStudents = DB.students.length;
  const totalTeachers = DB.teachers.size;
  const totalClasses = DB.classes.length;

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Good day, ${currentUser.name.split(" ")[0]} 👋</h1>
      <p class="page-subtitle">Here's your school overview</p>
    </div>

    <div class="grid grid-4">
      <div class="stat-card">
        <div class="stat-icon">👨‍🎓</div>
        <div class="stat-label">Total Students</div>
        <div class="stat-value">${totalStudents}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">👨‍🏫</div>
        <div class="stat-label">Teachers</div>
        <div class="stat-value">${totalTeachers}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏫</div>
        <div class="stat-label">Classes</div>
        <div class="stat-value">${totalClasses}</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-label">Today's Date</div>
        <div class="stat-value">${new Date().getDate()}</div>
      </div>
    </div>

    <div class="card" style="margin-top: 30px;">
      <h3 style="font-size: 16px; margin-bottom: 16px;">Quick Actions</h3>
      <div class="toolbar">
        <button class="btn btn-primary" onclick="navigateTo('students')">
          <span>＋</span> Add Student
        </button>
        <button class="btn btn-ghost" onclick="navigateTo('classes')">
          <span>＋</span> Add Class
        </button>
        <button class="btn btn-ghost" onclick="navigateTo('attendance')">
          <span>✓</span> Mark Attendance
        </button>
        <button class="btn btn-ghost" onclick="navigateTo('reports')">
          <span>▥</span> View Reports
        </button>
      </div>
    </div>
  `;
}

// ============================================
// STUDENTS PAGE
// ============================================

function showStudents() {
  const content = document.getElementById("contentView");
  content.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="page-title">Students</h1>
        <p class="page-subtitle">Manage all students</p>
      </div>
      <button class="btn btn-primary" onclick="openAddStudentModal()">＋ Add Student</button>
    </div>

    <div class="card">
      <div class="toolbar">
        <input class="search" id="studentSearch" placeholder="Search by name or ID..." onkeyup="filterStudents()">
        <select class="select" id="classFilter" onchange="filterStudents()">
          <option value="">All Classes</option>
          ${DB.classes.map(c => `<option value="${c}">${c}</option>`).join("")}
        </select>
      </div>
      <div id="studentsList" class="grid grid-2"></div>
    </div>
  `;

  filterStudents();
}

function filterStudents() {
  const search = document.getElementById("studentSearch").value.toLowerCase();
  const classFilter = document.getElementById("classFilter").value;

  const filtered = DB.students.filter(s => {
    const matchSearch = !search || s.name.toLowerCase().includes(search) || s.id.toLowerCase().includes(search);
    const matchClass = !classFilter || s.class === classFilter;
    return matchSearch && matchClass;
  });

  const list = document.getElementById("studentsList");
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No students found</div></div>';
    return;
  }

  list.innerHTML = filtered.map(s => `
    <div class="student-card">
      <div class="student-header">
        <div>
          <div class="student-name">${s.name}</div>
          <div class="student-meta">ID: ${s.id} · Roll: ${s.roll}</div>
          <div class="student-meta">${s.class} - ${s.section}</div>
        </div>
        <span class="chip success">Active</span>
      </div>
      <div class="toolbar" style="margin-top: 12px;">
        <button class="btn btn-ghost" onclick="editStudent('${s.id}')">Edit</button>
        <button class="btn btn-danger" onclick="deleteStudent('${s.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function openAddStudentModal() {
  const html = `
    <div class="modal" id="studentModal" onclick="if(event.target.id === 'studentModal') closeModal()">
      <div class="modal-dialog">
        <div class="modal-header">
          <h2>Add New Student</h2>
          <button class="close-btn" onclick="closeModal()">×</button>
        </div>
        <div class="modal-content">
          <div class="setting-group">
            <label class="form-label">Student ID</label>
            <input id="studentId" class="form-input" placeholder="e.g., S001">
          </div>
          <div class="setting-group">
            <label class="form-label">Student Name</label>
            <input id="studentName" class="form-input" placeholder="Full name in Bengali">
          </div>
          <div class="setting-group">
            <label class="form-label">Roll Number</label>
            <input id="studentRoll" class="form-input" placeholder="e.g., 01">
          </div>
          <div class="setting-group">
            <label class="form-label">Class</label>
            <select id="studentClass" class="select">
              ${DB.classes.map(c => `<option>${c}</option>`).join("")}
            </select>
          </div>
          <div class="setting-group">
            <label class="form-label">Section</label>
            <input id="studentSection" class="form-input" placeholder="e.g., A" value="A">
          </div>
          <div style="display: flex; gap: 12px; margin-top: 24px;">
            <button class="btn btn-ghost btn-block" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary btn-block" onclick="saveStudent()">Save Student</button>
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML("beforeend", html);
}

function saveStudent() {
  const id = document.getElementById("studentId").value.trim();
  const name = document.getElementById("studentName").value.trim();
  const roll = document.getElementById("studentRoll").value.trim();
  const cls = document.getElementById("studentClass").value;
  const section = document.getElementById("studentSection").value.trim() || "A";

  if (!id || !name || !roll) {
    toast("Please fill all required fields", "error");
    return;
  }

  const student = { id, name, roll, class: cls, section };
  const existing = DB.students.findIndex(s => s.id === id);

  if (existing >= 0) {
    DB.students[existing] = student;
  } else {
    DB.students.push(student);
  }

  toast("Student saved successfully", "success");
  closeModal();
  showStudents();
}

function editStudent(id) {
  const student = DB.students.find(s => s.id === id);
  if (student) {
    openAddStudentModal();
    document.getElementById("studentId").value = student.id;
    document.getElementById("studentName").value = student.name;
    document.getElementById("studentRoll").value = student.roll;
    document.getElementById("studentClass").value = student.class;
    document.getElementById("studentSection").value = student.section;
  }
}

function deleteStudent(id) {
  if (confirm("Are you sure you want to delete this student?")) {
    DB.students = DB.students.filter(s => s.id !== id);
    toast("Student deleted successfully", "success");
    showStudents();
  }
}

function closeModal() {
  const modal = document.getElementById("studentModal");
  if (modal) modal.remove();
}

// ============================================
// CLASSES PAGE
// ============================================

function showClasses() {
  const content = document.getElementById("contentView");
  content.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="page-title">Classes</h1>
        <p class="page-subtitle">Manage school classes</p>
      </div>
      <button class="btn btn-primary" onclick="addClassModal()">＋ Add Class</button>
    </div>

    <div class="grid grid-3">
      ${DB.classes.map(c => {
        const count = DB.students.filter(s => s.class === c).length;
        return `
          <div class="card">
            <div style="display: flex; justify-content: space-between; align-items: start;">
              <div>
                <h3 style="font-size: 18px; margin-bottom: 8px;">🏫 ${c}</h3>
                <p style="color: var(--text-secondary); font-size: 13px;">${count} students</p>
              </div>
              <button class="btn btn-danger" onclick="deleteClass('${c}')" style="padding: 6px 12px; font-size: 12px;">Delete</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function addClassModal() {
  const className = prompt("Enter class name (e.g., Class 6):");
  if (className && !DB.classes.includes(className)) {
    DB.classes.push(className);
    toast("Class added successfully", "success");
    showClasses();
  } else if (DB.classes.includes(className)) {
    toast("This class already exists", "error");
  }
}

function deleteClass(className) {
  const hasStudents = DB.students.some(s => s.class === className);
  if (hasStudents) {
    toast("Cannot delete class with students. Delete students first.", "error");
    return;
  }
  if (confirm(`Delete ${className}?`)) {
    DB.classes = DB.classes.filter(c => c !== className);
    toast("Class deleted", "success");
    showClasses();
  }
}

// ============================================
// TEACHERS PAGE
// ============================================

function showTeachers() {
  const content = document.getElementById("contentView");
  const teachers = Array.from(DB.teachers.values());

  content.innerHTML = `
    <div class="page-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 class="page-title">Teachers</h1>
        <p class="page-subtitle">Manage teacher accounts</p>
      </div>
      <button class="btn btn-primary" onclick="addTeacherModal()">＋ Add Teacher</button>
    </div>

    <div class="grid grid-2">
      ${teachers.map(t => `
        <div class="card">
          <div class="student-header">
            <div>
              <div class="student-name">👨‍🏫 ${t.name}</div>
              <div class="student-meta">ID: ${t.id}</div>
              <div class="student-meta">Class: ${t.class}</div>
            </div>
            <span class="chip success">Active</span>
          </div>
          <div class="toolbar" style="margin-top: 12px;">
            <button class="btn btn-ghost" onclick="editTeacher('${t.id}')">Edit</button>
            <button class="btn btn-danger" onclick="deleteTeacher('${t.id}')">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function addTeacherModal() {
  const name = prompt("Teacher name:");
  if (!name) return;
  const id = prompt("Teacher ID:");
  if (!id) return;
  const cls = prompt("Assigned class:");
  if (!cls) return;

  if (DB.teachers.has(id)) {
    toast("Teacher ID already exists", "error");
    return;
  }

  DB.teachers.set(id, {
    id,
    password: hashPassword("1234"),
    name,
    role: "teacher",
    class: cls
  });

  toast("Teacher added. Default password: 1234", "success");
  showTeachers();
}

function editTeacher(id) {
  const teacher = DB.teachers.get(id);
  if (!teacher) return;

  const name = prompt("Teacher name:", teacher.name);
  if (name) teacher.name = name;

  const cls = prompt("Assigned class:", teacher.class);
  if (cls) teacher.class = cls;

  toast("Teacher updated", "success");
  showTeachers();
}

function deleteTeacher(id) {
  if (confirm("Delete this teacher?")) {
    DB.teachers.delete(id);
    toast("Teacher deleted", "success");
    showTeachers();
  }
}

// ============================================
// ATTENDANCE PAGE
// ============================================

function showAttendance() {
  const content = document.getElementById("contentView");

  if (currentUser.role === "teacher") {
    selectedClass = currentUser.class;
  } else {
    selectedClass = selectedClass || DB.classes[0];
  }

  const students = DB.students.filter(s => s.class === selectedClass);
  const today = new Date().toLocaleDateString("en-GB");

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Mark Attendance</h1>
      <p class="page-subtitle">${today}</p>
    </div>

    <div class="card">
      <div class="toolbar">
        <div style="flex: 1;">
          <label class="form-label">Select Class</label>
          <select class="select" id="classSelect" onchange="changeAttendanceClass(this.value)" ${currentUser.role === "teacher" ? "disabled" : ""}>
            ${DB.classes.map(c => `<option value="${c}" ${c === selectedClass ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <button class="btn btn-ghost" onclick="markAllPresent()" style="align-self: flex-end;">✓ Mark All Present</button>
      </div>

      <div id="attendanceList" style="margin-top: 20px;">
        ${students.length === 0 ? 
          `<div class="empty-state"><div class="empty-icon">📭</div><div class="empty-title">No students in this class</div></div>` :
          students.map(s => `
            <div class="student-card" style="margin-bottom: 12px;">
              <div class="student-header">
                <div>
                  <div class="student-name">${s.name}</div>
                  <div class="student-meta">Roll: ${s.roll} | ${s.class} - ${s.section}</div>
                </div>
                <span class="chip" id="status-${s.id}">Not marked</span>
              </div>
              <div class="attendance-controls">
                <button class="status-btn present" onclick="markAttendance('${s.id}', 'Present')">✓ Present</button>
                <button class="status-btn absent" onclick="markAttendance('${s.id}', 'Absent')">✕ Absent</button>
                <button class="status-btn leave" onclick="markAttendance('${s.id}', 'Leave')">• Leave</button>
              </div>
            </div>
          `).join("")
        }
      </div>

      <button class="btn btn-primary btn-block" onclick="saveAttendance()" style="margin-top: 20px;">💾 Save Attendance</button>
    </div>
  `;
}

function changeAttendanceClass(className) {
  selectedClass = className;
  showAttendance();
}

function markAttendance(studentId, status) {
  if (!attendanceData[studentId]) {
    attendanceData[studentId] = {};
  }
  attendanceData[studentId].status = status;

  // Update UI
  const buttons = event.target.parentElement.querySelectorAll(".status-btn");
  buttons.forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");

  const statusChip = document.getElementById(`status-${studentId}`);
  if (statusChip) {
    statusChip.textContent = status;
    statusChip.style.background = status === "Present" ? "#d1fae5" : status === "Absent" ? "#fee2e2" : "#fef3c7";
    statusChip.style.color = status === "Present" ? "#047857" : status === "Absent" ? "#dc2626" : "#d97706";
  }
}

function markAllPresent() {
  const students = DB.students.filter(s => s.class === selectedClass);
  students.forEach(s => {
    attendanceData[s.id] = { status: "Present" };
  });
  showAttendance();
  toast("All students marked present", "success");
}

function saveAttendance() {
  const students = DB.students.filter(s => s.class === selectedClass);
  const date = new Date().toISOString().split("T")[0];

  const records = students.map(s => ({
    date,
    studentId: s.id,
    name: s.name,
    class: selectedClass,
    status: attendanceData[s.id]?.status || "Not Marked",
    teacher: currentUser.name
  }));

  DB.attendance.push(...records);
  toast("Attendance saved successfully", "success");
  attendanceData = {};

  // Sync to server (if configured)
  syncToServer({ action: "attendance", records });
}

// ============================================
// REPORTS PAGE
// ============================================

function showReports() {
  const content = document.getElementById("contentView");

  content.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Reports</h1>
      <p class="page-subtitle">Attendance and performance reports</p>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Class</th>
              <th>Date</th>
              <th>Status</th>
              <th>Teacher</th>
            </tr>
          </thead>
          <tbody>
            ${DB.attendance.length === 0 ? 
              `<tr><td colspan="5" style="text-align: center; color: var(--text-secondary);">No attendance records yet</td></tr>` :
              DB.attendance.slice(-20).reverse().map(r => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.class}</td>
                  <td>${r.date}</td>
                  <td>
                    <span class="chip ${r.status === "Present" ? "success" : r.status === "Absent" ? "danger" : "warning"}">
                      ${r.status}
                    </span>
                  </td>
                  <td>${r.teacher}</td>
                </tr>
              `).join("")
            }
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ============================================
// SETTINGS & PROFILE
// ============================================

function openSettings() {
  const modal = document.getElementById("settingsModal");
  modal.classList.remove("hidden");

  // Populate fields
  document.getElementById("settingName").value = currentUser.name;
  document.getElementById("settingId").value = currentUser.id;
  document.getElementById("settingRole").value = currentUser.role === "admin" ? "Administrator" : "Teacher";

  if (currentUser.role === "teacher") {
    document.getElementById("teacherClassGroup").classList.remove("hidden");
    document.getElementById("settingClass").value = currentUser.class;
  } else {
    document.getElementById("teacherClassGroup").classList.add("hidden");
  }

  // Show overlay
  document.getElementById("overlay").classList.add("show");
}

function closeSettings() {
  document.getElementById("settingsModal").classList.add("hidden");
  document.getElementById("overlay").classList.remove("show");
}

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(t => t.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));

  // Show selected tab
  document.getElementById(tabName + "Tab").classList.add("active");
  event.target.classList.add("active");
}

function changePassword() {
  const current = document.getElementById("currentPassword").value;
  const newPwd = document.getElementById("newPassword").value;
  const confirm = document.getElementById("confirmPassword").value;

  if (!current || !newPwd || !confirm) {
    toast("Please fill all password fields", "error");
    return;
  }

  if (hashPassword(current) !== currentUser.password) {
    toast("Current password is incorrect", "error");
    return;
  }

  if (newPwd !== confirm) {
    toast("New passwords do not match", "error");
    return;
  }

  if (newPwd.length < 4) {
    toast("Password must be at least 4 characters", "error");
    return;
  }

  // Update password
  currentUser.password = hashPassword(newPwd);
  if (currentUser.role === "admin") {
    DB.admins.set(currentUser.id, currentUser);
  } else {
    DB.teachers.set(currentUser.id, currentUser);
  }

  // Clear form
  document.getElementById("currentPassword").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";

  toast("Password changed successfully", "success");
}

function confirmLogout() {
  if (confirm("Are you sure you want to log out?")) {
    logout();
  }
}

function logout() {
  currentUser = null;
  attendanceData = {};
  document.getElementById("appScreen").classList.add("hidden");
  document.getElementById("loginScreen").classList.remove("hidden");
  document.getElementById("loginId").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("settingsModal").classList.add("hidden");
  document.getElementById("overlay").classList.remove("show");
  toast("Logged out successfully", "success");
}

function syncToServer(data) {
  if (!window.SOTOTA_CONFIG?.WEB_APP_URL) return;
  
  try {
    fetch(window.SOTOTA_CONFIG.WEB_APP_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).catch(e => console.log("Sync:", e));
  } catch (e) {
    console.log(e);
  }
}

// ============================================
// EVENT LISTENERS
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  // Role selection
  document.querySelectorAll(".role-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".role-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentRole = btn.dataset.role;
    });
  });

  // Login button
  document.getElementById("loginBtn").addEventListener("click", handleLogin);

  // Enter key for login
  document.getElementById("loginPassword").addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleLogin();
  });

  // Theme button
  document.getElementById("themeBtn").addEventListener("click", toggleDarkMode);

  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", confirmLogout);

  // Settings button
  document.getElementById("settingsBtn").addEventListener("click", openSettings);

  // Close settings on overlay click
  document.getElementById("overlay").addEventListener("click", closeSettings);

  // Close settings button
  const closeSettingsBtn = document.querySelector(".close-btn");
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener("click", closeSettings);
  }

  // Mobile menu toggle
  document.getElementById("menuBtn").addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
});
