// ========== GLOBAL VARIABLES ==========
let students = [];
let staff = [];
let attendance = [];
let fees = [];
let exams = [];
let elearning = [];
let activities = [];
let currentPage = {};
let itemsPerPage = 10;

// ========== SYSTEM INITIALIZATION ==========
function initializeSystem() {
    loadAllData();
    setupEventListeners();
    updateDashboardStats();
    startAutoSave();
    updateSystemInfo();
}

function loadAllData() {
    students = JSON.parse(localStorage.getItem('sms_students')) || [];
    staff = JSON.parse(localStorage.getItem('sms_staff')) || [];
    attendance = JSON.parse(localStorage.getItem('sms_attendance')) || [];
    fees = JSON.parse(localStorage.getItem('sms_fees')) || [];
    exams = JSON.parse(localStorage.getItem('sms_exams')) || [];
    elearning = JSON.parse(localStorage.getItem('sms_elearning')) || [];
    activities = JSON.parse(localStorage.getItem('sms_activities')) || [];
    
    renderAllTables();
    updateActivityList();
}

function saveAllData() {
    localStorage.setItem('sms_students', JSON.stringify(students));
    localStorage.setItem('sms_staff', JSON.stringify(staff));
    localStorage.setItem('sms_attendance', JSON.stringify(attendance));
    localStorage.setItem('sms_fees', JSON.stringify(fees));
    localStorage.setItem('sms_exams', JSON.stringify(exams));
    localStorage.setItem('sms_elearning', JSON.stringify(elearning));
    localStorage.setItem('sms_activities', JSON.stringify(activities));
    
    localStorage.setItem('sms_last_save', new Date().toISOString());
    updateSystemInfo();
}

// ========== NAVIGATION ==========
function openModule(moduleId) {
    // Hide all modules
    document.querySelectorAll('.module').forEach(module => {
        module.classList.remove('active');
    });
    
    // Update active nav item
    document.querySelectorAll('.nav-menu li').forEach(item => {
        item.classList.remove('active');
    });
    
    // Show selected module
    const module = document.getElementById(moduleId);
    if (module) {
        module.classList.add('active');
        document.getElementById('currentModule').textContent = module.querySelector('h2').textContent;
        
        // Activate corresponding nav item
        const navItems = document.querySelectorAll('.nav-menu li');
        const navMap = {
            'dashboard': 0, 'students': 1, 'staff': 2, 'attendance': 3,
            'fees': 4, 'exams': 5, 'elearning': 6, 'reports': 7, 'settings': 8
        };
        if (navMap[moduleId] !== undefined) {
            navItems[navMap[moduleId]].classList.add('active');
        }
    }
    
    // Close mobile sidebar if open
    if (window.innerWidth <= 1200) {
        document.querySelector('.sidebar').classList.remove('active');
    }
}

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('active');
}

// ========== DATE & TIME ==========
function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    document.getElementById('currentDateTime').textContent = 
        now.toLocaleDateString('en-US', options);
}

// ========== DASHBOARD FUNCTIONS ==========
function updateDashboardStats() {
    // Total Students
    document.getElementById('totalStudents').textContent = students.length;
    
    // Total Staff
    document.getElementById('totalStaff').textContent = staff.length;
    
    // Attendance Rate (dummy calculation)
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const attendanceRate = students.length > 0 ? 
        Math.round((todayAttendance.length / students.length) * 100) : 0;
    document.getElementById('attendanceRate').textContent = attendanceRate + '%';
    
    // Total Fees Collected
    const totalFees = fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    document.getElementById('totalFees').textContent = '₹' + totalFees.toLocaleString('en-IN');
    
    // Update trends
    updateTrends();
}

