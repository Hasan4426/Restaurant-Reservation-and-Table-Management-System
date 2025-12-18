// manager-dashboard-api.js
// This file overrides the dummy-data behavior in manager-dashboard.html
// and loads real customers/reservations/feedback from the Node backend.

(async function initManagerDashboardAPI() {
  // Wait until the inline script has created all variables/functions
  if (typeof membersData === 'undefined' || typeof renderMembersTable !== 'function') return;

  // Keep original functions (so we can reuse the existing UI rendering)
  const originalShowReservations = window.showReservations;
  const originalShowFeedback = window.showFeedback;

  async function loadCustomers() {
    const resp = await fetch('/api/manager/customers', { credentials: 'include', headers: { 'Accept': 'application/json' } });
    if (!resp.ok) {
      const msg = await resp.text();
      throw new Error(msg || 'Failed to load customers');
    }
    const customers = await resp.json();

    // Adapt backend data to the structure expected by the dashboard
    // Dashboard uses member.id (number). We'll keep a numeric id for UI and store the real customerId separately.
    membersData = customers.map((c, idx) => ({
      id: idx + 1,
      customerId: c.id,
      name: c.name || 'Unknown',
      email: c.email || '',
      phone: c.phone || '',
      joinDate: new Date().toISOString().slice(0, 10),
      lastVisit: '',
      totalVisits: 0,
      totalSpent: '$0.00',
      reservations: [],   // loaded on demand
      feedback: []        // loaded on demand
    }));

    currentPage = 1;
    renderMembersTable();
    updateStats();
  }

  async function loadReservationsForMember(member) {
    const resp = await fetch(`/api/manager/customers/${encodeURIComponent(member.customerId)}/reservations`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!resp.ok) return [];
    const reservations = await resp.json();

    // Normalize to what the HTML expects
    return reservations.map(r => ({
      id: r.id,
      date: formatDateForUI(r.date),
      time: r.time,
      partySize: r.partySize,
      table: formatTableForUI(r.table),
      status: (r.status || 'pending').toLowerCase(),
      specialRequests: r.specialRequests || '',
      contactPhone: r.contactPhone || member.phone || ''
    }));
  }

  async function loadFeedbackForMember(member) {
    const resp = await fetch(`/api/manager/customers/${encodeURIComponent(member.customerId)}/feedback`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    });
    if (!resp.ok) return [];
    const feedback = await resp.json();
    return feedback.map(f => ({
      date: f.date,
      rating: f.rating,
      text: f.text || ''
    }));
  }

  function formatTableForUI(tableId) {
    if (!tableId) return '';
    // 'T-8' -> 'Table 8'
    const m = String(tableId).match(/T-(\d+)/i);
    if (m) return `Table ${m[1]}`;
    return tableId;
  }

  function formatDateForUI(dateStr) {
    // If already a long human string, keep it. If YYYY-MM-DD, convert to a readable date.
    if (!dateStr) return '';
    if (/\w+,\s+\w+\s+\d{1,2},\s+\d{4}/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  // Override the two buttons to load real data on-demand, then reuse the existing UI renderers
  window.showReservations = async function(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (!member) return;

    if (!member.__reservationsLoaded) {
      member.reservations = await loadReservationsForMember(member);
      member.__reservationsLoaded = true;
    }
    if (typeof originalShowReservations === 'function') {
      originalShowReservations(memberId);
    }
  };

  window.showFeedback = async function(memberId) {
    const member = membersData.find(m => m.id === memberId);
    if (!member) return;

    if (!member.__feedbackLoaded) {
      member.feedback = await loadFeedbackForMember(member);
      member.__feedbackLoaded = true;
    }
    if (typeof originalShowFeedback === 'function') {
      originalShowFeedback(memberId);
    }
  };

  // Load customers immediately
  try {
    await loadCustomers();
  } catch (e) {
    console.error(e);
    alert('Manager dashboard could not load customers. Make sure you are logged in as a manager.');
  }
  // Logout button (kills session and returns to login)
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    // Capture = true so this runs before the sidebar navigation handler
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      try {
        const res = await fetch("/api/logout", { method: "POST", credentials: "include", headers: { "Accept": "application/json" } });
        if (res.ok) {
          window.location.href = "/login.html";
        } else {
          alert("Logout failed. Please try again.");
        }
      } catch (err) {
        alert("Network error during logout.");
      }
    }, true);
  }

})();
