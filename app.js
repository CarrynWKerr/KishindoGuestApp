// ══════════════════════════════════════════════════════════════
// KISHINDO CONSERVATION RESERVE — APPLICATION ENGINE
// Multi-step guest experience, Firestore sync & lodge ops
// ══════════════════════════════════════════════════════════════

(function() {
  'use strict';

  // ── 1. Brand & Room Specifications (from 2026-2027 Rate Card) ──
  const SUITE_SPECS = {
    'Tibo': {
      title: 'Tibo (Suite 1)',
      occupancy: 2,
      highlights: 'Wrap-around sun deck, daybed & private lounge',
      amenities: ['En-suite bath & shower', 'Fireplace & gas heater', 'Air cooler', 'Tea & coffee facilities', 'Wi-Fi', 'Hair dryer', 'Digital safe'],
      description: 'Features a panoramic wrap-around sun deck, outdoor daybed, and private lounge offering uninterrupted views of the Free State Karoo wilderness.'
    },
    'Ussuri': {
      title: 'Ussuri (Suite 2)',
      occupancy: 3,
      highlights: 'Canyon balcony, outdoor & indoor shower, daybed lounge',
      amenities: ['Outdoor & indoor shower', 'En-suite bath', 'Fireplace & gas heater', 'Air cooler', 'Wi-Fi & safe', 'Interleading door to Zaria'],
      description: 'Perched over the canyon rim with a dramatic overhanging balcony, outdoor stone shower, daybed lounge, and optional interleading door to Zaria.'
    },
    'Zaria': {
      title: 'Zaria (Suite 3)',
      occupancy: 2,
      highlights: 'Private rockery, canyon overhang, outdoor & indoor shower',
      amenities: ['Private rockery', 'Outdoor & indoor shower', 'En-suite bath', 'Fireplace & gas heater', 'Air cooler', 'Wi-Fi & safe'],
      description: 'Our most secluded and private suite, nestled alongside a natural Karoo rockery overhang with both indoor and outdoor starlit showers.'
    }
  };

  const DEFAULT_STAFF_PIN = '1234';

  // ── 2. Data Store (Firebase Firestore with LocalStorage Fallback) ──
  const DataStore = {
    isFirebaseConfigured() {
      const cfg = window.KISHINDO_FIREBASE_CONFIG;
      return cfg && cfg.apiKey && !cfg.apiKey.includes('REPLACE_WITH');
    },

    init() {
      if (this.isFirebaseConfigured() && window.firebase) {
        try {
          if (!firebase.apps.length) {
            firebase.initializeApp(window.KISHINDO_FIREBASE_CONFIG);
          }
          this.db = firebase.firestore();
          console.log('[Kishindo] Connected to Firebase Firestore.');
          return;
        } catch (e) {
          console.warn('[Kishindo] Firebase init error, falling back to local storage:', e);
        }
      }
      this.initLocalDemoData();
    },

    initLocalDemoData() {
      if (!localStorage.getItem('kishindo_bookings')) {
        const demoBookings = [
          {
            nbid: '116057573',
            bookingType: 'Agent',
            contactName: 'Tears Travel & Tours',
            contactEmail: 'reservations@tearstravel.com',
            checkIn: '2026-12-14',
            checkOut: '2026-12-18',
            nights: 4,
            guestCount: 4,
            suites: [
              { name: 'Ussuri', pin: '4821', bedConfig: 'King Bed', status: 'Complete' },
              { name: 'Tibo', pin: '7392', bedConfig: 'Twin Beds', status: 'Partial' }
            ],
            rate: 'SADC 10%',
            extras: 'Conservation Levies',
            depositDue: '2026-11-28',
            balanceDue: '2026-10-30',
            notes: 'High-profile photographic guests.',
            createdAt: new Date().toISOString()
          },
          {
            nbid: '120731359',
            bookingType: 'Direct',
            contactName: 'Dr. Alistair & Sarah Finch',
            contactEmail: 'afinch@conservationtrust.uk',
            checkIn: '2027-01-10',
            checkOut: '2027-01-14',
            nights: 4,
            guestCount: 2,
            suites: [
              { name: 'Zaria', pin: '5190', bedConfig: 'King Bed', status: 'Pending' }
            ],
            rate: 'Rack Rate',
            extras: 'Conservation Levies, Private Photographic Vehicle',
            depositDue: '2026-12-05',
            balanceDue: '2026-11-26',
            notes: 'Anniversary celebration.',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem('kishindo_bookings', JSON.stringify(demoBookings));
      }

      if (!localStorage.getItem('kishindo_responses')) {
        const demoResponses = {
          '116057573_Ussuri': {
            nbid: '116057573',
            suite: 'Ussuri',
            PrimaryEmail: 'emily.carter@safari-enthusiast.com',
            BookingAgency: 'Tears Travel & Tours',
            CheckInDate: '2026-12-14',
            CheckOutDate: '2026-12-18',
            Guest1FullName: 'Emily Carter',
            Guest1VisitedBefore: 'Yes',
            Guest1VisitYear: '2024',
            Guest2FullName: 'Michael Carter',
            Guest2VisitedBefore: 'No',
            Guest1Nationality: 'British',
            Guest2Nationality: 'British',
            RoomConfiguration: 'King Bed',
            HasDietaryPreferences: 'Yes',
            Guest1DietaryRequirements: 'Strictly no fish or seafood',
            Guest2DietaryRequirements: 'None',
            HasMedicalConditions: 'No',
            ReasonsForStay: ['Tiger photography', 'Cheetah photography', 'A special occasion or celebration'],
            SpecialOccasions: '10th Wedding Anniversary celebration during our stay',
            TransportMethod: ['Private Road Shuttle from Bloemfontein'],
            FlightInDetails: 'Airlink 4Z 703, arriving 10h20',
            FlightOutDetails: 'Airlink 4Z 712, departing 14h20',
            CheckInTime: '14h00',
            GuestContactNumbers: '+44 7700 900451',
            EmergencyContactDetails: 'Edward Carter (Brother): +44 7700 900892',
            InsuranceDetails: 'Allianz Global Medical & Travel #AG-882194',
            Status: 'Complete',
            updatedAt: new Date().toISOString()
          }
        };
        localStorage.setItem('kishindo_responses', JSON.stringify(demoResponses));
      }
    },

    async getBookings() {
      if (this.db) {
        try {
          const snapshot = await this.db.collection('bookings').orderBy('checkIn').get();
          const list = [];
          snapshot.forEach(doc => list.push(doc.data()));
          return list;
        } catch(e) { console.warn('Firestore read error, using fallback:', e); }
      }
      return JSON.parse(localStorage.getItem('kishindo_bookings') || '[]');
    },

    async saveBooking(booking) {
      if (this.db) {
        try {
          await this.db.collection('bookings').doc(String(booking.nbid)).set(booking);
        } catch(e) { console.warn('Firestore write error, using fallback:', e); }
      }
      const all = await this.getBookings();
      const idx = all.findIndex(b => String(b.nbid) === String(booking.nbid));
      if (idx !== -1) all[idx] = booking; else all.push(booking);
      localStorage.setItem('kishindo_bookings', JSON.stringify(all));
      return booking;
    },

    async getResponse(nbid, suite) {
      const key = `${nbid}_${suite}`;
      if (this.db) {
        try {
          const doc = await this.db.collection('responses').doc(key).get();
          if (doc.exists) return doc.data();
        } catch(e) { console.warn('Firestore read error, using fallback:', e); }
      }
      const store = JSON.parse(localStorage.getItem('kishindo_responses') || '{}');
      return store[key] || null;
    },

    async saveResponse(nbid, suite, data, isComplete = false) {
      const key = `${nbid}_${suite}`;
      const record = {
        ...data,
        nbid,
        suite,
        Status: isComplete ? 'Complete' : (data.Status || 'Partial'),
        updatedAt: new Date().toISOString()
      };
      if (this.db) {
        try {
          await this.db.collection('responses').doc(key).set(record);
        } catch(e) { console.warn('Firestore write error, using fallback:', e); }
      }
      const store = JSON.parse(localStorage.getItem('kishindo_responses') || '{}');
      store[key] = record;
      localStorage.setItem('kishindo_responses', JSON.stringify(store));

      // Also update suite status on booking
      const bookings = await this.getBookings();
      const b = bookings.find(item => String(item.nbid) === String(nbid));
      if (b && b.suites) {
        const s = b.suites.find(suiteItem => suiteItem.name === suite);
        if (s) {
          s.status = isComplete ? 'Complete' : 'Partial';
          await this.saveBooking(b);
        }
      }
      return record;
    }
  };

  // ── 3. App State ──
  const State = {
    currentScreen: 'authScreen',
    authRole: 'guest',
    activeSession: null,      // { nbid, suite, booking, bedConfig }
    currentSectionIndex: 0,
    visibleSections: [],
    formData: {},
    staffBookings: [],
    selectedBookingNBID: null
  };

  // ── 4. UI Navigation & Screens ──
  function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
      window.scrollTo(0, 0);
    }
    State.currentScreen = screenId;
  }

  // ── 5. PIN Authentication ──
  async function handleGuestLogin() {
    const pin = getPinValue('guestPinInputs');
    const errorEl = document.getElementById('guestPinError');
    errorEl.style.display = 'none';

    if (pin.length !== 4) {
      showError(errorEl, 'Please enter your 4-digit suite access PIN.');
      return;
    }

    const bookings = await DataStore.getBookings();
    let found = null;

    for (const b of bookings) {
      if (b.suites) {
        for (const s of b.suites) {
          if (String(s.pin) === pin) {
            found = { booking: b, suite: s.name, bedConfig: s.bedConfig, nbid: b.nbid };
            break;
          }
        }
      }
      if (found) break;
    }

    if (!found) {
      showError(errorEl, 'Invalid PIN. Please check your welcome email or contact Reservations.');
      return;
    }

    // Success
    State.activeSession = found;
    const existing = await DataStore.getResponse(found.nbid, found.suite);
    State.formData = existing || {
      CheckInDate: found.booking.checkIn,
      CheckOutDate: found.booking.checkOut,
      RoomConfiguration: found.bedConfig || 'King Bed'
    };

    renderGuestWelcome(found);
    showScreen('guestWelcomeScreen');
  }

  async function handleStaffLogin() {
    const pin = getPinValue('staffPinInputs');
    const errorEl = document.getElementById('staffPinError');
    errorEl.style.display = 'none';

    const savedStaffPin = localStorage.getItem('kishindo_staff_pin') || DEFAULT_STAFF_PIN;
    if (pin === savedStaffPin) {
      await loadStaffDashboard();
      showScreen('staffDashboardScreen');
    } else {
      showError(errorEl, 'Incorrect Staff PIN.');
    }
  }

  function getPinValue(containerId) {
    const boxes = document.querySelectorAll(`#${containerId} .pin-box`);
    return Array.from(boxes).map(b => b.value.trim()).join('');
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.style.display = 'block';
  }

  // ── 6. Guest Welcome Screen ──
  function renderGuestWelcome(session) {
    const { suite, booking } = session;
    const specs = SUITE_SPECS[suite] || { title: suite, description: '', amenities: [] };

    document.getElementById('welcomeSuiteTitle').textContent = specs.title;
    document.getElementById('welcomeSuiteDesc').textContent = specs.description;
    document.getElementById('welcomeCheckIn').textContent = formatDate(booking.checkIn);
    document.getElementById('welcomeCheckOut').textContent = formatDate(booking.checkOut);
    document.getElementById('welcomeNights').textContent = `${booking.nights} Night${booking.nights > 1 ? 's' : ''}`;
    document.getElementById('welcomeBedConfig').textContent = session.bedConfig || 'King Bed';

    const chipsEl = document.getElementById('welcomeAmenities');
    chipsEl.innerHTML = (specs.amenities || []).map(a => `<span class="amenity-chip">${a}</span>`).join('');

    const isComplete = State.formData.Status === 'Complete';
    const ctaBtn = document.getElementById('welcomeCtaBtn');
    ctaBtn.textContent = isComplete ? 'Review / Edit Your Form' : 'Curate Your Stay';
  }

  // ── 7. Multi-step Form Flow ──
  const ALL_SECTIONS = [
    { id: 'sec-welcome', title: 'Welcome & Contact', stepNum: 'Step 1 of 12' },
    { id: 'sec-stay', title: 'Dates of Stay', stepNum: 'Step 2 of 12' },
    { id: 'sec-names', title: 'Guest Names & Visits', stepNum: 'Step 3 of 12' },
    { id: 'sec-dob', title: 'Dates of Birth', stepNum: 'Step 4 of 12' },
    { id: 'sec-nationality', title: 'Nationalities', stepNum: 'Step 5 of 12' },
    { id: 'sec-room', title: 'Suite Configuration', stepNum: 'Step 6 of 12' },
    { id: 'sec-diet-gate', title: 'Dining Preferences', stepNum: 'Step 7 of 12' },
    { id: 'sec-diet-detail', title: 'Dietary Details', stepNum: 'Step 7b', conditional: () => State.formData.HasDietaryPreferences === 'Yes' },
    { id: 'sec-med-gate', title: 'Medical Safety', stepNum: 'Step 8 of 12' },
    { id: 'sec-med-detail', title: 'Medical Details', stepNum: 'Step 8b', conditional: () => State.formData.HasMedicalConditions === 'Yes' },
    { id: 'sec-interests', title: 'Your Kishindo Experience', stepNum: 'Step 9 of 12' },
    { id: 'sec-celebrations', title: 'Celebrations & Special Requests', stepNum: 'Step 9b', conditional: () => (State.formData.ReasonsForStay || []).includes('A special occasion or celebration') },
    { id: 'sec-transport', title: 'Journey & Arrival Times', stepNum: 'Step 10 of 12' },
    { id: 'sec-contacts', title: 'Contact & Emergency Details', stepNum: 'Step 11 of 12' },
    { id: 'sec-insurance', title: 'Travel Insurance', stepNum: 'Step 12 of 12' },
    { id: 'sec-final', title: 'Final Details', stepNum: 'Final Note' }
  ];

  function evaluateVisibleSections() {
    State.visibleSections = ALL_SECTIONS.filter(s => !s.conditional || s.conditional());
  }

  function startGuestForm() {
    evaluateVisibleSections();
    State.currentSectionIndex = 0;
    populateFormFields();
    renderCurrentSection();
    showScreen('guestFormScreen');
  }

  function renderCurrentSection() {
    evaluateVisibleSections();
    if (State.currentSectionIndex >= State.visibleSections.length) {
      completeFormSubmission();
      return;
    }

    const currentSec = State.visibleSections[State.currentSectionIndex];
    document.querySelectorAll('.step-container').forEach(el => el.classList.remove('active'));

    const activeEl = document.getElementById(currentSec.id);
    if (activeEl) activeEl.classList.add('active');

    // Update progress bar
    const progressPct = Math.round(((State.currentSectionIndex + 1) / State.visibleSections.length) * 100);
    document.getElementById('formProgressFill').style.width = `${progressPct}%`;
    document.getElementById('formProgressText').textContent = `${currentSec.stepNum} — ${currentSec.title}`;

    // Nav buttons
    document.getElementById('formPrevBtn').style.visibility = State.currentSectionIndex > 0 ? 'visible' : 'hidden';
    const nextBtn = document.getElementById('formNextBtn');
    const isLast = State.currentSectionIndex === State.visibleSections.length - 1;
    nextBtn.textContent = isLast ? 'Complete & Submit' : 'Continue →';

    window.scrollTo(0, 0);
  }

  function nextFormStep() {
    saveCurrentStepFields();
    evaluateVisibleSections();
    if (State.currentSectionIndex < State.visibleSections.length - 1) {
      State.currentSectionIndex++;
      renderCurrentSection();
    } else {
      completeFormSubmission();
    }
  }

  function prevFormStep() {
    saveCurrentStepFields();
    if (State.currentSectionIndex > 0) {
      State.currentSectionIndex--;
      renderCurrentSection();
    }
  }

  function saveCurrentStepFields() {
    const activeEl = document.querySelector('.step-container.active');
    if (!activeEl) return;

    activeEl.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], input[type="tel"], textarea').forEach(inp => {
      if (inp.name) State.formData[inp.name] = inp.value.trim();
    });

    activeEl.querySelectorAll('.options-grid[data-field]').forEach(grid => {
      const field = grid.dataset.field;
      const isRadio = grid.dataset.type === 'radio';
      if (isRadio) {
        const checked = grid.querySelector('input[type="radio"]:checked');
        if (checked) State.formData[field] = checked.value;
      } else {
        const checks = Array.from(grid.querySelectorAll('input[type="checkbox"]:checked')).map(c => c.value);
        State.formData[field] = checks;
      }
    });

    // Autosave to storage
    if (State.activeSession) {
      DataStore.saveResponse(State.activeSession.nbid, State.activeSession.suite, State.formData, false);
      flashAutosave();
    }
  }

  function flashAutosave() {
    const pill = document.getElementById('autosavePill');
    if (pill) {
      pill.textContent = '✓ Saved';
      setTimeout(() => { pill.textContent = 'Autosaving…'; }, 1800);
    }
  }

  function populateFormFields() {
    const data = State.formData;
    for (const [key, val] of Object.entries(data)) {
      if (!val) continue;
      const inp = document.querySelector(`[name="${key}"]`);
      if (inp && (inp.tagName === 'INPUT' || inp.tagName === 'TEXTAREA')) {
        inp.value = val;
      }
      // Radio
      const radio = document.querySelector(`input[type="radio"][name="${key}"][value="${val}"]`);
      if (radio) {
        radio.checked = true;
        radio.closest('.option-card')?.classList.add('selected');
      }
      // Checkboxes
      if (Array.isArray(val)) {
        val.forEach(v => {
          const cb = document.querySelector(`input[type="checkbox"][value="${v}"]`);
          if (cb) {
            cb.checked = true;
            cb.closest('.option-card')?.classList.add('selected');
          }
        });
      }
    }
  }

  async function completeFormSubmission() {
    saveCurrentStepFields();
    if (State.activeSession) {
      await DataStore.saveResponse(State.activeSession.nbid, State.activeSession.suite, State.formData, true);
    }
    showScreen('guestCompleteScreen');
  }

  // ── 8. Staff Dashboard ──
  async function loadStaffDashboard() {
    const bookings = await DataStore.getBookings();
    State.staffBookings = bookings;
    renderBookingsList(bookings);
  }

  function renderBookingsList(bookings) {
    const listEl = document.getElementById('staffBookingsList');
    if (!bookings.length) {
      listEl.innerHTML = '<p style="text-align:center;padding:40px;color:var(--charcoal-muted);">No reservations found.</p>';
      return;
    }

    listEl.innerHTML = bookings.map(b => {
      const suiteBadges = (b.suites || []).map(s => {
        const statusClass = s.status === 'Complete' ? 'badge-complete' : s.status === 'Partial' ? 'badge-partial' : 'badge-pending';
        return `<span class="badge-status ${statusClass}" style="margin-right:6px;">${s.name}: ${s.status}</span>`;
      }).join('');

      return `
        <div class="booking-item-card" onclick="window.KishindoApp.openBookingDetail('${b.nbid}')">
          <div class="booking-item-top">
            <span style="font-size:11px;font-weight:600;letter-spacing:0.12em;color:var(--charcoal-muted);">NBID ${b.nbid} · ${b.bookingType}</span>
            <span style="font-size:12px;color:var(--brand-ochre);font-weight:600;">Check-in: ${formatDate(b.checkIn)}</span>
          </div>
          <div class="booking-guest-title">${b.contactName}</div>
          <div style="font-size:13px;color:var(--charcoal-muted);margin:4px 0 12px;">
            ${formatDate(b.checkIn)} to ${formatDate(b.checkOut)} (${b.nights} nights) · ${b.guestCount} Guests
          </div>
          <div>${suiteBadges}</div>
        </div>
      `;
    }).join('');
  }

  async function openBookingDetail(nbid) {
    State.selectedBookingNBID = nbid;
    const booking = State.staffBookings.find(b => String(b.nbid) === String(nbid));
    if (!booking) return;

    document.getElementById('staffDashboardMain').style.display = 'none';
    const detailEl = document.getElementById('staffBookingDetail');
    detailEl.style.display = 'block';

    document.getElementById('detailNbidTitle').textContent = `Booking NBID ${booking.nbid} — ${booking.contactName}`;
    document.getElementById('detailStayInfo').textContent = `${formatDate(booking.checkIn)} to ${formatDate(booking.checkOut)} (${booking.nights} nights) · ${booking.guestCount} Guests · ${booking.bookingType}`;

    // Load responses for all assigned suites
    const responses = [];
    for (const s of (booking.suites || [])) {
      const r = await DataStore.getResponse(booking.nbid, s.name);
      if (r) responses.push(r);
    }

    // Render Ops Summary
    const summaryText = buildOperationsSummary(booking, responses);
    document.getElementById('opsSummaryOutput').textContent = summaryText;

    // Render Email text
    updateEmailPreview(booking, 'pre');

    // Render Detailed Rooming Cards
    renderRoomingDetailCards(booking, responses);
  }

  function closeBookingDetail() {
    document.getElementById('staffBookingDetail').style.display = 'none';
    document.getElementById('staffDashboardMain').style.display = 'block';
  }

  function buildOperationsSummary(booking, responses) {
    const guests = [];
    const nats = [];
    const dietNotes = [];
    const medNotes = [];

    responses.forEach(r => {
      if (r.Guest1FullName) {
        guests.push(r.Guest1FullName);
        if (r.Guest1Nationality) nats.push(r.Guest1Nationality);
        if (r.Guest1DietaryRequirements && r.HasDietaryPreferences === 'Yes') {
          dietNotes.push(`${r.Guest1FullName} - ${r.Guest1DietaryRequirements}`);
        }
        if (r.Guest1MedicalConditions && r.HasMedicalConditions === 'Yes') {
          medNotes.push(`${r.Guest1FullName} - ${r.Guest1MedicalConditions}`);
        }
      }
      if (r.Guest2FullName) {
        guests.push(r.Guest2FullName);
        if (r.Guest2Nationality) nats.push(r.Guest2Nationality);
        if (r.Guest2DietaryRequirements && r.HasDietaryPreferences === 'Yes') {
          dietNotes.push(`${r.Guest2FullName} - ${r.Guest2DietaryRequirements}`);
        }
        if (r.Guest2MedicalConditions && r.HasMedicalConditions === 'Yes') {
          medNotes.push(`${r.Guest2FullName} - ${r.Guest2MedicalConditions}`);
        }
      }
    });

    const uniqueNats = [...new Set(nats)].join(' / ');
    const guestListStr = guests.length ? `${guests.join(', ')}${uniqueNats ? ' (' + uniqueNats + ')' : ''}` : booking.contactName;

    const arrivalMethod = responses[0]?.TransportMethod ? (Array.isArray(responses[0].TransportMethod) ? responses[0].TransportMethod.join(', ') : responses[0].TransportMethod) : 'TBC';
    const specialRequests = responses.map(r => r.SpecialOccasions).filter(Boolean).join('; ') || 'None';

    const lines = [
      `- Guest Names: ${guestListStr}`,
      `- Arrival details: ${arrivalMethod}`,
      `- Departure details: Transfer - Kosmos`,
      `- Rooming list:`
    ];

    (booking.suites || []).forEach(s => {
      const resp = responses.find(r => r.suite === s.name);
      const names = [resp?.Guest1FullName, resp?.Guest2FullName].filter(Boolean).join(' & ') || 'TBC';
      lines.push(`  ${s.name}: ${names}`);
    });

    lines.push(`- Bed configuration:`);
    (booking.suites || []).forEach(s => {
      lines.push(`  ${s.name} - ${s.bedConfig || 'King Bed'}`);
    });

    lines.push(`- Special instructions: ${specialRequests}`);
    lines.push(`- Dietary Notes:`);
    if (dietNotes.length) {
      dietNotes.forEach(d => lines.push(`  ${d}`));
    } else {
      lines.push(`  None declared`);
    }

    lines.push(`- Allergies or Medical Notes:`);
    if (medNotes.length) {
      medNotes.forEach(m => lines.push(`  ${m}`));
    } else {
      lines.push(`  None declared`);
    }

    return lines.join('\n');
  }

  function updateEmailPreview(booking, type) {
    const isAgent = booking.bookingType === 'Agent';
    const isPre = type === 'pre';
    const hostUrl = window.location.origin + window.location.pathname;

    let greeting = isAgent
      ? `Dear ${booking.contactName},\n\nThank you for your enquiry. I am pleased to confirm the following provisional booking:`
      : `Dear ${booking.contactName},\n\nThank you for choosing Kishindo Conservation Reserve. We are delighted to confirm your ${isPre ? 'provisional ' : ''}booking:`;

    const suitePins = (booking.suites || []).map(s => `  ${s.name} — PIN:  ${s.pin}`).join('\n');

    const emailBody = `${greeting}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${isPre ? 'PROVISIONAL BOOKING DETAILS' : 'CONFIRMED BOOKING DETAILS'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NBID:               ${booking.nbid}
  Arrival date:       ${formatDate(booking.checkIn)}
  Departure date:     ${formatDate(booking.checkOut)}
  Nights:             ${booking.nights}
  Guests:             ${booking.guestCount} Adults
  Rooms:              ${(booking.suites || []).map(s => s.name).join(', ')}
  Bed configuration:  ${(booking.suites || []).map(s => s.name + ' (' + s.bedConfig + ')').join(', ')}
  Extras:             ${booking.extras || 'Conservation levies'}
  Rate:               ${booking.rate || 'Rack Rate'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT SCHEDULE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Deposit (50%) due:  ${formatDate(booking.depositDue)}
  Balance due:        ${formatDate(booking.balanceDue)}

Please see the link to your invoice and payment:
[Insert NightsBridge Payment Link Here]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GUEST PRE-ARRIVAL PORTAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To ensure we curate every detail of your stay seamlessly ahead of arrival, kindly have ${isAgent ? 'your guests' : ''} complete the pre-arrival information form:

  Portal Link: ${hostUrl}

${suitePins}

Each PIN is private to the suite. Simply visit the link, enter the PIN, and the form will open.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ARRIVAL NOTICE — BEFORE LEAVING PHILIPPOLIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
! IMPORTANT: Please call the Canyon Lodge Manager at Kishindo on +27 66 290 8424 before leaving Philippolis. You will lose cell reception along the way, and our team will arrange to meet you at the main gate.

Check-in: strictly 14h00
Check-out: strictly 10h00

Warm regards,

Carryn
Reservations | Kishindo Conservation Reserve
reservations@kishindowild.com | +27 66 290 8424
www.kishindowild.com`;

    document.getElementById('emailPreviewOutput').textContent = emailBody;
  }

  function renderRoomingDetailCards(booking, responses) {
    const container = document.getElementById('roomingDetailsContainer');
    container.innerHTML = (booking.suites || []).map(s => {
      const resp = responses.find(r => r.suite === s.name) || {};
      const g1 = resp.Guest1FullName ? `${resp.Guest1FullName} (${resp.Guest1Nationality || 'N/A'})` : 'Not submitted yet';
      const g2 = resp.Guest2FullName ? `${resp.Guest2FullName} (${resp.Guest2Nationality || 'N/A'})` : '';

      return `
        <div class="card-white" style="margin-bottom:16px;">
          <div class="banner-card" style="display:flex;justify-content:space-between;">
            <span>${s.name} — Bed: ${s.bedConfig}</span>
            <span>PIN: <strong>${s.pin}</strong></span>
          </div>
          <div class="card-body">
            <p><strong>Guests:</strong> ${g1} ${g2 ? '& ' + g2 : ''}</p>
            <p><strong>Dietary:</strong> ${resp.Guest1DietaryRequirements || 'None declared'}</p>
            <p><strong>Medical:</strong> ${resp.Guest1MedicalConditions || 'None declared'}</p>
            <p><strong>Special Requests:</strong> ${resp.SpecialOccasions || 'None'}</p>
            <p><strong>Travel Mode:</strong> ${resp.TransportMethod || 'TBC'}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  // ── 9. Export & Download Utilities ──
  async function downloadCSV() {
    const bookings = await DataStore.getBookings();
    const rows = [
      ['NBID', 'Type', 'Contact', 'Email', 'CheckIn', 'CheckOut', 'Nights', 'Guests', 'Rate', 'Suite', 'PIN', 'BedConfig', 'Status', 'Guest1', 'Guest2', 'Dietary', 'Medical']
    ];

    for (const b of bookings) {
      for (const s of (b.suites || [])) {
        const resp = await DataStore.getResponse(b.nbid, s.name);
        rows.push([
          b.nbid,
          b.bookingType,
          b.contactName,
          b.contactEmail,
          b.checkIn,
          b.checkOut,
          b.nights,
          b.guestCount,
          b.rate || '',
          s.name,
          s.pin,
          s.bedConfig,
          s.status,
          resp?.Guest1FullName || '',
          resp?.Guest2FullName || '',
          resp?.Guest1DietaryRequirements || '',
          resp?.Guest1MedicalConditions || ''
        ]);
      }
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Kishindo_Guest_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadJSON() {
    const bookings = await DataStore.getBookings();
    const responses = JSON.parse(localStorage.getItem('kishindo_responses') || '{}');
    const fullBackup = { bookings, responses, exportedAt: new Date().toISOString() };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `Kishindo_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  function printDocument() {
    window.print();
  }

  function copyTextToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      alert(successMsg || 'Copied to clipboard');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert(successMsg || 'Copied to clipboard');
    });
  }

  // ── Helper: Format Dates ──
  function formatDate(dStr) {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch(e) { return dStr; }
  }

  // ── 10. DOM Wireup ──
  document.addEventListener('DOMContentLoaded', () => {
    DataStore.init();

    // Setup PIN box auto-tabbing
    document.querySelectorAll('.pin-inputs').forEach(group => {
      const boxes = group.querySelectorAll('.pin-box');
      boxes.forEach((b, idx) => {
        b.addEventListener('input', () => {
          if (b.value && idx < boxes.length - 1) boxes[idx + 1].focus();
        });
        b.addEventListener('keydown', (e) => {
          if (e.key === 'Backspace' && !b.value && idx > 0) boxes[idx - 1].focus();
        });
      });
    });

    // Option cards selection
    document.addEventListener('click', (e) => {
      const card = e.target.closest('.option-card');
      if (!card) return;
      const grid = card.closest('.options-grid');
      if (!grid) return;

      const isRadio = grid.dataset.type === 'radio';
      if (isRadio) {
        grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        const r = card.querySelector('input[type="radio"]');
        if (r) r.checked = true;
      } else {
        const cb = card.querySelector('input[type="checkbox"]');
        if (e.target !== cb) cb.checked = !cb.checked;
        card.classList.toggle('selected', cb.checked);
      }
    });
  });

  // Export to global scope
  window.KishindoApp = {
    handleGuestLogin,
    handleStaffLogin,
    startGuestForm,
    nextFormStep,
    prevFormStep,
    openBookingDetail,
    closeBookingDetail,
    downloadCSV,
    downloadJSON,
    printDocument,
    copyOpsSummary() {
      const txt = document.getElementById('opsSummaryOutput').textContent;
      copyTextToClipboard(txt, 'Operations Summary copied to clipboard!');
    },
    copyEmailPreview() {
      const txt = document.getElementById('emailPreviewOutput').textContent;
      copyTextToClipboard(txt, 'Outlook Email template copied to clipboard!');
    },
    switchEmailTab(type) {
      document.querySelectorAll('.email-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.type === type));
      const b = State.staffBookings.find(item => String(item.nbid) === String(State.selectedBookingNBID));
      if (b) updateEmailPreview(b, type);
    },
    switchAuthTab(role) {
      document.querySelectorAll('.auth-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
      document.getElementById('guestAuthTab').style.display = role === 'guest' ? 'block' : 'none';
      document.getElementById('staffAuthTab').style.display = role === 'staff' ? 'block' : 'none';
    },
    openNewBookingModal() {
      document.getElementById('newBookingModal').classList.add('active');
    },
    closeNewBookingModal() {
      document.getElementById('newBookingModal').classList.remove('active');
    },
    async submitNewBooking() {
      const nbid = document.getElementById('nb_nbid').value.trim();
      const type = document.getElementById('nb_type').value;
      const contact = document.getElementById('nb_contact').value.trim();
      const email = document.getElementById('nb_email').value.trim();
      const checkIn = document.getElementById('nb_checkin').value;
      const checkOut = document.getElementById('nb_checkout').value;
      const guests = parseInt(document.getElementById('nb_guests').value, 10) || 2;
      const rate = document.getElementById('nb_rate').value;
      const extras = document.getElementById('nb_extras').value;

      if (!nbid || !contact || !checkIn || !checkOut) {
        alert('Please complete all required booking fields.');
        return;
      }

      const suites = [];
      ['1', '2', '3'].forEach(i => {
        const sName = document.getElementById(`nb_suite_${i}`).value;
        const sBed = document.getElementById(`nb_bed_${i}`).value;
        if (sName) {
          const pin = String(Math.floor(1000 + Math.random() * 9000));
          suites.push({ name: sName, pin, bedConfig: sBed, status: 'Pending' });
        }
      });

      if (!suites.length) {
        alert('Please assign at least one suite.');
        return;
      }

      const ciDate = new Date(checkIn);
      const coDate = new Date(checkOut);
      const nights = Math.max(1, Math.round((coDate - ciDate) / (1000 * 60 * 60 * 24)));
      const depDate = new Date();
      depDate.setDate(depDate.getDate() + 21); // 21 days from booking date per Rate Card T&C
      const balDate = new Date(ciDate);
      balDate.setDate(balDate.getDate() - 45); // 45 days before arrival per Rate Card T&C

      const newBooking = {
        nbid,
        bookingType: type,
        contactName: contact,
        contactEmail: email,
        checkIn,
        checkOut,
        nights,
        guestCount: guests,
        suites,
        rate,
        extras,
        depositDue: depDate.toISOString().split('T')[0],
        balanceDue: balDate.toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };

      await DataStore.saveBooking(newBooking);
      this.closeNewBookingModal();
      await loadStaffDashboard();
      alert(`Booking ${nbid} created with suites: ${suites.map(s => s.name + ' (PIN: ' + s.pin + ')').join(', ')}`);
    },
    logout() {
      State.activeSession = null;
      State.formData = {};
      document.querySelectorAll('.pin-box').forEach(b => b.value = '');
      showScreen('authScreen');
    }
  };

})();
