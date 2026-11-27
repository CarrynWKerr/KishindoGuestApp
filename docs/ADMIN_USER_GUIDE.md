# Kishindo Conservation Reserve — Administrator User Guide

**Portal URL:** `https://kishindo-guests.pages.dev/admin` (or `/administrator`)  
**Access Level:** `Admin Role` (Full Operations, Team & Reservation Governance)

---

## 1. Overview of the Admin Role
The **Admin Role** is designed for General Managers, Operations Directors, and Head of Reservations. Users with the Admin Role have full operational authority over the Kishindo Guest App, including:
- **Team Governance:** Creating team user accounts and assigning `Admin Role` or `Anchor Role`.
- **Full Booking Management:** Creating reservations, assigning suites, updating dates, and performing **permanent deletions**.
- **NightsBridge Import:** Importing batch booking sheets with automatic multi-room assignment and deduplication.
- **Reporting & Data Export:** Downloading complete multi-sheet operational Excel workbooks and JSON backup archives.

---

## 2. Accessing the Portal
1. Navigate to: **`https://kishindo-guests.pages.dev/admin`**
2. Enter your unique email address and password.
3. Click **Access Lodge Operations →**.
4. Upon signing in, your role indicator in the top header will display:  
   `[Your Name] · Admin Role` (highlighted with an amber badge).

> [!NOTE]
> Guests use `https://kishindo-guests.pages.dev/` with their 4-digit Suite PIN. Staff and Admins always access through `/admin` or `/administrator`.

---

## 3. Team Management & User Roles (Admin Only)

Only users authenticated with the **`Admin Role`** can access the **Manage Team** panel.

### Opening Team Management
In the top dashboard action bar, click **👥 Manage Team**.

### Active Team Members
The table displays all registered staff members with their full name, email, and assigned role badge:
- **`Admin Role`**: Full operational permissions + user management + permanent booking deletion.
- **`Anchor Role`**: Day-to-day operations (viewing, editing, NightsBridge importing, Excel export, and booking cancellation) without deletion or team administration privileges.

### Adding a New Team Member
1. Under **+ Add New Team Member**, enter:
   - **Full Name:** The team member's actual human name (e.g. `Sarah Jenkins`).
   - **Email Address:** Their unique login email (e.g. `sarah@kishindo.com`). Emails must be unique.
   - **Password:** Minimum 6 characters.
   - **Assigned Role:** Select either `Anchor Role` or `Admin Role`.
2. Click **Create Team User**.
3. If an account with that email already exists, the system prompts you to confirm before updating their details.

### Removing a Team Member
Click **Remove** next to the user row. You cannot remove your own active account.

---

## 4. Reservation Governance & Permanent Deletion

### Creating a New Booking Manually
1. Click **+ New Booking** in the dashboard.
2. Complete the booking details:
   - **NBID:** The NightsBridge Booking ID (or unique numeric reference).
   - **Booking Type:** Select `Direct` or `Agent`. If `Agent`, enter the Agent Name and Agent Email.
   - **Lead Guest Contact:** Full Name and Email Address.
   - **Dates:** Check-in and Check-out dates.
   - **Guests (Pax):** Total guest count (adults + children).
3. **Assign Suites & Bed Configurations:**
   - Suite 1: **Tibo** (Max 2 guests)
   - Suite 2: **Ussuri** (Max 3 guests)
   - Suite 3: **Zaria** (Max 2 guests)
   - Suite 4: **Guide's Room** (Max 2 guests — photographic tour guides)
   - Choose bed setup: `King Bed` or `Two Twin Single Beds`.
   - Each suite is automatically allocated a random 4-digit PIN (or you may specify a custom PIN).
4. Click **Create Reservation**.

### Editing an Existing Reservation
1. From the dashboard list, click any reservation card to open the detail view.
2. Click **✏️ Edit Booking**.
3. Update dates, guest count, agent details, or suite allocations/bed configs.
4. Click **Save Changes**.

### Cancelling vs. Permanent Deletion
- **Cancelling (`🚫 Cancel Booking`):** Available to both Admins and Anchors. Changes the booking stage to `Cancelled`. The booking remains in the registry for audit and rooming history.
- **Permanent Deletion (`🗑️ Delete Booking Permanently`):** **Admin Role only.**
  - Completely purges the booking document and all associated suite pre-arrival responses from the database.
  - An explicit confirmation dialogue displays the NBID and Guest Name before executing.
  - **Important:** Once deleted, this action cannot be undone.

---

## 5. NightsBridge Bulk Import

The importer processes CSV reports exported directly from NightsBridge PMS.

### How to Import
1. In the dashboard top bar, click **📥 Import NightsBridge**.
2. Click the dropzone to select your CSV file, or paste the raw CSV text directly into the text area.
3. Click **Import Bookings**.

### Intelligent Parser Rules & Safeguards
- **Booking ID Priority:** Prioritizes actual `Booking Number` / `Booking ID` / `NBID` columns and ignores `Agent Ref`, `Property Ref`, or `Invoice No`.
- **Accurate Date Detection:** Excludes monetary columns (`Deposit`, `Total Amount`, `Paid to Date`) so payment figures are never parsed as checkout dates.
- **Children Included in Pax:** Sums `Adults + Children` automatically to capture the true total party size.
- **Multi-Room Deduplication:**
  - Multi-room bookings with the same NBID across multiple rows (e.g. Row 1: Ussuri, Row 2: Tibo) merge into a single reservation with multiple suites.
  - Exact duplicate rows (same NBID and same room) are skipped safely.

---

## 6. Operational Reports & Data Exports
Admins can generate three real-time export formats from the dashboard:
1. **📊 Download Excel (`.xlsx`):** A comprehensive multi-sheet workbook including:
   - *Master Guest Registry:* All bookings, dates, contacts, and statuses.
   - *Dietary & Medical Summary:* Crucial kitchen/chef requirements per suite.
   - *Arrivals & Logistics:* Arrival times, flight numbers, and road transfer details.
2. **⬇ Backup JSON:** Full machine-readable database backup containing all booking records and guest responses.
3. **🖨 Print This PDF:** Located inside any booking detail card, formatted cleanly for printing guest welcome packs.

---

## 7. Zero Data Deletion Policy & Live Maintenance
- **Data Integrity:** Never run scripts that delete records from the live database.
- **Clean State:** If you clear out test bookings, the app recognizes the clean state and will never re-inject demo bookings.
