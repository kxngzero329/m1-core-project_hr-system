// this code block prevents access if not logged in then redirects you to the login page
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

// Initializes the sidebar toggle functionality
const sidebar = document.getElementById("sidebar");
const openBtn = document.getElementById("openSidebar");
const closeBtn = document.getElementById("closeSidebar");

openBtn.addEventListener("click", () => {
  sidebar.classList.add("show-sidebar");
});

closeBtn.addEventListener("click", () => {
  sidebar.classList.remove("show-sidebar");
});

// this code below fetches employee and attendance data, calculates totals, and updates the dashboard
Promise.all([
  fetch("data/employee_info.json").then(res => res.json()),
  fetch("data/attendance.json").then(res => res.json())
]).then(([employeeData, attendanceData]) => {
  document.getElementById("total-employees").textContent =
    employeeData.employeeInformation.length;

  const allAttendance = attendanceData.attendanceAndLeave;
  let presentToday = 0;

  if (allAttendance.length > 0) {
    const latestDate = allAttendance[0].attendance.at(-1).date;

    allAttendance.forEach(emp => {
      const status = emp.attendance.find(a => a.date === latestDate);
      if (status && status.status === "Present") {
        presentToday++;
      }
    });
  }

  document.getElementById("present-today").textContent = presentToday;

  let pending = 0;
  allAttendance.forEach(emp => {
    emp.leaveRequests.forEach(req => {
      if (req.status === "Pending") pending++;
    });
  });

  document.getElementById("pending-leaves").textContent = pending;
});

// Load JSON files
Promise.all([
  fetch("data/employee_info.json").then(res => res.json()),
  fetch("data/attendance.json").then(res => res.json())
]).then(([employeeData, attendanceData]) => {
  const employees = employeeData.employeeInformation;
  const attendance = attendanceData.attendanceAndLeave;

  // Total Employees
  document.getElementById("total-employees").textContent = employees.length;

  // Present Today (latest date)
  const latestDate = attendance[0].attendance.at(-1).date;
  let presentToday = 0;
  attendance.forEach(emp => {
    const status = emp.attendance.find(a => a.date === latestDate);
    if (status?.status === "Present") presentToday++;
  });
  document.getElementById("present-today").textContent = presentToday;

  // Pending Leaves
  let pending = 0;
  attendance.forEach(emp => {
    emp.leaveRequests.forEach(req => {
      if (req.status === "Pending") pending++;
    });
  });
  document.getElementById("pending-leaves").textContent = pending;

  // this bar charts functionality represents the total attendance and absences
  const totalDays = attendance[0].attendance.length;
  const totalPresent = attendance.reduce((sum, emp) => {
    return sum + emp.attendance.filter(a => a.status === "Present").length;
  }, 0);
  const totalAbsent = (attendance.length * totalDays) - totalPresent;

  new Chart(document.getElementById("attendanceChart"), {
    type: "bar",
    data: {
      labels: ["Total Attendance"],
      datasets: [
        { label: "Present", data: [totalPresent], backgroundColor: "#0d6efd" },
        { label: "Absent", data: [totalAbsent], backgroundColor: "#dc3545" }
      ]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // Donut Chart: Department Distribution
  const deptCount = {};
  employees.forEach(emp => {
    deptCount[emp.department] = (deptCount[emp.department] || 0) + 1;
  });
  new Chart(document.getElementById("departmentChart"), {
    type: "doughnut",
    data: {
      labels: Object.entries(deptCount).map(([dept, count]) => `${dept}: ${(count / employees.length * 100).toFixed(1)}%`),
      datasets: [{
        data: Object.values(deptCount),
        backgroundColor: ["#0d6efd", "#198754", "#ffc107", "#dc3545", "#6f42c1", "#20c997"]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%'
    }
  });

  // Recent Activity
  const activityList = document.getElementById("activityList");
  attendance.slice(0, 5).forEach(emp => {
    const lastStatus = emp.attendance.at(-1);
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
        <div>
          <strong>${emp.name}</strong>
          <br/>
          <small>${lastStatus.date}</small>
          <br/>
          
        </div>
        <span class="badge bg-${lastStatus.status === 'Present' ? 'success' : 'danger'}">${lastStatus.status}</span>
      `;
    activityList.appendChild(li);
  });
});

// this code block handles the logout functionality
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}