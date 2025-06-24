//  BLOCK ACCESS IF NOT LOGGED IN
// Redirects the user to the login page if not authenticated
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

// LOGOUT FUNCTION
// Clears login session and redirects to login page
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

// SIDEBAR TOGGLE FUNCTIONALITY FOR MOBILE
document.getElementById("openSidebar")?.addEventListener("click", () => {
  document.getElementById("sidebar").style.display = "block";
});

document.getElementById("closeSidebar")?.addEventListener("click", () => {
  document.getElementById("sidebar").style.display = "none";
});

//  INITIALIZE LEAVE REQUESTS FROM LOCALSTORAGE OR EMPTY
let leaveRequests = JSON.parse(localStorage.getItem("leaveRequests")) || [];

//  REFERENCE DOM ELEMENTS
const leaveForm = document.getElementById("leaveForm");
const leaveTableBody = document.getElementById("leaveTableBody");

//  RENDER LEAVE REQUESTS INTO TABLE
function renderLeaveTable() {
  leaveTableBody.innerHTML = ""; // Clear previous entries

  leaveRequests.forEach((req, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${req.name}</td>
      <td>${req.start}</td>
      <td>${req.end}</td>
      <td>${req.reason}</td>
      <td><span class="badge bg-${req.status === 'Approved' ? 'success' : req.status === 'Denied' ? 'danger' : 'secondary'}">${req.status}</span></td>
      <td>
        ${req.status === 'Pending' ? `
          <button class="btn btn-sm btn-success me-1" onclick="updateStatus(${index}, 'Approved')">Approve</button>
          <button class="btn btn-sm btn-danger" onclick="updateStatus(${index}, 'Denied')">Deny</button>
        ` : '--'}
      </td>
    `;

    leaveTableBody.appendChild(row);
  });
}

//  UPDATE STATUS (Approve / Deny)
function updateStatus(index, newStatus) {
  leaveRequests[index].status = newStatus;
  localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));
  renderLeaveTable(); // Re-render to reflect updates
}

//  FORM SUBMISSION: CREATE NEW LEAVE REQUEST
leaveForm.addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent page reload

  // Get form values
  const name = document.getElementById("empName").value.trim();
  const start = document.getElementById("startDate").value;
  const end = document.getElementById("endDate").value;
  const reason = document.getElementById("reason").value.trim();

  // Validate date logic
  if (new Date(start) > new Date(end)) {
    alert("End date cannot be before start date.");
    return;
  }

  // Create request object and store it
  leaveRequests.push({
    name,
    start,
    end,
    reason,
    status: "Pending"
  });

  // Save to localStorage and re-render table
  localStorage.setItem("leaveRequests", JSON.stringify(leaveRequests));
  renderLeaveTable();

  // Clear the form
  leaveForm.reset();

  // Auto-close the modal after submission
  bootstrap.Modal.getInstance(document.getElementById("leaveModal")).hide();
});

//FETCH EMPLOYEE NAMES FROM JSON AND POPULATE SELECT DROPDOWN
fetch("data/employee_info.json")
  .then(res => res.json())
  .then(data => {
    const employeeSelect = document.getElementById("empName");

    data.employeeInformation.forEach(emp => {
      const option = document.createElement("option");
      option.value = emp.name;
      option.textContent = emp.name;
      employeeSelect.appendChild(option);
    });
  })
  .catch(error => {
    console.error("Failed to load employee names:", error);
  });

//  INITIAL TABLE LOAD ON PAGE START
renderLeaveTable();
