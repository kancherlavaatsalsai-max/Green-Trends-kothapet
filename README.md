# Green Trends Kothapet - Staff & Payroll Management System

A dark luxury black-and-pink themed web application built specifically for **Green Trends Kothapet** staff attendance tracking, overtime calculations, leave cuts, percentage-based sales commissions, daily roster pasting/scanning, and monthly payroll slips.

---

## 🌟 Latest Enhancements

### 1. Fixed Card Container Layout
- Reorganized staff attendance cards into a **two-tier responsive layout**:
  - **Tier 1**: Staff avatar, name, designation, base salary, food allowance badge, and attendance status buttons.
  - **Tier 2**: Check-In, Check-Out, worked hours & OT/shortfall badge, and Services (₹) & Products (₹) inputs.
- All inputs are **100% contained** within the card with generous padding so the **Products box never overflows or pops out** of the container.

### 2. Clean Numbers in Leaves Cut Column
- In the Monthly Payroll table, the **Leaves (Cut)** column now displays **strictly pure numbers** (e.g., `1`, `0`, `2`).
- Removed the extra "Days" text that previously caused awkward two-line wrapping.

### 3. WhatsApp Roster Paste & Strict Name Matching (4th Tab)
- **Direct Paste Box**: You can copy & paste the daily roster message directly from WhatsApp into the text area.
- **Strict Name Matching**:
  - The system checks for the presence of each staff member's name.
  - **If a staff name is NOT in the roster, their attendance is NOT added or overwritten** — their existing status remains completely untouched!
- **Auto-Fill Details**:
  - Detects check-in and check-out timings (e.g. `12:00 TO 9:00` $\rightarrow$ 12:00 PM to 9:00 PM; `9:00 TO 6:00` $\rightarrow$ 9:00 AM to 6:00 PM).
  - Automatically identifies `LEAVE` or `WEEKLY OFF`.
- **Photo Upload (OCR)**: Available as a secondary option for scanning schedule images.

---

## 📋 Commission & Overtime Rules

### Percentage-Based Commissions
- **Kalyan (Manager)**: **1% on total salon service revenue per month** if monthly salon service target (e.g. ₹6,00,000) is achieved. No product commission.
- **Islam, Iqram, Suleman, Afrin**: **5% on services** upon reaching 5x base salary target. **5% on products** for ₹8k–₹15k; **8%** for $>$ ₹15k.
- **Reshma, Aruna**: **5% on services** upon reaching 5x base salary target. **5% on products** for ₹15k–₹20k; **8%** for $>$ ₹20k.
- **Anusha (House Keeping)**: None (Fixed ₹16,000 salary, no OT).

### Overtime & Shortfall Netting
- Standard shift: **9 hours**.
- Overtime (+₹50/h) is added only after 45 minutes extra.
- Leaving early (shortfall against 9 hours) is **deducted from earned OT hours** at the end of the month:
  $$\text{Net OT Hours} = \max\bigl(0, \text{Total OT Earned} - \text{Total Shortfall}\bigr)$$
  $$\text{OT Pay} = \text{Net OT Hours} \times ₹50$$

---

## 🚀 Live Access

- **Staff Portal**: **[http://127.0.0.1:8080](http://127.0.0.1:8080)**
- **Roster Scanner (4th Tab)**: **[http://127.0.0.1:8080/#roster](http://127.0.0.1:8080/#roster)**
- **Secret Admin Page**: **[http://127.0.0.1:8080/#admin](http://127.0.0.1:8080/#admin)**
- **Direct File**: [`C:\Users\kanch\.gemini\antigravity\scratch\salon-staff-manager\index.html`](file:///C:/Users/kanch/.gemini/antigravity/scratch/salon-staff-manager/index.html)
