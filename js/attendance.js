// Block access if not logged in then redirects you to the login page
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}
// Load attendance data
fetch("data/attendance.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("attendanceContainer");
    const records = data.attendanceAndLeave;

    records.forEach(emp => {
      // this here counts how many times present/absent
      const totalDays = emp.attendance.length;
      const presentDays = emp.attendance.filter(a => a.status === "Present").length;
      const absentDays = totalDays - presentDays;

      const card = document.createElement("div");
      card.className = "col-md-6";

      card.innerHTML = `
            <div class="card shadow-sm border-0">
              <div class="card-body">
                <h5 class="card-title">${emp.name}</h5>
                <p><strong>Total Days:</strong> ${totalDays}</p>
                <p><span class="badge bg-success">Present: ${presentDays}</span> 
                   <span class="badge bg-danger ms-2">Absent: ${absentDays}</span></p>

                <h6 class="mt-4">Recent Attendance:</h6>
                <ul class="list-group list-group-flush mb-3">
                  ${emp.attendance.slice(-5).map(day => `
                    <li class="list-group-item d-flex justify-content-between">
                      ${day.date}
                      <span class="badge ${day.status === 'Present' ? 'bg-success' : 'bg-danger'}">${day.status}</span>
                    </li>
                  `).join("")}
                </ul>

                <h6>Leave Requests:</h6>
                <ul class="list-group list-group-flush">
                  ${emp.leaveRequests.length > 0 ? emp.leaveRequests.map(req => `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <strong>${req.date}</strong><br>
                        <small>${req.reason}</small>
                      </div>
                      <span class="badge ${req.status === 'Approved' ? 'bg-success' : req.status === 'Pending' ? 'bg-warning text-dark' : 'bg-danger'}">${req.status}</span>
                    </li>
                  `).join("") : `<li class="list-group-item">No leave requests</li>`}
                </ul>
              </div>
            </div> `;
      container.appendChild(card);
    });
  })
  .catch(err => {
    document.getElementById("attendanceContainer").innerHTML =
      `<div class="alert alert-danger">Error loading data: ${err}</div>`;
  });