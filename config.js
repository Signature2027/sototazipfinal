/* 
   Sotota Attendance System - Configuration
   Paste your deployed Google Apps Script Web App URL here.
   Example: https://script.google.com/macros/s/XXXXXXXX/exec 
*/

window.SOTOTA_CONFIG = {
  // Your Google Apps Script Web App URL (optional, for server sync)
  WEB_APP_URL: "",
  
  // School information
  SCHOOL_NAME: "Sotota Pre-Cadet School",
  SCHOOL_LOCATION: "Dhaka, Bangladesh",
  
  // Application settings
  SETTINGS: {
    // Session timeout in minutes (0 = no timeout)
    SESSION_TIMEOUT: 30,
    
    // Enable password complexity requirements
    REQUIRE_STRONG_PASSWORD: true,
    
    // Auto-backup attendance data
    AUTO_BACKUP: true,
    
    // Notification settings
    ENABLE_NOTIFICATIONS: true,
    ENABLE_SOUND: false
  }
};

// Initialize localStorage for data persistence
if (!localStorage.getItem("sotota_backup")) {
  localStorage.setItem("sotota_backup", JSON.stringify({
    lastSync: new Date().toISOString(),
    records: []
  }));
}