function updateTrends() {
    // This function would calculate actual trends based on historical data
    // For now, using dummy data
    const trends = {
        students: Math.random() > 0.5 ? 'up' : 'down',
        staff: Math.random() > 0.5 ? 'up' : 'down',
        attendance: Math.random() > 0.5 ? 'up' : 'down',
        fees: Math.random() > 0.5 ? 'up' : 'down'
    };
    
    // Update trend indicators
    document.querySelectorAll('.stat-trend').forEach((trendEl, index) => {
        const trendTypes = Object.values(trends);
        if (trendTypes[index] === 'up') {
            trendEl.innerHTML = '<i class="fas fa-arrow-up"></i> 12%';
            trendEl.className = 'stat-trend up';
        } else {
            trendEl.innerHTML = '<i class="fas fa-arrow-down"></i> 5%';
            trendEl.className = 'stat-trend down';
        }
    });
}

function refreshStats() {
    updateDashboardStats();
    showToast('Dashboard refreshed successfully!', 'success');
    addActivity('Refreshed dashboard statistics');
}

// ========== STUDENT MANAGEMENT ==========
function showStudentForm() {
    document.getElementById('studentForm').style.display = 'block';
    document.getElementById('studentName').focus();
    
    // Clear form
    document.getElementById('studentForm').querySelectorAll('input, select, textarea').forEach(input => {
        input.value = '';
    });
    
    // Generate roll number if empty
    const nextRoll = students.length > 0 ? 
        Math.max(...students.map(s => parseInt(s.roll) || 0)) + 1 : 1001;
    document.getElementById('studentRoll').value = nextRoll;
}

function saveStudent() {
    const student = {
        id: generateID(),
        roll: document.getElementById('studentRoll').value,
        name: document.getElementById('studentName').value,
        class: document.getElementById('studentClass').value,
        dob: document.getElementById('studentDOB').value,
        contact: document.getElementById('studentContact').value,
        email: document.getElementById('studentEmail').value,
        address: document.getElementById('studentAddress').value,
        status: 'active',
        dateAdded: new Date().toISOString()
    };
    
    // Validation
    if (!student.name || !student.roll || !student.class) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    students.push(student);
    saveAllData();
    renderStudentTable();
    showToast('Student added successfully!', 'success');
    addActivity(`Added student: ${student.name}`);
    
    // Hide form
    document.getElementById('studentForm').style.display = 'none';
    updateDashboardStats();
}

function renderStudentTable() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    students.forEach((student, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.roll || 'N/A'}</td>
            <td>
                <div class="student-info">
                    <strong>${student.name}</strong>
                    <small>${student.email || 'No email'}</small>
                </div>
            </td>
            <td>${student.class || 'N/A'}</td>
            <td>${student.contact || 'N/A'}</td>
            <td>${student.email || 'N/A'}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <button class="btn btn-sm" onclick="editStudent(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStudent(${index})">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewStudent(${index})">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteStudent(index) {
    const student = students[index];
    if (confirm(`Are you sure you want to delete ${student.name}?`)) {
        students.splice(index, 1);
        saveAllData();
        renderStudentTable();
        showToast('Student deleted successfully!', 'success');
        addActivity(`Deleted student: ${student.name}`);
        updateDashboardStats();
    }
}

function editStudent(index) {
    const student = students[index];
    showStudentForm();
    
    // Populate form with student data
    document.getElementById('studentRoll').value = student.roll;
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentClass').value = student.class;
    document.getElementById('studentDOB').value = student.dob;
    document.getElementById('studentContact').value = student.contact;
    document.getElementById('studentEmail').value = student.email;
    document.getElementById('studentAddress').value = student.address;
    
    // Change save button to update
    const saveBtn = document.querySelector('#studentForm .btn-success');
    saveBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
    saveBtn.onclick = function() { updateStudent(index); };
}

function updateStudent(index) {
    const student = {
        ...students[index],
        roll: document.getElementById('studentRoll').value,
        name: document.getElementById('studentName').value,
        class: document.getElementById('studentClass').value,
        dob: document.getElementById('studentDOB').value,
        contact: document.getElementById('studentContact').value,
        email: document.getElementById('studentEmail').value,
        address: document.getElementById('studentAddress').value
    };
    
    students[index] = student;
    saveAllData();
    renderStudentTable();
    showToast('Student updated successfully!', 'success');
    addActivity(`Updated student: ${student.name}`);
    
    document.getElementById('studentForm').style.display = 'none';
}

