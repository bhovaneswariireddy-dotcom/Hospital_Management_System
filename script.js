const STORAGE_KEYS = {
      USERS: 'auracare_users',
      CURRENT_USER: 'auracare_current_user',
      DOCTORS: 'auracare_doctors',
      PATIENTS: 'auracare_patients',
      APPOINTMENTS: 'auracare_appointments',
      BILLS: 'auracare_bills',
      COUNTERS: 'auracare_counters'
    };

    function seedDatabaseIfEmpty() {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const initialUsers = [
          { id: 'U1', email: 'admin@auracare.com', password: 'admin123', name: 'Dr. Alistair Vance', role: 'admin', patientId: null },
          { id: 'U2', email: 'ranjan@auracare.com', password: 'ranjan123', name: 'Ranjan Kumar', role: 'patient', patientId: 'P102' }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
      }

      if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
        const initialDoctors = [
          { id: "D201", name: "Varun", spec: "Cardiology", fee: 1200 },
          { id: "D202", name: "Krishna", spec: "Neurology", fee: 1500 },
          { id: "D203", name: "Tarak", spec: "General Medicine", fee: 600 },
          { id: "D204", name: "Krishna Mohan", spec: "Pediatrics", fee: 900 }
        ];
        localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(initialDoctors));
      }

      if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
        const initialPatients = [
          { id: "P101", name: "Alakananda", age: 34, gender: "Female", email: "alice@auracare.com", history: "Hypertension (diagnosed 2023)", prescriptions: ["Amlodipine 5mg once daily", "Vitamin D3 60k"] },
          { id: "P102", name: "Ranjan Kumar", age: 32, gender: "Male", email: "ranjan@auracare.com", history: "Type 2 Diabetes", prescriptions: ["Metformin 500mg twice daily"] },
          { id: "P103", name: "Reshma", age: 29, gender: "Female", email: "elena@example.com", history: "Acute Migraines", prescriptions: ["Sumatriptan 50mg"] }
        ];
        localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));
      }

      if (!localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) {
        const initialAppointments = [
          { id: "A301", patientId: "P101", doctorId: "D201", date: "2026-09-24", status: "SCHEDULED" },
          { id: "A302", patientId: "P102", doctorId: "D202", date: "2026-09-25", status: "SCHEDULED" },
          { id: "A303", patientId: "P103", doctorId: "D204", date: "2026-09-26", status: "SCHEDULED" }
        ];
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(initialAppointments));
      }

      if (!localStorage.getItem(STORAGE_KEYS.BILLS)) {
        const initialBills = [
          { id: "B401", patientId: "P101", doctorFee: 1200, medFee: 350, roomFee: 0, total: 1550, paid: true },
          { id: "B402", patientId: "P102", doctorFee: 1500, medFee: 650, roomFee: 2000, total: 4150, paid: true },
          { id: "B403", patientId: "P101", doctorFee: 1200, medFee: 500, roomFee: 0, total: 1700, paid: false }
        ];
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(initialBills));
      }

      if (!localStorage.getItem(STORAGE_KEYS.COUNTERS)) {
        localStorage.setItem(STORAGE_KEYS.COUNTERS, JSON.stringify({ patient: 104, doctor: 205, appointment: 304, bill: 404, user: 3 }));
      }
    }

    seedDatabaseIfEmpty();

    // Data Access Helpers
    function getStored(key) {
      try {
        return JSON.parse(localStorage.getItem(key)) || [];
      } catch (e) {
        return [];
      }
    }

    function setStored(key, value) {
      localStorage.setItem(key, JSON.stringify(value));
    }

    function showToast(message, type = 'info') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerText = message;
      container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
      }, 3500);
    }

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & SESSION MANAGEMENT
    // -------------------------------------------------------------
    let currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || null;

    function switchAuthMode(mode) {
      const tabLogin = document.getElementById('tab-login');
      const tabSignup = document.getElementById('tab-signup');
      const formLogin = document.getElementById('auth-login-form');
      const formSignup = document.getElementById('auth-signup-form');

      if (mode === 'login') {
        tabLogin.classList.add('active');
        tabSignup.classList.remove('active');
        formLogin.style.display = 'block';
        formSignup.style.display = 'none';
      } else {
        tabSignup.classList.add('active');
        tabLogin.classList.remove('active');
        formSignup.style.display = 'block';
        formLogin.style.display = 'none';
      }
    }

    // Login Form Submit
    document.getElementById('auth-login-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim().toLowerCase();
      const password = document.getElementById('login-password').value;

      const users = getStored(STORAGE_KEYS.USERS);
      const matched = users.find(u => u.email.toLowerCase() === email && u.password === password);

      if (matched) {
        currentUser = matched;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        document.getElementById('auth-screen').style.display = 'none';
        showToast(`Welcome back, ${currentUser.name}!`, 'success');
        setupRoleEnvironment();
      } else {
        showToast('Invalid email or password. Please try again.', 'error');
      }
    });

    // Sign Up Form Submit
    document.getElementById('auth-signup-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim().toLowerCase();
      const age = parseInt(document.getElementById('signup-age').value);
      const gender = document.getElementById('signup-gender').value;
      const password = document.getElementById('signup-password').value;

      const users = getStored(STORAGE_KEYS.USERS);
      if (users.some(u => u.email.toLowerCase() === email)) {
        showToast('An account with this email already exists.', 'error');
        return;
      }

      const counters = getStored(STORAGE_KEYS.COUNTERS);
      const patientId = 'P' + counters.patient++;
      const userId = 'U' + counters.user++;
      setStored(STORAGE_KEYS.COUNTERS, counters);

      // Create Patient Record
      const patients = getStored(STORAGE_KEYS.PATIENTS);
      patients.push({
        id: patientId,
        name: name,
        age: age,
        gender: gender,
        email: email,
        history: "New Patient Registration",
        prescriptions: []
      });
      setStored(STORAGE_KEYS.PATIENTS, patients);

      // Create User Login Credentials
      const newUser = {
        id: userId,
        email: email,
        password: password,
        name: name,
        role: 'patient',
        patientId: patientId
      };
      users.push(newUser);
      setStored(STORAGE_KEYS.USERS, users);

      currentUser = newUser;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      document.getElementById('auth-screen').style.display = 'none';
      showToast(`Account created successfully! Welcome, ${name}.`, 'success');
      setupRoleEnvironment();
    });

    function handleLogout() {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
      currentUser = null;
      document.getElementById('auth-screen').style.display = 'flex';
      switchAuthMode('login');
      document.getElementById('login-email').value = '';
      document.getElementById('login-password').value = '';
      showToast('You have been signed out securely.', 'info');
    }

    const NAV_DEFINITIONS = {
      admin: [
        { id: 'admin-dashboard', label: 'Dashboard', icon: '<svg viewBox="0 0 24 24"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>' },
        { id: 'admin-patients', label: 'Manage Patients', icon: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' },
        { id: 'admin-doctors', label: 'Manage Doctors', icon: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/></svg>' },
        { id: 'admin-appointments', label: 'All Appointments', icon: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>' },
        { id: 'admin-billing', label: 'Billing & Invoices', icon: '<svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>' }
      ],
      patient: [
        { id: 'user-dashboard', label: 'My Health Profile', icon: '<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>' },
        { id: 'user-book', label: 'Book Appointment', icon: '<svg viewBox="0 0 24 24"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>' },
        { id: 'user-billing', label: 'My Invoices & Pay', icon: '<svg viewBox="0 0 24 24"><path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>' }
      ]
    };

    function setupRoleEnvironment() {
      if (!currentUser) {
        document.getElementById('auth-screen').style.display = 'flex';
        return;
      }
      document.getElementById('auth-screen').style.display = 'none';

      // Update User profile badge
      const roleBadge = document.getElementById('sidebar-role-badge');
      const nameDisplay = document.getElementById('user-display-name');
      const emailDisplay = document.getElementById('user-display-email');

      nameDisplay.innerText = currentUser.name;
      emailDisplay.innerText = currentUser.email;

      if (currentUser.role === 'admin') {
        roleBadge.className = 'role-badge admin';
        roleBadge.innerText = 'Admin System';
      } else {
        roleBadge.className = 'role-badge patient';
        roleBadge.innerText = 'Patient Portal';
      }

      // Generate Navigation Links
      const navContainer = document.getElementById('nav-links-container');
      const links = NAV_DEFINITIONS[currentUser.role];
      navContainer.innerHTML = links.map((link, idx) => `
        <li class="nav-item ${idx === 0 ? 'active' : ''}" onclick="switchView('${link.id}', this)">
          ${link.icon}
          <span>${link.label}</span>
        </li>
      `).join('');

      // Default to the first panel for that role
      switchView(links[0].id);
      refreshDataBindings();
    }

    function switchView(viewId, navEl = null) {
      document.querySelectorAll('.panel-view').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));

      const targetPanel = document.getElementById(`panel-${viewId}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }

      if (navEl) {
        navEl.classList.add('active');
      } else {
        // Highlight corresponding nav element by matching text/order
        const firstNav = document.querySelector('#nav-links-container .nav-item');
        if (firstNav) firstNav.classList.add('active');
      }

      // Titles
      const titleMap = {
        'admin-dashboard': { title: 'Executive Operations Overview', sub: 'Real-Time Operational & Financial Telemetry' },
        'admin-patients': { title: 'Patient Admissions & Records', sub: 'Clinical Registry and Medical Observations' },
        'admin-doctors': { title: 'Specialist Medical Staff', sub: 'Doctors Directory and Fee Management' },
        'admin-appointments': { title: 'Consultations Schedule', sub: 'Hospital Comprehensive Visit Roster' },
        'admin-billing': { title: 'Financial Operations & Billing', sub: 'Patient Invoicing and Ledger Processing' },
        'user-dashboard': { title: 'My Health Profile', sub: 'Personal Medical Records and Prescription Overview' },
        'user-book': { title: 'Book Doctor Consultation', sub: 'Schedule Visits with Hospital Specialists' },
        'user-billing': { title: 'My Hospital Ledger & Payments', sub: 'Outstanding Invoices and Settlement' }
      };

      if (titleMap[viewId]) {
        document.getElementById('page-title').innerText = titleMap[viewId].title;
        document.getElementById('page-subtitle').innerText = titleMap[viewId].sub;
      }

      if (viewId === 'admin-dashboard') {
        renderCharts();
      }
    }

    let specChartInstance = null;
    let revChartInstance = null;

    function renderCharts() {
      const doctors = getStored(STORAGE_KEYS.DOCTORS);
      const appointments = getStored(STORAGE_KEYS.APPOINTMENTS);
      const bills = getStored(STORAGE_KEYS.BILLS);

      // 1. Specialty visits load
      const specCounts = {};
      doctors.forEach(doc => { specCounts[doc.spec] = 0; });
      appointments.forEach(apt => {
        const doc = doctors.find(d => d.id === apt.doctorId);
        if (doc) {
          specCounts[doc.spec] = (specCounts[doc.spec] || 0) + 1;
        }
      });

      const specLabels = Object.keys(specCounts);
      const specData = Object.values(specCounts);

      const canvasSpec = document.getElementById('specializationChart');
      if (canvasSpec) {
        const ctxSpec = canvasSpec.getContext('2d');
        if (specChartInstance) specChartInstance.destroy();

        const gradCyan = ctxSpec.createLinearGradient(0, 0, 0, 260);
        gradCyan.addColorStop(0, '#06b6d4');
        gradCyan.addColorStop(1, 'rgba(6, 182, 212, 0.2)');

        const gradPink = ctxSpec.createLinearGradient(0, 0, 0, 260);
        gradPink.addColorStop(0, '#ec4899');
        gradPink.addColorStop(1, 'rgba(236, 72, 153, 0.2)');

        const gradPurple = ctxSpec.createLinearGradient(0, 0, 0, 260);
        gradPurple.addColorStop(0, '#8b5cf6');
        gradPurple.addColorStop(1, 'rgba(139, 92, 246, 0.2)');

        const gradAmber = ctxSpec.createLinearGradient(0, 0, 0, 260);
        gradAmber.addColorStop(0, '#f59e0b');
        gradAmber.addColorStop(1, 'rgba(245, 158, 11, 0.2)');

        const barGradients = [gradCyan, gradPink, gradPurple, gradAmber];
        const barBorders = ['#06b6d4', '#ec4899', '#8b5cf6', '#f59e0b'];

        specChartInstance = new Chart(ctxSpec, {
          type: 'bar',
          data: {
            labels: specLabels,
            datasets: [{
              label: 'Scheduled Visits',
              data: specData,
              backgroundColor: specLabels.map((_, i) => barGradients[i % barGradients.length]),
              borderColor: specLabels.map((_, i) => barBorders[i % barBorders.length]),
              borderWidth: 2,
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: { color: '#94a3b8', stepSize: 1 },
                grid: { color: 'rgba(255, 255, 255, 0.05)' }
              },
              x: {
                ticks: { color: '#f8fafc', font: { weight: '600' } },
                grid: { display: false }
              }
            }
          }
        });
      }

      // 2. Financial Distribution Doughnut
      let docTotal = 0, medTotal = 0, roomTotal = 0;
      bills.forEach(b => {
        docTotal += b.doctorFee;
        medTotal += b.medFee;
        roomTotal += b.roomFee;
      });

      const canvasRev = document.getElementById('revenueDoughnutChart');
      if (canvasRev) {
        const ctxRev = canvasRev.getContext('2d');
        if (revChartInstance) revChartInstance.destroy();

        revChartInstance = new Chart(ctxRev, {
          type: 'doughnut',
          data: {
            labels: ['Doctor Consultations', 'Pharmacy / Drugs', 'Ward / Rooms'],
            datasets: [{
              data: [docTotal, medTotal, roomTotal],
              backgroundColor: ['#06b6d4', '#ec4899', '#facc15'],
              hoverBackgroundColor: ['#7dd3fc', '#f472b6', '#fde047'],
              borderColor: '#0a142a',
              borderWidth: 3,
              hoverOffset: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  color: '#f8fafc',
                  font: { size: 11, weight: '500' },
                  padding: 14,
                  usePointStyle: true,
                  pointStyle: 'circle'
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    return ` ${context.label}: ₹${context.raw.toLocaleString()}`;
                  }
                }
              }
            },
            cutout: '68%'
          }
        });
      }
    }

    function refreshDataBindings() {
      const patients = getStored(STORAGE_KEYS.PATIENTS);
      const doctors = getStored(STORAGE_KEYS.DOCTORS);
      const appointments = getStored(STORAGE_KEYS.APPOINTMENTS);
      const bills = getStored(STORAGE_KEYS.BILLS);

      // KPI values
      document.getElementById('kpi-patients').innerText = patients.length;
      document.getElementById('kpi-doctors').innerText = doctors.length;
      document.getElementById('kpi-appointments').innerText = appointments.length;

      const totalRev = bills.filter(b => b.paid).reduce((sum, b) => sum + b.total, 0);
      document.getElementById('kpi-revenue').innerText = `₹${totalRev.toLocaleString()}`;

      // Admin Select Dropdowns
      const patientOptions = patients.map(p => `<option value="${p.id}">${p.name} (${p.id})</option>`).join('');
      const docOptions = doctors.map(d => `<option value="${d.id}">Dr. ${d.name} (${d.spec}) - ₹${d.fee}</option>`).join('');

      document.getElementById('admin-apt-patient').innerHTML = patientOptions;
      document.getElementById('adm-bill-patient').innerHTML = patientOptions;
      const firstDoctorOptions = '<option value="">Choose first specialist</option>' + docOptions;
      const optionalDoctorOptions = '<option value="">None</option>' + docOptions;
      ['admin-apt-doctor', 'user-apt-doctor'].forEach(id => {
        document.getElementById(id).innerHTML = firstDoctorOptions;
      });
      ['admin-apt-doctor-2', 'admin-apt-doctor-3', 'user-apt-doctor-2', 'user-apt-doctor-3'].forEach(id => {
        document.getElementById(id).innerHTML = optionalDoctorOptions;
      });

      // Render Admin Patients Table
      document.getElementById('admin-patient-table').innerHTML = patients.map(p => `
        <tr>
          <td><strong>${p.id}</strong></td>
          <td>${p.name}</td>
          <td>${p.age} yrs / ${p.gender}</td>
          <td><span style="color: #94a3b8; font-size:0.84rem;">${p.history || 'No recorded history'}</span></td>
          <td>
            <button class="btn-action" onclick="promptAddPrescription('${p.id}')">+ Rx</button>
          </td>
        </tr>
      `).join('');

      // Render Admin Doctors Table
      document.getElementById('admin-doctor-table').innerHTML = doctors.map(d => `
        <tr>
          <td><strong>${d.id}</strong></td>
          <td>Dr. ${d.name}</td>
          <td><span class="badge" style="background: rgba(6, 182, 212, 0.2); color: #06b6d4;">${d.spec}</span></td>
          <td>₹${d.fee.toLocaleString()}</td>
        </tr>
      `).join('');

      // Render Appointments (Admin recent & all)
      const renderAppointmentRows = (limit = null) => {
        const list = limit ? appointments.slice(-limit).reverse() : [...appointments].reverse();
        return list.map(a => {
          const p = patients.find(pat => pat.id === a.patientId);
          const d = doctors.find(doc => doc.id === a.doctorId);
          return `
            <tr>
              <td><strong>${a.id}</strong></td>
              <td>${p ? p.name : 'Unknown'}</td>
              <td>Dr. ${d ? d.name : 'Unknown'}</td>
              <td>${a.date}</td>
              <td><span class="badge badge-scheduled">${a.status}</span></td>
            </tr>
          `;
        }).join('');
      };

      document.getElementById('admin-recent-apt-table').innerHTML = renderAppointmentRows(5);
      document.getElementById('admin-all-appointments-table').innerHTML = renderAppointmentRows();

      // Render Admin Bills Table
      document.getElementById('admin-bill-table').innerHTML = bills.map(b => {
        const p = patients.find(pat => pat.id === b.patientId);
        return `
          <tr>
            <td><strong>${b.id}</strong></td>
            <td>${p ? p.name : 'Unknown'} (${b.patientId})</td>
            <td>₹${b.total.toLocaleString()}</td>
            <td>
              <span class="badge ${b.paid ? 'badge-paid' : 'badge-pending'}">
                ${b.paid ? 'PAID' : 'PENDING'}
              </span>
            </td>
            <td>
              <button class="btn-action" onclick="viewInvoiceModal('${b.id}')">View</button>
              ${!b.paid ? `<button class="btn-action pay" onclick="markBillPaid('${b.id}')">Mark Paid</button>` : ''}
            </td>
          </tr>
        `;
      }).join('');

      // Render User Portal Specifics
      if (currentUser && currentUser.role === 'patient') {
        const currentPatient = patients.find(p => p.id === currentUser.patientId) || {
          id: currentUser.patientId,
          name: currentUser.name,
          age: '-',
          gender: '-',
          history: 'None',
          prescriptions: []
        };

        document.getElementById('user-patient-id-badge').innerText = `ID: ${currentPatient.id}`;
        document.getElementById('u-profile-name').innerText = currentPatient.name;
        document.getElementById('u-profile-age-gender').innerText = `${currentPatient.age || 'N/A'} yrs • ${currentPatient.gender || 'N/A'}`;
        document.getElementById('u-profile-rx-count').innerText = (currentPatient.prescriptions || []).length;
        document.getElementById('u-profile-history').innerText = currentPatient.history || 'No recorded history.';

        const rxContainer = document.getElementById('u-profile-prescriptions');
        if (currentPatient.prescriptions && currentPatient.prescriptions.length > 0) {
          rxContainer.innerHTML = currentPatient.prescriptions.map(rx => `<li>${rx}</li>`).join('');
        } else {
          rxContainer.innerHTML = '<li>No active prescriptions.</li>';
        }

        // Patient's own appointments
        const userAppointments = appointments.filter(a => a.patientId === currentPatient.id).reverse();
        document.getElementById('user-appointments-table').innerHTML = userAppointments.length ? userAppointments.map(a => {
          const doc = doctors.find(d => d.id === a.doctorId);
          return `
            <tr>
              <td><strong>${a.id}</strong></td>
              <td>Dr. ${doc ? doc.name : 'Unknown'}</td>
              <td>${doc ? doc.spec : '-'}</td>
              <td>${a.date}</td>
              <td><span class="badge badge-scheduled">${a.status}</span></td>
            </tr>
          `;
        }).join('') : `<tr><td colspan="5" style="text-align:center; color: var(--text-muted);">No appointments booked yet.</td></tr>`;

        // Patient's own bills
        const userBills = bills.filter(b => b.patientId === currentPatient.id).reverse();
        document.getElementById('user-bills-table').innerHTML = userBills.length ? userBills.map(b => `
          <tr>
            <td><strong>${b.id}</strong></td>
            <td>₹${b.doctorFee.toLocaleString()}</td>
            <td>₹${b.medFee.toLocaleString()}</td>
            <td>₹${b.roomFee.toLocaleString()}</td>
            <td><strong>₹${b.total.toLocaleString()}</strong></td>
            <td><span class="badge ${b.paid ? 'badge-paid' : 'badge-pending'}">${b.paid ? 'PAID' : 'DUE'}</span></td>
            <td>
              <button class="btn-action" onclick="viewInvoiceModal('${b.id}')">Receipt</button>
              ${!b.paid ? `<button class="btn-action pay" onclick="markBillPaid('${b.id}')">Pay Now</button>` : ''}
            </td>
          </tr>
        `).join('') : `<tr><td colspan="7" style="text-align:center; color: var(--text-muted);">No bills found for your account.</td></tr>`;
      }
    }

    // 1. Admin Add Patient
    document.getElementById('admin-patient-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('adm-p-name').value.trim();
      const age = parseInt(document.getElementById('adm-p-age').value);
      const gender = document.getElementById('adm-p-gender').value;
      const history = document.getElementById('adm-p-history').value.trim();

      const counters = getStored(STORAGE_KEYS.COUNTERS);
      const pid = 'P' + counters.patient++;
      setStored(STORAGE_KEYS.COUNTERS, counters);

      const patients = getStored(STORAGE_KEYS.PATIENTS);
      patients.push({
        id: pid,
        name: name,
        age: age,
        gender: gender,
        history: history || "Initial clinical admission",
        prescriptions: []
      });
      setStored(STORAGE_KEYS.PATIENTS, patients);

      this.reset();
      refreshDataBindings();
      showToast(`Patient ${name} admitted successfully with ID: ${pid}`, 'success');
    });

    // 2. Admin Add Doctor
    document.getElementById('admin-doctor-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('adm-doc-name').value.trim();
      const spec = document.getElementById('adm-doc-spec').value.trim();
      const fee = parseFloat(document.getElementById('adm-doc-fee').value);

      const counters = getStored(STORAGE_KEYS.COUNTERS);
      const did = 'D' + counters.doctor++;
      setStored(STORAGE_KEYS.COUNTERS, counters);

      const doctors = getStored(STORAGE_KEYS.DOCTORS);
      doctors.push({ id: did, name: name, spec: spec, fee: fee });
      setStored(STORAGE_KEYS.DOCTORS, doctors);

      this.reset();
      refreshDataBindings();
      renderCharts();
      showToast(`Dr. ${name} (${spec}) onboarded with ID: ${did}`, 'success');
    });

    // Return the selected doctors, removing blanks and duplicate choices.
    function getChosenDoctors(prefix) {
      return [...new Set([
        document.getElementById(prefix + '-doctor').value,
        document.getElementById(prefix + '-doctor-2').value,
        document.getElementById(prefix + '-doctor-3').value
      ].filter(Boolean))];
    }

    // 3. Admin Quick Appointment Booking (up to 3 specialists on one date)
    document.getElementById('admin-quick-apt-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const pid = document.getElementById('admin-apt-patient').value;
      const doctorIds = getChosenDoctors('admin-apt');
      const date = document.getElementById('admin-apt-date').value;
      if (!doctorIds.length) {
        showToast('Please choose at least one specialist.', 'error');
        return;
      }
      doctorIds.forEach(did => scheduleAppointment(pid, did, date));
      this.reset();
      refreshDataBindings();
    });

    // 4. User Self Booking (up to 3 specialists on one date)
    document.getElementById('user-book-apt-form').addEventListener('submit', function(e) {
      e.preventDefault();
      if (!currentUser || !currentUser.patientId) return;

      const doctorIds = getChosenDoctors('user-apt');
      const date = document.getElementById('user-apt-date').value;
      if (!doctorIds.length) {
        showToast('Please choose at least one specialist.', 'error');
        return;
      }
      doctorIds.forEach(did => scheduleAppointment(currentUser.patientId, did, date));
      this.reset();
      refreshDataBindings();
    });

    function scheduleAppointment(patientId, doctorId, date) {
      const counters = getStored(STORAGE_KEYS.COUNTERS);
      const aid = 'A' + counters.appointment++;
      setStored(STORAGE_KEYS.COUNTERS, counters);

      const appointments = getStored(STORAGE_KEYS.APPOINTMENTS);
      appointments.push({
        id: aid,
        patientId: patientId,
        doctorId: doctorId,
        date: date,
        status: "SCHEDULED"
      });
      setStored(STORAGE_KEYS.APPOINTMENTS, appointments);

      refreshDataBindings();
      renderCharts();
      showToast(`Appointment confirmed successfully with ID: ${aid}`, 'success');
    }

    // 5. Prescribe medication prompt
    function promptAddPrescription(patientId) {
      const rx = prompt("Enter Prescription details (e.g. Paracetamol 650mg twice daily):");
      if (rx && rx.trim()) {
        const patients = getStored(STORAGE_KEYS.PATIENTS);
        const p = patients.find(pat => pat.id === patientId);
        if (p) {
          if (!p.prescriptions) p.prescriptions = [];
          p.prescriptions.push(rx.trim());
          setStored(STORAGE_KEYS.PATIENTS, patients);
          refreshDataBindings();
          showToast(`Prescription appended to ${p.name}'s record.`, 'success');
        }
      }
    }

    // 6. Admin Generate Bill
    document.getElementById('admin-billing-form').addEventListener('submit', function(e) {
      e.preventDefault();
      const pid = document.getElementById('adm-bill-patient').value;
      const medFee = parseFloat(document.getElementById('adm-bill-med').value) || 0;
      const roomFee = parseFloat(document.getElementById('adm-bill-room').value) || 0;

      const appointments = getStored(STORAGE_KEYS.APPOINTMENTS);
      const doctors = getStored(STORAGE_KEYS.DOCTORS);

      // Sum doctor fees from patient's appointments
      let doctorFees = 0;
      appointments.filter(a => a.patientId === pid).forEach(apt => {
        const doc = doctors.find(d => d.id === apt.doctorId);
        if (doc) doctorFees += doc.fee;
      });

      if (doctorFees === 0) {
        doctorFees = 500; // Standard base consultation if no prior booked doctor
      }

      const counters = getStored(STORAGE_KEYS.COUNTERS);
      const bid = 'B' + counters.bill++;
      setStored(STORAGE_KEYS.COUNTERS, counters);

      const bills = getStored(STORAGE_KEYS.BILLS);
      const newBill = {
        id: bid,
        patientId: pid,
        doctorFee: doctorFees,
        medFee: medFee,
        roomFee: roomFee,
        total: doctorFees + medFee + roomFee,
        paid: false
      };
      bills.push(newBill);
      setStored(STORAGE_KEYS.BILLS, bills);

      this.reset();
      refreshDataBindings();
      renderCharts();
      viewInvoiceModal(bid);
      showToast(`Invoice ${bid} generated for ₹${newBill.total.toLocaleString()}`, 'success');
    });

    // 7. Pay Bill
    function markBillPaid(billId) {
      const bills = getStored(STORAGE_KEYS.BILLS);
      const b = bills.find(item => item.id === billId);
      if (b) {
        b.paid = true;
        setStored(STORAGE_KEYS.BILLS, bills);
        refreshDataBindings();
        renderCharts();
        showToast(`Bill ${billId} of ₹${b.total.toLocaleString()} settled successfully!`, 'success');
      }
    }

    // 8. View Modal Receipt
    function viewInvoiceModal(billId) {
      const bills = getStored(STORAGE_KEYS.BILLS);
      const bill = bills.find(b => b.id === billId);
      if (!bill) return;

      const patients = getStored(STORAGE_KEYS.PATIENTS);
      const patient = patients.find(p => p.id === bill.patientId);

      document.getElementById('invoice-modal-content').innerHTML = `
        <div class="invoice-row">
          <span style="color: #94a3b8">Invoice Code:</span>
          <strong>${bill.id}</strong>
        </div>
        <div class="invoice-row">
          <span style="color: #94a3b8">Patient Name:</span>
          <strong>${patient ? patient.name : 'Unknown'} (${bill.patientId})</strong>
        </div>
        <div class="invoice-row">
          <span style="color: #94a3b8">Specialist Consultation Fee:</span>
          <span>₹${bill.doctorFee.toLocaleString()}</span>
        </div>
        <div class="invoice-row">
          <span style="color: #94a3b8">Pharmacy / Medication:</span>
          <span>₹${bill.medFee.toLocaleString()}</span>
        </div>
        <div class="invoice-row">
          <span style="color: #94a3b8">Room / Bed Allocation:</span>
          <span>₹${bill.roomFee.toLocaleString()}</span>
        </div>
        <div class="invoice-row invoice-total">
          <span>Net Amount Payable:</span>
          <span>₹${bill.total.toLocaleString()}</span>
        </div>
        <div class="invoice-row" style="margin-top: 15px;">
          <span style="color: #94a3b8">Payment Status:</span>
          <span class="badge ${bill.paid ? 'badge-paid' : 'badge-pending'}">${bill.paid ? 'PAID' : 'PENDING'}</span>
        </div>
      `;
      document.getElementById('invoice-modal').style.display = 'flex';
    }

    function closeInvoiceModal() {
      document.getElementById('invoice-modal').style.display = 'none';
    }

    window.onclick = function(event) {
      const modal = document.getElementById('invoice-modal');
      if (event.target === modal) {
        closeInvoiceModal();
      }
    };

    window.addEventListener('DOMContentLoaded', () => {
      setupRoleEnvironment();
    });
