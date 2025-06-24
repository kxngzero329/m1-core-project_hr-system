// Check if the user is logged in
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

// Logout function
function logout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}

// Sidebar toggles for mobile
const openSidebarBtn = document.getElementById("openSidebar");
const closeSidebarBtn = document.getElementById("closeSidebar");

openSidebarBtn?.addEventListener("click", () => {
  document.getElementById("sidebar").style.display = "block";
});

closeSidebarBtn?.addEventListener("click", () => {
  document.getElementById("sidebar").style.display = "none";
});

// Global references
const tbody = document.getElementById("payroll-table-body");
const employeeMap = {};

// Load both employee and payroll data
Promise.all([
  fetch("data/employee_info.json").then(res => res.json()),
  fetch("data/payroll_data.json").then(res => res.json())
])
  .then(([employeeData, payrollData]) => {
    const employees = employeeData.employeeInformation;
    const payroll = payrollData.payrollData;

    // Build a map for fast lookup
    employees.forEach(emp => {
      employeeMap[emp.employeeId] = emp;
    });

    const calculated = calculatePayroll(payroll);
    renderPayrollTable(calculated);
  })
  .catch(err => console.error("Data load failed:", err));


// code below
//this is the function to calculate payroll for each employee
// it takes in the payroll data and returns the calculated payroll
// to calculate allowances, it multiplies the base salary by 0.1 which is like 10%
// to calculate deductions, it multiplies the leave days by 200
// to calculate net pay, it subtracts deductions from base salary
// to calculate status, it checks if deductions are less than 800, if so, it is good, if not, it checks if deductions are less than 1500, if so, it is review, if not, it is warning
function calculatePayroll(data) {
  return data.map(p => {
    const emp = employeeMap[p.employeeId];
    const baseSalary = emp.salary;
    const allowances = Math.round(baseSalary * 0.1);
    const deductions = Math.round(p.leaveDeductions * 200);
    const netPay = baseSalary + allowances - deductions;
    const status = deductions < 800 ? "Good" : deductions < 1500 ? "Review" : "Warning";

    return {
      ...p,
      name: emp.name,
      position: emp.position,
      department: emp.department,
      contact: emp.contact,
      baseSalary,
      allowances,
      deductions,
      netPay,
      status
    };
  });
}

// Render the payroll table
function renderPayrollTable(data) {
  tbody.innerHTML = "";

  data.forEach((item, index) => {
    const badgeClass = item.status === 'Good' ? 'success' : item.status === 'Review' ? 'warning text-dark' : 'danger';

    // Create the table row and add the data so that it can be displayed in the table from the inner html
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="d-flex align-items-center gap-2">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=0d6efd&color=fff&size=32" class="rounded-avatar" alt="avatar">${item.name}</td> 
      <td>${item.position}</td>
      <td>R ${item.baseSalary.toLocaleString()}</td>
      <td>R ${item.allowances.toLocaleString()}</td>
      <td>R ${item.deductions.toLocaleString()}</td>
      <td>R ${item.netPay.toLocaleString()}</td>
      <td><span class="badge bg-${badgeClass}">${item.status}</span></td>
      <td><button class="btn btn-sm btn-info" onclick="viewPayslip(${item.employeeId})">View</button></td>
    `;
    tbody.appendChild(tr); // This adds the data to display in the table
  });
}

// View payslip modal for selected employee
function viewPayslip(empId) {
  const emp = employeeMap[empId];

  fetch("data/payroll_data.json")
    .then(res => res.json())
    .then(data => {
      const p = data.payrollData.find(entry => entry.employeeId === empId);
      const allowance = Math.round(emp.salary * 0.1);
      const deductions = Math.round(p.leaveDeductions * 200);
      const netPay = emp.salary + allowance - deductions;

      // Full detailed payslip format with logo and aligned currency
      const content = `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px;">
          <div style="text-align: center;">
            <img src="assets/logo-removebg-preview-1.png" alt="Company Logo" width="100" style="margin-bottom: 10px; border-radius: 50%; border: 1px double rgb(25, 40, 91);">
            <h4 style="margin-bottom: 20px; color:rgb(54, 54, 54);">Payslip from ModernTech HR</h4>
          </div>
          <p><strong>Name:</strong> ${emp.name}</p>
          <p><strong>Position:</strong> ${emp.position}</p>
          <p><strong>Department:</strong> ${emp.department}</p>
          <p><strong>Contact/Email:</strong> ${emp.contact}</p>
          <hr/>
          <p><strong>Base Salary:</strong> <span style="float:right;">R ${emp.salary.toLocaleString()}</span></p>
          <p><strong>Allowances:</strong> <span style="float:right;">+R ${allowance.toLocaleString()}</span></p>
          <p><strong>Deductions:</strong> <span style="float:right;">-R ${deductions.toLocaleString()}</span></p>
          <p><strong>Net Pay:</strong> <span style="float:right; font-weight:bold;">R ${netPay.toLocaleString()}</span></p>
        </div>`;

      document.getElementById("payslipDetails").innerHTML = content;

      const modal = new bootstrap.Modal(document.getElementById("payslipModal"));
      modal.show();

      document.getElementById("downloadPdfBtn").onclick = () => {
        html2pdf()
          .set({
            margin: 10,
            filename: `${emp.name.replace(" ", "_")}_Payslip.pdf`,
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
          })
          .from(document.getElementById("payslipDetails"))
          .save();
      };
    });
}

