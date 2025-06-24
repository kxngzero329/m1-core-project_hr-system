// Block access if not logged in then redirects you to the login page
if (localStorage.getItem("isLoggedIn") !== "true") {
  window.location.href = "login.html";
}

// Create a map to associate employee IDs with their data
let employeeMap = {};

// Fetch payroll and employee data concurrently
Promise.all([
  fetch("data/payroll_data.json").then(res => res.json()),
  fetch("data/employee_info.json").then(res => res.json())
]).then(([payrollData, employeeData]) => {
  const employees = employeeData.employeeInformation;
  const payroll = payrollData.payrollData;
  const tbody = document.getElementById("payroll-table-body");

  // Populate the employeeMap with employee data keyed by employeeId
  employees.forEach(emp => {
    employeeMap[emp.employeeId] = emp;
  });

  // hewe is the table row for each payroll entry
  payroll.forEach((p, index) => {
    const emp = employeeMap[p.employeeId];
    const baseSalary = emp.salary;
    const allowance = Math.round(baseSalary * 0.1); // Calculate allowance as 10% of base salary
    const deductions = Math.round(p.leaveDeductions * 200); // Calculate deductions based on leave
    // Determine employee status based on deductions
    const status = deductions < 800 ? "Good" : deductions < 1500 ? "Review" : "Warning";

    // Create a new table row element
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td class="d-flex align-items-center gap-2">
        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=0d6efd&color=fff&size=32" class="rounded-avatar" alt="avatar">
        ${emp.name}
      </td>
      <td>${emp.position}</td>
      <td>R ${baseSalary.toLocaleString()}</td>
      <td>R ${allowance.toLocaleString()}</td>
      <td>R ${deductions.toLocaleString()}</td>
      <td>R ${p.finalSalary.toLocaleString()}</td>
      <td><span class="badge bg-${status === 'Good' ? 'success' : status === 'Review' ? 'warning text-dark' : 'danger'}">${status}</span></td>
      <td><button class="btn btn-sm btn-info" onclick="viewPayslip(${p.employeeId})">View</button></td>
    `;
    // Append the row to the table body
    tbody.appendChild(tr);
  });
});

// Function to display the payslip modal for a specific employee
function viewPayslip(empId) {
  const emp = employeeMap[empId];

  // Fetch payroll data again to get the latest data for the employee
  fetch("data/payroll_data.json")
    .then(res => res.json())
    .then(data => {
      const p = data.payrollData.find(p => p.employeeId === empId);
      const allowance = Math.round(emp.salary * 0.1); // Calculate allowance as 10% of salary
      const deductions = Math.round(p.leaveDeductions * 200); // Calculate deductions

      // Generate HTML content for the payslip
      const content = `
        <div>
          <p><strong>Name:</strong> ${emp.name}</p>
          <p><strong>Position:</strong> ${emp.position}</p>
          <p><strong>Department:</strong> ${emp.department}</p>
          <p><strong>Contact/Email:</strong> ${emp.contact}</p>
          <hr/>
          <p><strong>Base Salary:</strong> R ${emp.salary.toLocaleString()}</p>
          <p><strong>Allowances:</strong> R ${allowance.toLocaleString()}</p>
          <p><strong>Deductions:</strong> R ${deductions.toLocaleString()}</p>
          <p><strong>Net Pay:</strong> R ${p.finalSalary.toLocaleString()}</p>
        </div>`;

      // Insert the content into the payslip modal
      document.getElementById("payslipDetails").innerHTML = content;

      // Initialize and show the modal
      const modal = new bootstrap.Modal(document.getElementById("payslipModal"));
      modal.show();

      // Set up the PDF download button
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