// ========== STAFF MANAGEMENT ==========
function showStaffForm() {
    document.getElementById('staffForm').style.display = 'block';
}

function saveStaff() {
    const staffMember = {
        id: generateID(),
        name: document.getElementById('staffName').value,
        designation: document.getElementById('staffDesignation').value,
        subject: document.getElementById('staffSubject').value,
        contact: document.getElementById('staffContact').value,
        email: document.getElementById('staffEmail').value,
        joinDate: document.getElementById('staffJoinDate').value,
        status: 'active',
        dateAdded: new Date().toISOString()
    };
    
    if (!staffMember.name || !staffMember.designation) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    staff.push(staffMember);
    saveAllData();
    renderStaffTable();
    showToast('Staff member added successfully!', 'success');
    addActivity(`Added staff: ${staffMember.name}`);
    
    document.getElementById('staffForm').style.display = 'none';
    updateDashboardStats();
}

function renderStaffTable() {
    const tbody = document.getElementById('staffTableBody');
    tbody.innerHTML = '';
    
    staff.forEach((member, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.id.substring(0, 8)}</td>
            <td>
                <div>
                    <strong>${member.name}</strong>
                    <small>${member.email || 'No email'}</small>
                </div>
            </td>
            <td>${member.designation}</td>
            <td>${member.subject || 'N/A'}</td>
            <td>${member.contact || 'N/A'}</td>
            <td><span class="status-badge status-active">Active</span></td>
            <td>
                <button class="btn btn-sm" onclick="editStaff(${index})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteStaff(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// ========== ATTENDANCE MANAGEMENT ==========
function markAttendance() {
    if (students.length === 0) {
        showToast('No students found. Please add students first.', 'error');
        return;
    }
    
    const date = document.getElementById('attendanceDate').value || 
                 new Date().toISOString().split('T')[0];
    
    // Create attendance entries for all students
    students.forEach(student => {
        const attendanceEntry = {
            id: generateID(),
            studentId: student.id,
            studentName: student.name,
            studentClass: student.class,
            date: date,
            status: 'present', // Default status
            remarks: '',
            markedBy: 'Admin',
            markedAt: new Date().toISOString()
        };
        
        // Check if attendance already exists for this date
        const existing = attendance.find(a => 
            a.studentId === student.id && a.date === date
        );
        
        if (!existing) {
            attendance.push(attendanceEntry);
        }
    });
    
    saveAllData();
    renderAttendanceTable();
    showToast('Attendance marked for all students!', 'success');
    addActivity('Marked attendance for all students');
    updateAttendanceSummary();
}

function renderAttendanceTable() {
    const tbody = document.getElementById('attendanceTableBody');
    tbody.innerHTML = '';
    
    const date = document.getElementById('attendanceDate').value || 
                 new Date().toISOString().split('T')[0];
    const selectedClass = document.getElementById('attendanceClass').value;
    
    // Filter attendance
    let filtered = attendance.filter(a => a.date === date);
    if (selectedClass) {
        filtered = filtered.filter(a => a.studentClass === selectedClass);
    }
    
    filtered.forEach((record, index) => {
        const row = document.createElement('tr');
        const student = students.find(s => s.id === record.studentId);
        const roll = student ? student.roll : 'N/A';
        
        row.innerHTML = `
            <td>${roll}</td>
            <td>${record.studentName}</td>
            <td>${record.studentClass}</td>
            <td>
                <select class="attendance-status" onchange="updateAttendanceStatus(${index}, this.value)">
                    <option value="present" ${record.status === 'present' ? 'selected' : ''}>Present</option>
                    <option value="absent" ${record.status === 'absent' ? 'selected' : ''}>Absent</option>
                    <option value="late" ${record.status === 'late' ? 'selected' : ''}>Late</option>
                    <option value="excused" ${record.status === 'excused' ? 'selected' : ''}>Excused</option>
                </select>
            </td>
            <td>${formatDate(record.date)}</td>
            <td>
                <input type="text" class="attendance-remarks" 
                       value="${record.remarks}" 
                       placeholder="Remarks"
                       onchange="updateAttendanceRemarks(${index}, this.value)">
            </td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAttendance(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateAttendanceSummary();
}

function updateAttendanceStatus(index, status) {
    attendance[index].status = status;
    saveAllData();
    updateAttendanceSummary();
    addActivity(`Updated attendance status to ${status}`);
}

function updateAttendanceSummary() {
    const date = document.getElementById('attendanceDate').value || 
                 new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === date);
    
    const present = todayAttendance.filter(a => a.status === 'present').length;
    const absent = todayAttendance.filter(a => a.status === 'absent').length;
    const late = todayAttendance.filter(a => a.status === 'late').length;
    const total = todayAttendance.length;
    
    document.getElementById('presentCount').textContent = present;
    document.getElementById('absentCount').textContent = absent;
    document.getElementById('lateCount').textContent = late;
    document.getElementById('totalAttendance').textContent = total;
}

// ========== FEE MANAGEMENT ==========
function showFeeForm() {
    // Populate student dropdown
    const studentSelect = document.getElementById('feeStudent');
    studentSelect.innerHTML = '<option value="">Select Student</option>';
    
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.class})`;
        studentSelect.appendChild(option);
    });
    
    document.getElementById('feeForm').style.display = 'block';
    document.getElementById('feeDate').value = new Date().toISOString().split('T')[0];
}

function saveFee() {
    const fee = {
        id: generateID(),
        receiptNo: 'REC' + Date.now().toString().substr(-6),
        studentId: document.getElementById('feeStudent').value,
        studentName: students.find(s => s.id === document.getElementById('feeStudent').value)?.name || 'Unknown',
        feeType: document.getElementById('feeType').value,
        amount: parseFloat(document.getElementById('feeAmount').value),
        date: document.getElementById('feeDate').value,
        paymentMethod: document.getElementById('feeMethod').value,
        remarks: document.getElementById('feeRemarks').value,
        status: 'paid',
        collectedBy: 'Admin',
        collectedAt: new Date().toISOString()
    };
    
    if (!fee.studentId || !fee.feeType || !fee.amount) {
        showToast('Please fill all required fields', 'error');
        return;
    }
    
    fees.push(fee);
    saveAllData();
    renderFeeTable();
    showToast('Fee collected successfully!', 'success');
    addActivity(`Collected fee: ₹${fee.amount} from ${fee.studentName}`);
    
    document.getElementById('feeForm').style.display = 'none';
    updateDashboardStats();
    updateFeeSummary();
}

function renderFeeTable() {
    const tbody = document.getElementById('feeTableBody');
    tbody.innerHTML = '';
    
    fees.forEach((fee, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fee.receiptNo}</td>
            <td>${fee.studentName}</td>
            <td>${fee.feeType}</td>
            <td>₹${fee.amount.toLocaleString('en-IN')}</td>
            <td>${formatDate(fee.date)}</td>
            <td>${fee.paymentMethod}</td>
            <td><span class="status-badge status-active">Paid</span></td>
            <td>
                <button class="btn btn-sm" onclick="printReceipt(${index})">
                    <i class="fas fa-print"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteFee(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    updateFeeSummary();
}

function updateFeeSummary() {
    const totalCollected = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const thisMonth = new Date().getMonth();
    const monthlyCollection = fees
        .filter(fee => new Date(fee.date).getMonth() === thisMonth)
        .reduce((sum, fee) => sum + fee.amount, 0);
    
    document.getElementById('totalCollected').textContent = 
        '₹' + totalCollected.toLocaleString('en-IN');
    document.getElementById('monthlyCollection').textContent = 
        '₹' + monthlyCollection.toLocaleString('en-IN');
}

// ========== EXAM MANAGEMENT ==========
function showExamForm() {
    // Implementation for exam form
    showToast('Exam form will be implemented in next version', 'info');
}

// ========== E-LEARNING MANAGEMENT ==========
function showContentForm() {
    // Implementation for content form
    showToast('Content form will be implemented in next version', 'info');
}

// ========== UTILITY FUNCTIONS ==========
function generateID() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getIconForType(type)}"></i>
        <span>${message}</span>
        <button class="btn btn-sm" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 5000);
}

function getIconForType(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

function addActivity(description) {
    const activity = {
        id: generateID(),
        description: description,
        user: 'Admin',
        timestamp: new Date().toISOString(),
        icon: 'fas fa-history'
    };
    
    activities.unshift(activity);
    if (activities.length > 50) {
        activities = activities.slice(0, 50);
    }
    
    saveAllData();
    updateActivityList();
}

function updateActivityList() {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    container.innerHTML = '';
    
    activities.slice(0, 10).forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <i class="${activity.icon}"></i>
            <div>
                <p>${activity.description}</p>
                <small>${formatTimeAgo(activity.timestamp)} by ${activity.user}</small>
            </div>
        `;
        container.appendChild(item);
    });
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function searchTable(tableId, searchTerm) {
    const rows = document.querySelectorAll(`#${tableId} tbody tr`);
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

function exportToCSV(type) {
    let data, headers, filename;
    
    switch(type) {
        case 'students':
            data = students;
            headers = ['Roll No', 'Name', 'Class', 'Contact', 'Email', 'Status'];
            filename = `students_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        case 'fees':
            data = fees;
            headers = ['Receipt No', 'Student Name', 'Fee Type', 'Amount', 'Date', 'Status'];
            filename = `fees_${new Date().toISOString().split('T')[0]}.csv`;
            break;
        default:
            showToast('Export not available for this module', 'warning');
            return;
    }
    
    let csv = headers.join(',') + '\n';
    data.forEach(item => {
        const row = headers.map(header => {
            const value = item[header.toLowerCase().replace(/\s+/g, '')] || '';
            return `"${value}"`;
        });
        csv += row.join(',') + '\n';
    });
    
    downloadCSV(csv, filename);
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

function printTable(tableId) {
    const table = document.getElementById(tableId);
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Print Table</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f4f4f4; }
                h2 { color: #333; }
                .print-header { text-align: center; margin-bottom: 30px; }
                .print-footer { margin-top: 30px; text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h2>Moren Tech School Management System</h2>
                <p>Report generated on ${new Date().toLocaleString()}</p>
            </div>
            ${table.outerHTML}
            <div class="print-footer">
                <p>© 2026 Moren Tech. All rights reserved.</p>
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.print();
}

function updateSystemInfo() {
    const dataSize = JSON.stringify(localStorage).length / 1024;
    document.getElementById('dataSize').textContent = `Data: ${dataSize.toFixed(2)} KB`;
    
    const lastSave = localStorage.getItem('sms_last_save');
    if (lastSave) {
        const timeAgo = formatTimeAgo(lastSave);
        document.getElementById('lastSync').textContent = `Last sync: ${timeAgo}`;
    }
}

function startAutoSave() {
    setInterval(() => {
        saveAllData();
        // Show subtle notification
        const now = new Date();
        const timeString = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        console.log(`Auto-saved at ${timeString}`);
    }, 30000); // Save every 30 seconds
}

function setupEventListeners() {
    // Global search
    document.getElementById('globalSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm.length > 2) {
            searchAllTables(searchTerm);
        }
    });
    
    // Form cancel buttons
    document.querySelectorAll('.btn-secondary').forEach(btn => {
        if (btn.textContent.includes('Cancel')) {
            btn.onclick = cancelForm;
        }
    });
    
    // Initialize date fields
    document.querySelectorAll('input[type="date"]').forEach(input => {
        if (!input.value) {
            input.value = new Date().toISOString().split('T')[0];
        }
    });
}

function cancelForm() {
    document.querySelectorAll('.form-container').forEach(form => {
        form.style.display = 'none';
    });
}

function searchAllTables(searchTerm) {
    // Search across all visible tables
    document.querySelectorAll('.table-container tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

function renderAllTables() {
    renderStudentTable();
    renderStaffTable();
    renderAttendanceTable();
    renderFeeTable();
}

// Initialize on load
window.addEventListener('DOMContentLoaded', initializeSystem);