/**
 * Green Trends Kothapet - Staff & Payroll Management System
 * Latest Refinements:
 * 1. Fixed product box overflow: clean two-tier layout ensuring all inputs fit with generous breathing room.
 * 2. Leaves cut column shows strictly pure numbers (e.g. 1, 0, 2), no extra text like "Days".
 * 3. Roster Scanner updates:
 *    - Direct Paste box for WhatsApp roster message.
 *    - Strict Name Check: only staff names found in the roster are updated. If name is not in roster, data is NOT added/overwritten.
 *    - Mode switcher: Paste (default) or Upload Photo (OCR).
 * 4. Percentage commissions and OT shortfall netting fully maintained.
 */

// ==========================================
// 1. DEFAULT DATA CONFIGURATION
// ==========================================

const DEFAULT_STAFF = [
  {
    id: 'staff_1',
    name: 'KALYAN',
    role: 'Salon Manager',
    gender: 'male',
    baseSalary: 25000,
    foodAllowance: 0,
    isManager: true,
    isHousekeeping: false,
    managerCommissionRate: 1 // 1% on total salon service revenue
  },
  {
    id: 'staff_2',
    name: 'ISLAM',
    role: 'Hair Stylist & Groomer',
    gender: 'male',
    baseSalary: 25000,
    foodAllowance: 1500,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 125000, // 5 * 25,000
    serviceCommissionRate: 5, // 5%
    productTier1Min: 8000,
    productTier1Rate: 5, // 5% for 8k-15k
    productTier2Min: 15000,
    productTier2Rate: 8 // 8% for >15k
  },
  {
    id: 'staff_3',
    name: 'IQRAM',
    role: 'Hair Stylist & Colourist',
    gender: 'male',
    baseSalary: 25000,
    foodAllowance: 1500,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 125000,
    serviceCommissionRate: 5,
    productTier1Min: 8000,
    productTier1Rate: 5,
    productTier2Min: 15000,
    productTier2Rate: 8
  },
  {
    id: 'staff_4',
    name: 'SULEMAN',
    role: 'Senior Stylist',
    gender: 'male',
    baseSalary: 25000,
    foodAllowance: 1500,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 125000,
    serviceCommissionRate: 5,
    productTier1Min: 8000,
    productTier1Rate: 5,
    productTier2Min: 15000,
    productTier2Rate: 8
  },
  {
    id: 'staff_5',
    name: 'AFRIN',
    role: 'Beauty & Skin Therapist',
    gender: 'female',
    baseSalary: 18000,
    foodAllowance: 0,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 90000, // 5 * 18,000
    serviceCommissionRate: 5,
    productTier1Min: 8000,
    productTier1Rate: 5,
    productTier2Min: 15000,
    productTier2Rate: 8
  },
  {
    id: 'staff_6',
    name: 'RESHMA',
    role: 'Senior Beautician & Makeup',
    gender: 'female',
    baseSalary: 25000,
    foodAllowance: 0,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 125000,
    serviceCommissionRate: 5,
    productTier1Min: 15000,
    productTier1Rate: 5, // 5% for 15k-20k
    productTier2Min: 20000,
    productTier2Rate: 8 // 8% for >20k
  },
  {
    id: 'staff_7',
    name: 'Aruna',
    role: 'Spa & Hair Specialist',
    gender: 'female',
    baseSalary: 23000,
    foodAllowance: 0,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: 115000, // 5 * 23,000
    serviceCommissionRate: 5,
    productTier1Min: 15000,
    productTier1Rate: 5,
    productTier2Min: 20000,
    productTier2Rate: 8
  },
  {
    id: 'staff_8',
    name: 'Anusha (HOUSE KEEPING)',
    role: 'House Keeping & Salon Care',
    gender: 'female',
    baseSalary: 16000,
    foodAllowance: 0,
    isManager: false,
    isHousekeeping: true
  }
];

const DEFAULT_SALON_RULES = {
  salonName: 'Green Trends Kothapet',
  shiftHours: 9,
  otGraceThresholdMinutes: 45,
  otHourlyRate: 50,
  salonMonthlyServiceTarget: 600000, // Target for Kalyan's 1%
  managerCommissionRate: 1
};

const STORAGE_KEYS = {
  STAFF: 'gt_kothapet_staff_v4',
  RULES: 'gt_kothapet_rules_v4',
  ATTENDANCE: 'gt_kothapet_attendance_v4',
  AUTH: 'gt_kothapet_auth_v5',
  SESSION: 'gt_kothapet_session_v5'
};

const DEFAULT_AUTH = {
  username: 'kancherlavatsalsai@gmial.com',
  password: 'Vinayaka@9',
  accounts: [
    { username: 'kancherlavatsalsai@gmial.com', password: 'Vinayaka@9', role: 'Owner & Administrator' }
  ]
};

// ==========================================
// 2. STATE & STORAGE
// ==========================================

let staffList = [];
let salonRules = {};
let attendanceData = {}; 

let currentDate = new Date();
let selectedDateStr = formatDateKey(currentDate);
let selectedMonthStr = formatMonthKey(currentDate);

// Parsed Roster Buffer (Only contains staff found in the roster!)
let parsedRosterBuffer = {};

// ==========================================
// REAL SEPTEMBER 2026 WHATSAPP ATTENDANCE DATASET
// (Extracted accurately from September 1-26 salon check-in/out records)
// ==========================================
const SEPTEMBER_2026_REAL_ATTENDANCE = {"2026-09-01":{"staff_1":{"status":"Present","inH":12,"inM":5,"inAmpm":"PM","outH":8,"outM":42,"workedMinutes":517,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":7,"inAmpm":"PM","outH":8,"outM":32,"workedMinutes":505,"otHours":0,"shortfallHours":1,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":8,"inM":58,"inAmpm":"AM","outH":5,"outM":57,"workedMinutes":539,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":10,"inM":20,"inAmpm":"AM","outH":7,"outM":21,"workedMinutes":541,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":5,"inAmpm":"PM","outH":8,"outM":36,"workedMinutes":511,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-02":{"staff_1":{"status":"Present","inH":12,"inM":7,"inAmpm":"PM","outH":9,"outM":4,"workedMinutes":537,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":5,"inAmpm":"AM","outH":6,"outM":0,"workedMinutes":535,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":11,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":529,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":54,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":9,"inM":56,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":544,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":35,"inAmpm":"AM","outH":9,"outM":1,"workedMinutes":566,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-03":{"staff_1":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":11,"inM":6,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":594,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":35,"inAmpm":"AM","outH":6,"outM":1,"workedMinutes":506,"otHours":0,"shortfallHours":1,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":37,"inAmpm":"PM","outH":8,"outM":59,"workedMinutes":502,"otHours":0,"shortfallHours":1,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":55,"inAmpm":"AM","outH":8,"outM":2,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":9,"inM":51,"inAmpm":"AM","outH":8,"outM":59,"workedMinutes":668,"otHours":2,"shortfallHours":0,"otPay":100,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-04":{"staff_1":{"status":"Present","inH":11,"inM":25,"inAmpm":"AM","outH":9,"outM":13,"workedMinutes":588,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":8,"inAmpm":"PM","outH":9,"outM":5,"workedMinutes":537,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":8,"inM":50,"inAmpm":"AM","outH":6,"outM":0,"workedMinutes":550,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":11,"inM":11,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":589,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":9,"inM":54,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":59,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":541,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-05":{"staff_1":{"status":"Present","inH":12,"inM":6,"inAmpm":"PM","outH":9,"outM":23,"workedMinutes":557,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":11,"inM":59,"inAmpm":"AM","outH":9,"outM":19,"workedMinutes":560,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":15,"inAmpm":"AM","outH":6,"outM":13,"workedMinutes":538,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":5,"inAmpm":"PM","outH":9,"outM":12,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":46,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":554,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":10,"inM":14,"inAmpm":"AM","outH":7,"outM":6,"workedMinutes":532,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":14,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":529,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-06":{"staff_1":{"status":"Present","inH":12,"inM":25,"inAmpm":"PM","outH":9,"outM":10,"workedMinutes":525,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":10,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":660,"otHours":2,"shortfallHours":0,"otPay":100,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":5,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":715,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":26,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":514,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":45,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":615,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":9,"inM":58,"inAmpm":"AM","outH":7,"outM":2,"workedMinutes":544,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":10,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":530,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Weekly Off","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-07":{"staff_1":{"status":"Present","inH":12,"inM":1,"inAmpm":"PM","outH":9,"outM":6,"workedMinutes":545,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":9,"inM":6,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":714,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":4,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":539,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":5,"inAmpm":"AM","outH":7,"outM":3,"workedMinutes":538,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Leave","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":57,"inAmpm":"AM","outH":9,"outM":2,"workedMinutes":545,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-08":{"staff_1":{"status":"Present","inH":12,"inM":9,"inAmpm":"PM","outH":9,"outM":14,"workedMinutes":545,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":9,"inM":8,"inAmpm":"AM","outH":6,"outM":35,"workedMinutes":567,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":12,"inM":8,"inAmpm":"PM","outH":9,"outM":14,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":1,"inAmpm":"AM","outH":7,"outM":5,"workedMinutes":544,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Leave","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":2,"inAmpm":"PM","outH":9,"outM":14,"workedMinutes":552,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-09":{"staff_1":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":19,"inAmpm":"AM","outH":6,"outM":30,"workedMinutes":551,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":17,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":523,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":15,"inAmpm":"AM","outH":7,"outM":4,"workedMinutes":529,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":12,"inM":10,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":530,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-10":{"staff_1":{"status":"Present","inH":12,"inM":6,"inAmpm":"PM","outH":9,"outM":8,"workedMinutes":542,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":9,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":531,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Present","inH":9,"inM":3,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":717,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":20,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":520,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":9,"inM":48,"inAmpm":"AM","outH":7,"outM":4,"workedMinutes":556,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":14,"inAmpm":"PM","outH":9,"outM":1,"workedMinutes":527,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-11":{"staff_1":{"status":"Present","inH":12,"inM":18,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":525,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":46,"inAmpm":"AM","outH":8,"outM":2,"workedMinutes":556,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":11,"inM":55,"inAmpm":"AM","outH":9,"outM":3,"workedMinutes":548,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":25,"inAmpm":"AM","outH":7,"outM":1,"workedMinutes":516,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-12":{"staff_1":{"status":"Present","inH":11,"inM":56,"inAmpm":"AM","outH":9,"outM":2,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":11,"inM":1,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":539,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":11,"inM":43,"inAmpm":"AM","outH":9,"outM":2,"workedMinutes":559,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":9,"inM":46,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":554,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-13":{"staff_1":{"status":"Present","inH":12,"inM":10,"inAmpm":"PM","outH":9,"outM":4,"workedMinutes":534,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":8,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":712,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":56,"inAmpm":"AM","outH":8,"outM":2,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":10,"inM":9,"inAmpm":"AM","outH":7,"outM":13,"workedMinutes":544,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":1,"inAmpm":"PM","outH":9,"outM":1,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Weekly Off","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-14":{"staff_1":{"status":"Present","inH":12,"inM":25,"inAmpm":"PM","outH":10,"outM":56,"workedMinutes":631,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":8,"inM":51,"inAmpm":"AM","outH":8,"outM":55,"workedMinutes":724,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":9,"inM":54,"inAmpm":"AM","outH":7,"outM":1,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":4,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":536,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-15":{"staff_1":{"status":"Present","inH":11,"inM":59,"inAmpm":"AM","outH":9,"outM":27,"workedMinutes":568,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":8,"inM":56,"inAmpm":"AM","outH":9,"outM":25,"workedMinutes":749,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":9,"inM":52,"inAmpm":"AM","outH":6,"outM":59,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":11,"inM":59,"inAmpm":"AM","outH":8,"outM":59,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-16":{"staff_1":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":2,"inM":14,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":406,"otHours":0,"shortfallHours":2,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":8,"inM":55,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":725,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":12,"inM":18,"inAmpm":"PM","outH":9,"outM":1,"workedMinutes":523,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":4,"inAmpm":"AM","outH":7,"outM":1,"workedMinutes":537,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-17":{"staff_1":{"status":"Present","inH":12,"inM":8,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":535,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":8,"inAmpm":"PM","outH":9,"outM":8,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":1,"inAmpm":"AM","outH":6,"outM":6,"workedMinutes":545,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":53,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":12,"inM":17,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":526,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":9,"inM":48,"inAmpm":"AM","outH":7,"outM":1,"workedMinutes":553,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-18":{"staff_1":{"status":"Present","inH":12,"inM":5,"inAmpm":"PM","outH":10,"outM":39,"workedMinutes":634,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":10,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":530,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":48,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":552,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":56,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":544,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":11,"inM":27,"inAmpm":"AM","outH":10,"outM":42,"workedMinutes":675,"otHours":2,"shortfallHours":0,"otPay":100,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":6,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":534,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-19":{"staff_1":{"status":"Present","inH":11,"inM":48,"inAmpm":"AM","outH":9,"outM":6,"workedMinutes":558,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":12,"inAmpm":"PM","outH":9,"outM":7,"workedMinutes":535,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":8,"inM":51,"inAmpm":"AM","outH":6,"outM":6,"workedMinutes":555,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":45,"inAmpm":"AM","outH":8,"outM":1,"workedMinutes":556,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":12,"inM":45,"inAmpm":"PM","outH":9,"outM":6,"workedMinutes":501,"otHours":0,"shortfallHours":1,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":11,"inAmpm":"AM","outH":7,"outM":4,"workedMinutes":533,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-20":{"staff_1":{"status":"Present","inH":12,"inM":6,"inAmpm":"PM","outH":9,"outM":49,"workedMinutes":583,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":11,"inM":51,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":549,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":11,"inAmpm":"AM","outH":6,"outM":12,"workedMinutes":541,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":43,"inAmpm":"AM","outH":8,"outM":10,"workedMinutes":567,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":24,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":636,"otHours":1,"shortfallHours":0,"otPay":50,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Weekly Off","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-21":{"staff_1":{"status":"Present","inH":12,"inM":6,"inAmpm":"PM","outH":9,"outM":5,"workedMinutes":539,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":12,"inM":11,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":532,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":9,"inM":6,"inAmpm":"AM","outH":6,"outM":8,"workedMinutes":542,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":9,"inM":52,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":548,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":12,"inM":5,"inAmpm":"PM","outH":9,"outM":1,"workedMinutes":536,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-22":{"staff_1":{"status":"Present","inH":12,"inM":2,"inAmpm":"PM","outH":9,"outM":29,"workedMinutes":567,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":9,"workedMinutes":729,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":1,"inAmpm":"AM","outH":7,"outM":2,"workedMinutes":541,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":50,"inAmpm":"AM","outH":9,"outM":1,"workedMinutes":551,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-23":{"staff_1":{"status":"Present","inH":10,"inM":13,"inAmpm":"AM","outH":6,"outM":15,"workedMinutes":482,"otHours":0,"shortfallHours":1,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":8,"inM":55,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":725,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":6,"inAmpm":"AM","outH":7,"outM":4,"workedMinutes":538,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":53,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":547,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-24":{"staff_1":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":9,"inM":5,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":715,"otHours":3,"shortfallHours":0,"otPay":150,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":12,"inAmpm":"PM","outH":9,"outM":3,"workedMinutes":531,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":12,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":648,"otHours":2,"shortfallHours":0,"otPay":100,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-25":{"staff_1":{"status":"Present","inH":4,"inM":55,"inAmpm":"PM","outH":9,"outM":4,"workedMinutes":249,"otHours":0,"shortfallHours":5,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":6,"outM":39,"workedMinutes":579,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":6,"inAmpm":"PM","outH":8,"outM":56,"workedMinutes":530,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":10,"inM":39,"inAmpm":"AM","outH":8,"outM":10,"workedMinutes":571,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":11,"inM":54,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":546,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}},"2026-09-26":{"staff_1":{"status":"Present","inH":12,"inM":0,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_2":{"status":"Weekly Off","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_3":{"status":"Leave","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":0,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_4":{"status":"Present","inH":12,"inM":0,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_5":{"status":"Present","inH":11,"inM":0,"inAmpm":"AM","outH":8,"outM":0,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_6":{"status":"Present","inH":12,"inM":0,"inAmpm":"PM","outH":9,"outM":0,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_7":{"status":"Present","inH":10,"inM":0,"inAmpm":"AM","outH":7,"outM":0,"workedMinutes":540,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0},"staff_8":{"status":"Present","inH":9,"inM":0,"inAmpm":"AM","outH":9,"outM":0,"workedMinutes":720,"otHours":0,"shortfallHours":0,"otPay":0,"servicesDone":0,"productsSold":0}}};

const DATA_VERSION = '20260926_chat_v2';

function initStorage() {
  const savedStaff = localStorage.getItem(STORAGE_KEYS.STAFF);
  if (savedStaff) {
    try { staffList = JSON.parse(savedStaff); } catch(e) { staffList = [...DEFAULT_STAFF]; }
  } else {
    staffList = [...DEFAULT_STAFF];
    localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
  }

  const savedRules = localStorage.getItem(STORAGE_KEYS.RULES);
  if (savedRules) {
    try { salonRules = JSON.parse(savedRules); } catch(e) { salonRules = { ...DEFAULT_SALON_RULES }; }
  } else {
    salonRules = { ...DEFAULT_SALON_RULES };
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(salonRules));
  }

  // PRESERVE user's existing saved attendance data at all costs!
  let savedAttendance = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
  if (!savedAttendance) {
    // Check older keys so user's previously added 15 days are NEVER lost
    const olderKeys = ['gt_kothapet_attendance_v3', 'gt_kothapet_attendance_v2', 'gt_kothapet_attendance_v1', 'gt_kothapet_attendance', 'gt_attendance_data'];
    for (const ok of olderKeys) {
      const val = localStorage.getItem(ok);
      if (val) {
        savedAttendance = val;
        break;
      }
    }
  }

  if (savedAttendance) {
    try {
      attendanceData = JSON.parse(savedAttendance);
      // Ensure saved under current key as well
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceData));
    } catch(e) {
      attendanceData = JSON.parse(JSON.stringify(SEPTEMBER_2026_REAL_ATTENDANCE));
    }
  } else {
    // Only if brand new without existing data, load the September seed
    attendanceData = JSON.parse(JSON.stringify(SEPTEMBER_2026_REAL_ATTENDANCE));
    saveAttendanceData();
  }
}

function syncRealSeptemberAttendanceData() {
  if (confirm("Re-sync all attendance with accurate WhatsApp check-in / check-out data for Sep 1–26?")) {
    attendanceData = JSON.parse(JSON.stringify(SEPTEMBER_2026_REAL_ATTENDANCE));
    saveAttendanceData();
    updateViewFromHash();
    showToast("Successfully synchronized all September 1–26 attendance records from chat!");
  }
}

function saveStaffList() {
  localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staffList));
}

function saveSalonRules() {
  localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(salonRules));
}

function saveAttendanceData() {
  localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendanceData));
}

// ==========================================
// 2.5 AUTHENTICATION & LOGIN MANAGEMENT
// ==========================================

function getAuthCredentials() {
  const saved = localStorage.getItem(STORAGE_KEYS.AUTH);
  if (!saved) {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(DEFAULT_AUTH));
    return { ...DEFAULT_AUTH };
  }
  try {
    return JSON.parse(saved);
  } catch (e) {
    return { ...DEFAULT_AUTH };
  }
}

function getSessionUser() {
  const local = localStorage.getItem(STORAGE_KEYS.SESSION);
  if (local) {
    try { return JSON.parse(local); } catch (e) {}
  }
  const session = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  if (session) {
    try { return JSON.parse(session); } catch (e) {}
  }
  return null;
}

function saveSessionUser(user, remember = true) {
  const json = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.SESSION, json);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.SESSION, json);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
}

function clearSessionUser() {
  localStorage.removeItem(STORAGE_KEYS.SESSION);
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

function initAuth() {
  const user = getSessionUser();
  const overlay = document.getElementById('loginOverlay');
  const userBadge = document.getElementById('userHeaderBadge');
  const nameEl = document.getElementById('headerUserName');

  if (user && user.username) {
    if (overlay) overlay.classList.add('hidden');
    if (userBadge) userBadge.classList.remove('hidden');
    if (nameEl) {
      const u = user.username;
      const displayName = u.includes('@') ? (u.split('@')[0]) : u;
      nameEl.innerText = displayName;
      nameEl.title = u;
    }
  } else {
    if (overlay) overlay.classList.remove('hidden');
    if (userBadge) userBadge.classList.add('hidden');
  }
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const uInput = document.getElementById('loginUsername');
  const pInput = document.getElementById('loginPassword');
  const rememberInput = document.getElementById('loginRememberMe');
  const errorAlert = document.getElementById('loginErrorAlert');
  const errorMsg = document.getElementById('loginErrorMsg');
  const loginCard = document.getElementById('loginCard');

  const username = (uInput?.value || '').trim().toLowerCase();
  const password = (pInput?.value || '').trim();
  const remember = rememberInput ? rememberInput.checked : true;

  const authCreds = getAuthCredentials();
  let matchedUser = null;

  // Check accounts list
  if (authCreds.accounts && Array.isArray(authCreds.accounts)) {
    matchedUser = authCreds.accounts.find(
      acc => {
        const accUser = acc.username.toLowerCase();
        const matchesUser = (accUser === username) || 
          (accUser === 'kancherlavatsalsai@gmial.com' && username === 'kancherlavatsalsai@gmail.com') ||
          (accUser === 'kancherlavatsalsai@gmail.com' && username === 'kancherlavatsalsai@gmial.com');
        return matchesUser && acc.password === password;
      }
    );
  }

  // Check top-level credentials
  if (!matchedUser && authCreds.username) {
    const rootUser = authCreds.username.toLowerCase();
    const matchesUser = (rootUser === username) || 
      (rootUser === 'kancherlavatsalsai@gmial.com' && username === 'kancherlavatsalsai@gmail.com') ||
      (rootUser === 'kancherlavatsalsai@gmail.com' && username === 'kancherlavatsalsai@gmial.com');
    if (matchesUser && authCreds.password === password) {
      matchedUser = { username: authCreds.username, role: 'Owner & Administrator' };
    }
  }

  // Exact fallback for owner (Strictly NO admin / kalyan)
  if (!matchedUser && (username === 'kancherlavatsalsai@gmial.com' || username === 'kancherlavatsalsai@gmail.com') && password === 'Vinayaka@9') {
    matchedUser = { username: 'kancherlavatsalsai@gmial.com', role: 'Owner & Administrator' };
  }

  if (matchedUser) {
    if (errorAlert) errorAlert.classList.add('hidden');
    saveSessionUser(matchedUser, remember);

    const overlay = document.getElementById('loginOverlay');
    if (overlay) overlay.classList.add('hidden');

    const userBadge = document.getElementById('userHeaderBadge');
    const nameEl = document.getElementById('headerUserName');
    if (userBadge) userBadge.classList.remove('hidden');
    if (nameEl) {
      const u = matchedUser.username;
      const displayName = u.includes('@') ? (u.split('@')[0]) : u;
      nameEl.innerText = displayName;
      nameEl.title = u;
    }

    showToast(`Welcome, ${matchedUser.username}!`);
  } else {
    if (errorAlert) {
      errorAlert.classList.remove('hidden');
      if (errorMsg) errorMsg.innerText = 'Incorrect username or password. Please try again.';
    }
    if (loginCard) {
      loginCard.classList.remove('shake-anim');
      void loginCard.offsetWidth; // trigger reflow
      loginCard.classList.add('shake-anim');
    }
  }
}

function logoutUser() {
  clearSessionUser();
  const overlay = document.getElementById('loginOverlay');
  const userBadge = document.getElementById('userHeaderBadge');
  const pInput = document.getElementById('loginPassword');

  if (pInput) pInput.value = '';
  if (overlay) overlay.classList.remove('hidden');
  if (userBadge) userBadge.classList.add('hidden');

  const errorAlert = document.getElementById('loginErrorAlert');
  if (errorAlert) errorAlert.classList.add('hidden');

  showToast('You have been logged out.');
}

function togglePasswordVisibility() {
  const pInput = document.getElementById('loginPassword');
  const eyeIcon = document.getElementById('passwordEyeIcon');
  if (!pInput || !eyeIcon) return;

  if (pInput.type === 'password') {
    pInput.type = 'text';
    eyeIcon.classList.remove('fa-eye-slash');
    eyeIcon.classList.add('fa-eye');
  } else {
    pInput.type = 'password';
    eyeIcon.classList.remove('fa-eye');
    eyeIcon.classList.add('fa-eye-slash');
  }
}

function saveAdminCredentials() {
  const usernameInput = document.getElementById('adminAuthUsername');
  const passwordInput = document.getElementById('adminAuthPassword');
  
  const newUsername = (usernameInput?.value || '').trim();
  const newPassword = (passwordInput?.value || '').trim();

  if (!newUsername) {
    showToast('Username cannot be empty');
    return;
  }

  const authCreds = getAuthCredentials();
  authCreds.username = newUsername;

  if (authCreds.accounts && Array.isArray(authCreds.accounts)) {
    const acc = authCreds.accounts.find(a => a.username.toLowerCase() === newUsername.toLowerCase());
    if (acc) {
      if (newPassword) acc.password = newPassword;
    } else {
      authCreds.accounts.push({ username: newUsername, password: newPassword || 'password123', role: 'Custom User' });
    }
  }
  if (newPassword) {
    authCreds.password = newPassword;
  }

  localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(authCreds));

  const sessionUser = getSessionUser();
  if (sessionUser) {
    sessionUser.username = newUsername;
    saveSessionUser(sessionUser, true);
    const nameEl = document.getElementById('headerUserName');
    if (nameEl) nameEl.innerText = newUsername.toUpperCase();
  }

  if (passwordInput) passwordInput.value = '';
  showToast('Login credentials updated successfully!');
}

// ==========================================
// 3. CORE CALCULATION ENGINES
// ==========================================

function convertToMinutes(h, m, ampm) {
  let hour = parseInt(h, 10) || 12;
  let minute = parseInt(m, 10) || 0;
  
  if (ampm === 'AM') {
    if (hour === 12) hour = 0;
  } else {
    if (hour !== 12) hour += 12;
  }
  return hour * 60 + minute;
}

function calculateShiftHoursParsed(inH, inM, inAmpm, outH, outM, outAmpm = 'PM', isHousekeeping = false) {
  if (typeof outAmpm === 'boolean') {
    isHousekeeping = outAmpm;
    outAmpm = 'PM';
  }
  const inMinutes = convertToMinutes(inH, inM, inAmpm || 'AM');
  const outMinutes = convertToMinutes(outH, outM, outAmpm || 'PM');

  let totalWorkedMinutes = outMinutes - inMinutes;
  if (totalWorkedMinutes < 0) {
    totalWorkedMinutes += 24 * 60;
  }

  const standardShiftMinutes = (salonRules.shiftHours || 9) * 60; // 540 mins
  const thresholdMinutes = salonRules.otGraceThresholdMinutes || 45; // 45 mins
  const ratePerHour = salonRules.otHourlyRate || 50;

  const hoursWorked = Math.floor(totalWorkedMinutes / 60);
  const minsWorked = totalWorkedMinutes % 60;
  const formattedDuration = `${hoursWorked}h ${minsWorked < 10 ? '0' : ''}${minsWorked}m`;

  let otMinutes = 0;
  let otHours = 0;
  let shortfallHours = 0;
  let otPay = 0;

  if (!isHousekeeping) {
    if (totalWorkedMinutes > standardShiftMinutes) {
      otMinutes = totalWorkedMinutes - standardShiftMinutes;
      if (otMinutes >= thresholdMinutes) {
        otHours = 1 + Math.floor((otMinutes - thresholdMinutes) / 60);
        otPay = otHours * ratePerHour;
      }
    } else if (totalWorkedMinutes < standardShiftMinutes) {
      const shortMinutes = standardShiftMinutes - totalWorkedMinutes;
      shortfallHours = Math.round(shortMinutes / 60);
    }
  }

  return {
    workedMinutes: totalWorkedMinutes,
    formattedDuration,
    otMinutes,
    otHours,
    shortfallHours,
    otPay
  };
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function calculateStaffMonthPayroll(staff, year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  const perDaySalary = staff.baseSalary / daysInMonth;

  let presentDays = 0;
  let weeklyOffs = 0;
  let unpaidLeaves = 0;
  let totalGrossOtHours = 0;
  let totalShortfallHours = 0;
  let totalServicesDone = 0;
  let totalProductsSold = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRecord = attendanceData[dayStr] && attendanceData[dayStr][staff.id];

    if (dayRecord) {
      if (dayRecord.status === 'Present') {
        presentDays++;
        if (!staff.isHousekeeping) {
          totalGrossOtHours += (dayRecord.otHours || 0);
          totalShortfallHours += (dayRecord.shortfallHours || 0);
        }
        totalServicesDone += Number(dayRecord.servicesDone || 0);
        totalProductsSold += Number(dayRecord.productsSold || 0);
      } else if (dayRecord.status === 'Weekly Off') {
        weeklyOffs++;
      } else if (dayRecord.status === 'Leave' || dayRecord.status === 'Absent') {
        unpaidLeaves++;
      }
    }
  }

  const leaveDeduction = unpaidLeaves * perDaySalary;

  let netOtHours = 0;
  let netOtPay = 0;

  if (!staff.isHousekeeping) {
    netOtHours = Math.max(0, totalGrossOtHours - totalShortfallHours);
    netOtPay = netOtHours * (salonRules.otHourlyRate || 50);
  }

  let serviceCommission = 0;
  let productCommission = 0;

  if (staff.isManager) {
    const totalSalonServices = calculateTotalSalonServiceRevenue(year, month);
    const target = salonRules.salonMonthlyServiceTarget || 600000;
    if (totalSalonServices >= target) {
      serviceCommission = Math.round(totalSalonServices * ((staff.managerCommissionRate || 1) / 100));
    }
    productCommission = 0;
  } else if (!staff.isHousekeeping) {
    const target = staff.serviceTarget || (staff.baseSalary * 5);
    if (totalServicesDone >= target) {
      serviceCommission = Math.round(totalServicesDone * ((staff.serviceCommissionRate || 5) / 100));
    }

    if (staff.productTier2Min && totalProductsSold > staff.productTier2Min) {
      productCommission = Math.round(totalProductsSold * (staff.productTier2Rate / 100));
    } else if (staff.productTier1Min && totalProductsSold >= staff.productTier1Min) {
      productCommission = Math.round(totalProductsSold * (staff.productTier1Rate / 100));
    }
  }

  const totalIncentives = serviceCommission + productCommission;
  const foodAllowance = staff.foodAllowance || 0;

  const netPayable = Math.round(
    staff.baseSalary + foodAllowance - leaveDeduction + netOtPay + totalIncentives
  );

  return {
    staff,
    daysInMonth,
    perDaySalary,
    presentDays,
    weeklyOffs,
    unpaidLeaves,
    leaveDeduction,
    totalGrossOtHours,
    totalShortfallHours,
    netOtHours,
    netOtPay,
    totalServicesDone,
    totalProductsSold,
    serviceCommission,
    productCommission,
    totalIncentives,
    foodAllowance,
    netPayable
  };
}

function calculateTotalSalonServiceRevenue(year, month) {
  const daysInMonth = getDaysInMonth(year, month);
  let grandTotal = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayRecords = attendanceData[dayStr];
    if (dayRecords) {
      staffList.forEach(s => {
        if (dayRecords[s.id] && dayRecords[s.id].servicesDone) {
          grandTotal += Number(dayRecords[s.id].servicesDone);
        }
      });
    }
  }
  return grandTotal;
}

// ==========================================
// 4. VIEW ROUTING & NAVIGATION
// ==========================================

function navigateTo(viewName) {
  if (viewName === 'admin') {
    window.location.hash = 'admin';
  } else {
    window.location.hash = viewName;
  }
  updateViewFromHash();
}

function updateViewFromHash() {
  const hash = window.location.hash.replace('#', '') || 'attendance';
  const views = ['attendance', 'payroll', 'incentives', 'roster', 'admin'];

  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const navBtn = document.getElementById(`navBtn-${v}`);
    const mobBtn = document.getElementById(`mobileNav-${v}`);

    if (v === hash) {
      if (el) el.classList.remove('hidden');
      if (navBtn) {
        navBtn.classList.add('active');
        navBtn.classList.remove('text-gray-400');
        navBtn.classList.add('text-white');
      }
      if (mobBtn) {
        mobBtn.classList.add('text-[#ff2a85]', 'bg-[#ff2a85]/15');
        mobBtn.classList.remove('text-gray-400');
      }
    } else {
      if (el) el.classList.add('hidden');
      if (navBtn) {
        navBtn.classList.remove('active', 'text-white');
        navBtn.classList.add('text-gray-400');
      }
      if (mobBtn) {
        mobBtn.classList.remove('text-[#ff2a85]', 'bg-[#ff2a85]/15');
        mobBtn.classList.add('text-gray-400');
      }
    }
  });

  if (hash === 'attendance') renderDailyAttendance();
  if (hash === 'payroll') renderMonthlyPayroll();
  if (hash === 'incentives') renderIncentivesView();
  if (hash === 'roster') renderRosterView();
  if (hash === 'admin') renderAdminView();
}

// ==========================================
// 5. VIEW 1: DAILY ATTENDANCE (TWO-TIER NO OVERFLOW)
// ==========================================

function renderDailyAttendance() {
  const container = document.getElementById('staffAttendanceContainer');
  if (!container) return;

  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) {
    attendanceData[dateKey] = {};
  }

  let presentCount = 0;
  let weeklyOffCount = 0;
  let leaveCount = 0;
  let dailyOtHoursTotal = 0;
  let dailyOtPayTotal = 0;
  let dailyServicesTotal = 0;
  let dailyProductsTotal = 0;

  let html = '';

  staffList.forEach((staff) => {
    if (!attendanceData[dateKey][staff.id]) {
      const isHk = !!staff.isHousekeeping;
      attendanceData[dateKey][staff.id] = {
        status: 'Present',
        inH: isHk ? 9 : 10,
        inM: 0,
        inAmpm: 'AM',
        outH: isHk ? 9 : 7,
        outM: 0,
        workedMinutes: isHk ? 720 : 540,
        otHours: 0,
        shortfallHours: 0,
        otPay: 0,
        servicesDone: 0,
        productsSold: 0
      };
    }

    const record = attendanceData[dateKey][staff.id];
    record.inH = record.inH || (staff.isHousekeeping ? 9 : 10);
    record.inM = record.inM !== undefined ? record.inM : 0;
    record.inAmpm = record.inAmpm || 'AM';
    record.outH = record.outH || (staff.isHousekeeping ? 9 : 7);
    record.outM = record.outM !== undefined ? record.outM : 0;
    record.outAmpm = record.outAmpm || 'PM';

    const shiftCalc = calculateShiftHoursParsed(record.inH, record.inM, record.inAmpm, record.outH, record.outM, record.outAmpm, staff.isHousekeeping);

    if (record.status === 'Present') {
      record.workedMinutes = shiftCalc.workedMinutes;
      // If user hasn't explicitly customized otHours manually, use auto shiftCalc; otherwise keep manual otHours
      if (record.isOtManual !== true) {
        record.otHours = shiftCalc.otHours;
        record.otPay = shiftCalc.otPay;
      } else {
        record.otPay = Math.round((record.otHours || 0) * (salonRules.otHourlyRate || 50));
      }
      record.shortfallHours = shiftCalc.shortfallHours;
      presentCount++;
      dailyOtHoursTotal += Number(record.otHours || 0);
      dailyOtPayTotal += Number(record.otPay || 0);
      dailyServicesTotal += Number(record.servicesDone || 0);
      dailyProductsTotal += Number(record.productsSold || 0);
    } else if (record.status === 'Weekly Off') {
      weeklyOffCount++;
    } else if (record.status === 'Leave' || record.status === 'Absent') {
      leaveCount++;
    }

    const isPresent = record.status === 'Present';
    const isOff = record.status === 'Weekly Off';
    const isLeave = record.status === 'Leave' || record.status === 'Absent';

    // Robust Two-Tier Layout:
    // Top Row: Avatar, Name, Salary, and Status buttons.
    // Bottom Row: Check In, Check Out (with +/- Steppers & Quick Shifts), Duration/OT, and Sales Inputs.
    html += `
      <div class="staff-card bg-[#0d0d15] p-5 sm:p-6 rounded-3xl border border-[#1f1f30] shadow-xl transition-all space-y-4">
        
        <!-- TIER 1: Identity & Attendance Status Buttons -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#181826] pb-3.5">
          <!-- Staff Identity -->
          <div class="flex items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1a0d1e] to-[#26102a] border border-[#ff2a85]/40 flex items-center justify-center font-syne font-bold text-lg text-[#ff7eb3] shadow-md shadow-[#ff2a85]/15">
              ${staff.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-syne font-bold text-white text-base">${staff.name}</h3>
                ${staff.isManager ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-[#ff2a85]/20 text-[#ff7eb3] font-bold border border-[#ff2a85]/30">MANAGER</span>' : ''}
                ${staff.foodAllowance > 0 ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">+₹1500 FOOD</span>' : ''}
              </div>
              <div class="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <span>${staff.role}</span>
                <span class="text-gray-600">•</span>
                <span class="font-mono text-gray-300">Base: ₹${staff.baseSalary.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <!-- Tactile Status Buttons (NO HALF DAY) -->
          <div class="flex items-center gap-2 bg-[#08080f] p-1.5 rounded-2xl border border-[#1c1c2c] self-start md:self-auto">
            <button type="button" onclick="setAttendancePill('${staff.id}', 'Present')" 
              class="status-pill px-4 py-2 rounded-xl text-xs font-bold border ${isPresent ? 'active-present' : 'border-transparent text-gray-400 hover:text-white'}">
              🟢 Present
            </button>
            <button type="button" onclick="setAttendancePill('${staff.id}', 'Weekly Off')" 
              class="status-pill px-4 py-2 rounded-xl text-xs font-bold border ${isOff ? 'active-off' : 'border-transparent text-gray-400 hover:text-white'}">
              ☕ Weekly Off
            </button>
            <button type="button" onclick="setAttendancePill('${staff.id}', 'Leave')" 
              class="status-pill px-4 py-2 rounded-xl text-xs font-bold border ${isLeave ? 'active-leave' : 'border-transparent text-gray-400 hover:text-white'}">
              ❌ Leave (Cut)
            </button>
          </div>
        </div>

        <!-- TIER 2: Time Pickers, OT / Shortfall Feedback, and Sales Inputs (Never overflows) -->
        ${staff.isHousekeeping ? `
        <div class="flex flex-wrap items-center justify-between gap-4 pt-1 bg-[#090912] p-3.5 rounded-2xl border border-[#1b1b2a]">
          <div class="flex items-center gap-3">
            <span class="px-3.5 py-1.5 rounded-xl bg-purple-500/15 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-2 text-xs font-mono">
              <i class="fa-solid fa-clock-rotate-left text-xs"></i>
              Fixed Daily Schedule: 9:00 AM – 9:00 PM (12 Hours)
            </span>
            <span class="text-xs text-gray-300 font-medium">
              ${isPresent ? '🟢 Working Standard 12h' : (isOff ? '☕ Weekly Off (Sundays)' : '❌ Full Day Leave (Salary Cut)')}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-gray-400">
            <i class="fa-solid fa-broom text-[#ff7eb3]"></i>
            <span>House Keeping Staff • ₹${staff.baseSalary.toLocaleString('en-IN')}/mo • Excluded from Roster Scanner</span>
          </div>
        </div>
        ` : `
        <div class="flex flex-wrap items-center justify-between gap-4 pt-1">
          
          <!-- Left: Check In & Check Out Controls -->
          <div class="flex flex-wrap items-center gap-3 ${isPresent ? '' : 'opacity-25 pointer-events-none'}">
            
            <!-- Check-In -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Check In</span>
              <div class="flex items-center bg-[#08080f] border border-[#202032] rounded-2xl p-1.5 gap-1 focus-within:border-[#ff2a85]">
                <input type="number" min="1" max="12" value="${record.inH}" 
                  onfocus="this.select()" onclick="this.select()"
                  oninput="if(parseInt(this.value, 10) === 12) updateTimeDigit('${staff.id}', 'inH', 12)"
                  onchange="updateTimeDigit('${staff.id}', 'inH', this.value)"
                  class="w-9 text-center bg-[#131320] rounded-xl text-white font-mono font-bold text-xs py-1.5 focus:outline-none" title="Hour (1-12)">
                <span class="text-gray-500 font-bold">:</span>
                <input type="number" min="0" max="59" step="5" value="${record.inM < 10 ? '0' + record.inM : record.inM}" 
                  onfocus="this.select()" onclick="this.select()"
                  onchange="updateTimeDigit('${staff.id}', 'inM', this.value)"
                  class="w-10 text-center bg-[#131320] rounded-xl text-white font-mono font-bold text-xs py-1.5 focus:outline-none" title="Minute (00-59)">
                <button type="button" onclick="toggleAmPm('${staff.id}')" 
                  class="ampm-toggle px-2.5 py-1 rounded-xl text-[10px] font-bold ${record.inAmpm === 'AM' ? 'is-am' : 'is-pm'}">
                  ${record.inAmpm}
                </button>
              </div>
            </div>

            <!-- Check-Out (ALWAYS PM) -->
            <div class="flex flex-col gap-1">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                Check Out <span class="text-[#ff7eb3] text-[9px] font-extrabold">(PM ONLY)</span>
              </span>
              <div class="flex items-center bg-[#08080f] border border-[#202032] rounded-2xl p-1.5 gap-1 focus-within:border-[#ff2a85]">
                <input type="number" min="1" max="12" value="${record.outH}" 
                  onfocus="this.select()" onclick="this.select()"
                  onchange="updateTimeDigit('${staff.id}', 'outH', this.value)"
                  class="w-9 text-center bg-[#131320] rounded-xl text-white font-mono font-bold text-xs py-1.5 focus:outline-none" title="Hour (1-12)">
                <span class="text-gray-500 font-bold">:</span>
                <input type="number" min="0" max="59" step="5" value="${record.outM < 10 ? '0' + record.outM : record.outM}" 
                  onfocus="this.select()" onclick="this.select()"
                  onchange="updateTimeDigit('${staff.id}', 'outM', this.value)"
                  class="w-10 text-center bg-[#131320] rounded-xl text-white font-mono font-bold text-xs py-1.5 focus:outline-none" title="Minute (00-59)">
                <span class="px-2.5 py-1 rounded-xl text-[10px] font-extrabold bg-[#ff2a85] text-white shadow-md shadow-[#ff2a85]/30 select-none">
                  PM
                </span>
              </div>
            </div>

          </div>

          <!-- Middle: Shift Duration & Overtime / Shortfall Controls (Directly Editable OT Hours!) -->
          <div class="bg-[#08080f] px-3.5 py-2.5 rounded-2xl border border-[#1e1e2e] text-xs">
            <div class="flex items-center gap-3">
              <div>
                <span class="text-gray-400 text-[10px] block uppercase font-bold">Worked Time</span>
                <span class="font-mono font-bold text-white text-sm">${isPresent ? shiftCalc.formattedDuration : '--'}</span>
              </div>
              <div class="border-l border-[#202032] pl-3">
                <span class="text-gray-400 text-[10px] block uppercase font-bold mb-1">
                  Overtime (Editable)
                </span>
                ${isPresent ? `
                  <div class="flex items-center gap-1.5">
                    <div class="flex items-center bg-[#131320] border border-[#282840] rounded-xl px-2 py-0.5 focus-within:border-[#ff2a85]">
                      <input type="number" min="0" max="15" step="0.5" 
                        value="${record.otHours || 0}" 
                        onfocus="this.select()" onclick="this.select()"
                        onchange="updateStaffOtHours('${staff.id}', this.value)"
                        class="w-10 text-center bg-transparent text-[#ff7eb3] font-mono font-extrabold text-xs py-0.5 focus:outline-none" title="Edit Overtime Hours">
                      <span class="text-[10px] font-bold text-gray-400 select-none">hrs</span>
                    </div>
                    ${(record.otHours || 0) > 0 ? 
                      `<span class="font-mono font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-xs">+₹${record.otPay || 0}</span>` : 
                      (shiftCalc.shortfallHours > 0 ? 
                        `<span class="font-mono font-bold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-lg text-[11px]">-${shiftCalc.shortfallHours}h Early Exit</span>` : 
                        `<span class="text-[11px] text-gray-500 font-mono">0 OT</span>`
                      )
                    }
                  </div>
                ` : `
                  <span class="text-xs text-gray-600 font-mono">--</span>
                `}
              </div>
            </div>
          </div>

          <!-- Right: Daily Services & Products Inputs (Fixed spacing, totally contained!) -->
          <div class="flex items-center gap-3 ${isPresent ? '' : 'opacity-35'}">
            <div>
              <label class="text-[10px] uppercase font-bold text-purple-400 block mb-1">Services (₹)</label>
              <input type="number" min="0" placeholder="0" value="${record.servicesDone || ''}" 
                onfocus="this.select()" onclick="this.select()"
                onchange="updateStaffSales('${staff.id}', 'servicesDone', this.value)"
                class="w-28 bg-[#08080f] border border-[#202032] text-white text-xs font-bold rounded-2xl px-3 py-2.5 focus:border-[#ff2a85]">
            </div>
            <div>
              <label class="text-[10px] uppercase font-bold text-pink-400 block mb-1">Products (₹)</label>
              <input type="number" min="0" placeholder="0" value="${record.productsSold || ''}" 
                onfocus="this.select()" onclick="this.select()"
                onchange="updateStaffSales('${staff.id}', 'productsSold', this.value)"
                class="w-28 bg-[#08080f] border border-[#202032] text-white text-xs font-bold rounded-2xl px-3 py-2.5 focus:border-[#ff2a85]">
            </div>
          </div>

        </div>
        `}

      </div>
    `;
  });

  container.innerHTML = html;

  document.getElementById('kpiPresentCount').innerText = presentCount;
  document.getElementById('kpiWeeklyOffCount').innerText = weeklyOffCount;
  document.getElementById('kpiLeaveCount').innerText = leaveCount;
  document.getElementById('kpiOvertimePay').innerText = `₹${dailyOtPayTotal.toLocaleString('en-IN')}`;
  document.getElementById('kpiOvertimeHours').innerText = `${dailyOtHoursTotal} hrs logged`;
  document.getElementById('kpiServicesTotal').innerText = `₹${dailyServicesTotal.toLocaleString('en-IN')}`;
  document.getElementById('kpiProductsTotal').innerText = `₹${dailyProductsTotal.toLocaleString('en-IN')}`;

  saveAttendanceData();
}

function setAttendancePill(staffId, newStatus) {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][staffId]) attendanceData[dateKey][staffId] = {};

  attendanceData[dateKey][staffId].status = newStatus;
  saveAttendanceData();
  renderDailyAttendance();
  showToast(`${getStaffName(staffId)} set to ${newStatus}`);
}

function updateTimeDigit(staffId, field, val) {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][staffId]) {
    attendanceData[dateKey][staffId] = { status: 'Present', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
  }

  const intVal = parseInt(val, 10) || 0;
  attendanceData[dateKey][staffId][field] = intVal;

  // Whenever user enters 12 in the check-in slot, automatically set to PM!
  if (field === 'inH') {
    if (intVal === 12 || intVal === 1 || intVal === 2 || intVal === 3) {
      attendanceData[dateKey][staffId].inAmpm = 'PM';
    } else if (intVal >= 7 && intVal <= 11) {
      attendanceData[dateKey][staffId].inAmpm = 'AM';
    }
    attendanceData[dateKey][staffId].isOtManual = false;
  }
  if (field === 'outH' || field === 'inM' || field === 'outM') {
    attendanceData[dateKey][staffId].isOtManual = false;
  }

  saveAttendanceData();
  renderDailyAttendance();
}

function updateStaffOtHours(staffId, val) {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][staffId]) {
    attendanceData[dateKey][staffId] = { status: 'Present', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
  }

  const otVal = Math.max(0, parseFloat(val) || 0);
  const otRate = salonRules.otHourlyRate || 50;
  attendanceData[dateKey][staffId].otHours = otVal;
  attendanceData[dateKey][staffId].otPay = Math.round(otVal * otRate);
  attendanceData[dateKey][staffId].isOtManual = true;

  saveAttendanceData();
  renderDailyAttendance();
  showToast(`${getStaffName(staffId)} OT set to ${otVal} hrs (+₹${attendanceData[dateKey][staffId].otPay})`);
}

function toggleAmPm(staffId) {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][staffId]) {
    attendanceData[dateKey][staffId] = { status: 'Present', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
  }

  const current = attendanceData[dateKey][staffId].inAmpm || 'AM';
  attendanceData[dateKey][staffId].inAmpm = (current === 'AM' ? 'PM' : 'AM');
  saveAttendanceData();
  renderDailyAttendance();
  showToast(`Check-in changed to ${attendanceData[dateKey][staffId].inAmpm}`);
}

function updateStaffSales(staffId, field, value) {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};
  if (!attendanceData[dateKey][staffId]) attendanceData[dateKey][staffId] = {};

  attendanceData[dateKey][staffId][field] = parseFloat(value) || 0;
  saveAttendanceData();
  renderDailyAttendance();
}

function bulkMarkAllPresent() {
  const dateKey = selectedDateStr;
  if (!attendanceData[dateKey]) attendanceData[dateKey] = {};

  staffList.forEach(s => {
    attendanceData[dateKey][s.id] = {
      status: 'Present',
      inH: 10, inM: 0, inAmpm: 'AM',
      outH: 7, outM: 0,
      workedMinutes: 540,
      otHours: 0,
      shortfallHours: 0,
      otPay: 0,
      servicesDone: attendanceData[dateKey][s.id]?.servicesDone || 0,
      productsSold: attendanceData[dateKey][s.id]?.productsSold || 0
    };
  });

  saveAttendanceData();
  renderDailyAttendance();
  showToast('All 8 staff marked Present with standard 9h shift (10:00 AM - 7:00 PM)!');
}

function onDateChanged() {
  const input = document.getElementById('selectedDateInput');
  if (input && input.value) {
    selectedDateStr = input.value;
    renderDailyAttendance();
  }
}

function shiftDate(deltaDays) {
  const [y, m, d] = selectedDateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + deltaDays);
  selectedDateStr = formatDateKey(dateObj);
  
  const input = document.getElementById('selectedDateInput');
  if (input) input.value = selectedDateStr;
  renderDailyAttendance();
}

function setTodayDate() {
  currentDate = new Date();
  selectedDateStr = formatDateKey(currentDate);
  const input = document.getElementById('selectedDateInput');
  if (input) input.value = selectedDateStr;
  renderDailyAttendance();
}

// ==========================================
// 6. VIEW 2: MONTHLY PAYROLL (PURE NUMBER IN LEAVES CUT)
// ==========================================

function renderMonthlyPayroll() {
  const tableBody = document.getElementById('payrollTableBody');
  const tableFoot = document.getElementById('payrollTableFoot');
  if (!tableBody || !tableFoot) return;

  const [yearStr, monthStr] = selectedMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = getDaysInMonth(year, month);

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  document.getElementById('payrollMonthBadge').innerText = monthName;

  let totalGrossBase = 0;
  let totalFoodAllowances = 0;
  let totalDeductions = 0;
  let totalNetOtPay = 0;
  let totalIncentives = 0;
  let totalNetPayout = 0;

  let rowsHtml = '';

  staffList.forEach((staff) => {
    const p = calculateStaffMonthPayroll(staff, year, month);

    totalGrossBase += staff.baseSalary;
    totalFoodAllowances += p.foodAllowance;
    totalDeductions += p.leaveDeduction;
    totalNetOtPay += p.netOtPay;
    totalIncentives += p.totalIncentives;
    totalNetPayout += p.netPayable;

    rowsHtml += `
      <tr class="hover:bg-[#12121e] transition-colors border-b border-[#181826]">
        <td class="py-4 px-4">
          <div class="flex items-center gap-2">
            <span class="font-syne font-bold text-white text-sm">${staff.name}</span>
            ${staff.isManager ? '<span class="text-[9px] px-2 py-0.5 rounded-full bg-[#ff2a85]/20 text-[#ff7eb3] font-bold">MANAGER</span>' : ''}
          </div>
          <div class="text-[11px] text-gray-400">${staff.role}</div>
        </td>

        <td class="py-4 px-3 font-mono font-semibold text-white">
          ₹${staff.baseSalary.toLocaleString('en-IN')}
        </td>

        <td class="py-4 px-3 font-mono">
          ${staff.foodAllowance > 0 ? 
            `<span class="text-emerald-400 font-semibold">+₹${staff.foodAllowance.toLocaleString('en-IN')}</span>` : 
            `<span class="text-gray-600">₹0</span>`
          }
        </td>

        <td class="py-4 px-3 font-mono text-gray-300">
          <div>₹${p.perDaySalary.toFixed(2)}</div>
          <span class="text-[10px] text-gray-500 font-sans">÷ ${daysInMonth}d</span>
        </td>

        <td class="py-4 px-3 text-center">
          <div class="inline-flex items-center gap-1.5 font-mono text-xs">
            <span class="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold">${p.presentDays}P</span>
            <span class="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 font-bold">${p.weeklyOffs}WO</span>
          </div>
        </td>

        <!-- STRICTLY PURE NUMBER IN LEAVES CUT: NO "Days" TEXT! -->
        <td class="py-4 px-3 text-center whitespace-nowrap">
          ${p.unpaidLeaves > 0 ? 
            `<span class="inline-block px-3 py-1 rounded-xl bg-rose-500/20 text-rose-400 font-mono font-extrabold text-xs">${p.unpaidLeaves}</span>` : 
            `<span class="text-gray-600 font-mono text-xs">0</span>`
          }
        </td>

        <td class="py-4 px-3 font-mono">
          ${p.leaveDeduction > 0 ? 
            `<span class="text-rose-400 font-bold">-₹${Math.round(p.leaveDeduction).toLocaleString('en-IN')}</span>` : 
            `<span class="text-gray-600">₹0</span>`
          }
        </td>

        <td class="py-4 px-3 font-mono text-center">
          ${staff.isHousekeeping ? 
            `<span class="text-gray-600">0h</span>` : 
            `<span class="text-white font-bold">${p.netOtHours}h</span>
             ${p.totalShortfallHours > 0 ? `<span class="text-[10px] text-amber-400 block font-sans">-${p.totalShortfallHours}h cut</span>` : ''}`
          }
        </td>

        <td class="py-4 px-3 font-mono">
          ${p.netOtPay > 0 ? 
            `<span class="text-[#ff7eb3] font-bold">+₹${p.netOtPay.toLocaleString('en-IN')}</span>` : 
            `<span class="text-gray-600">₹0</span>`
          }
        </td>

        <td class="py-4 px-3 font-mono">
          ${p.totalIncentives > 0 ? 
            `<span class="text-purple-400 font-bold">+₹${p.totalIncentives.toLocaleString('en-IN')}</span>
             <span class="text-[10px] text-gray-500 block">${p.serviceCommission > 0 ? 'Serv%' : ''} ${p.productCommission > 0 ? 'Prod%' : ''}</span>` : 
            `<span class="text-gray-600">₹0</span>`
          }
        </td>

        <td class="py-4 px-4 font-mono font-extrabold text-base text-[#ff2a85]">
          ₹${p.netPayable.toLocaleString('en-IN')}
        </td>

        <td class="py-4 px-4 text-center">
          <button onclick="openPaySlipModal('${staff.id}')" 
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#141420] hover:bg-[#ff2a85] text-gray-300 hover:text-white transition-all border border-[#222234] hover:border-[#ff2a85] flex items-center justify-center gap-1.5 mx-auto shadow-sm">
            <i class="fa-solid fa-receipt text-[11px]"></i>
            <span>Slip</span>
          </button>
        </td>
      </tr>
    `;
  });

  tableBody.innerHTML = rowsHtml;

  tableFoot.innerHTML = `
    <tr>
      <td class="py-4 px-4 uppercase text-xs tracking-wider text-gray-300">Total Salon Payroll</td>
      <td class="py-4 px-3 font-mono text-white">₹${totalGrossBase.toLocaleString('en-IN')}</td>
      <td class="py-4 px-3 font-mono text-emerald-400">+₹${totalFoodAllowances.toLocaleString('en-IN')}</td>
      <td class="py-4 px-3 text-gray-500 text-[11px] font-sans">÷ ${daysInMonth}d</td>
      <td class="py-4 px-3 text-center text-gray-400">--</td>
      <td class="py-4 px-3 text-center text-gray-400">--</td>
      <td class="py-4 px-3 font-mono text-rose-400">-₹${Math.round(totalDeductions).toLocaleString('en-IN')}</td>
      <td class="py-4 px-3 text-center text-gray-400">--</td>
      <td class="py-4 px-3 font-mono text-[#ff7eb3]">+₹${totalNetOtPay.toLocaleString('en-IN')}</td>
      <td class="py-4 px-3 font-mono text-purple-400">+₹${totalIncentives.toLocaleString('en-IN')}</td>
      <td class="py-4 px-4 font-mono font-extrabold text-lg text-[#ff2a85]">₹${totalNetPayout.toLocaleString('en-IN')}</td>
      <td class="py-4 px-4 text-center">--</td>
    </tr>
  `;

  document.getElementById('summaryGrossBase').innerText = `₹${(totalGrossBase + totalFoodAllowances).toLocaleString('en-IN')}`;
  document.getElementById('summaryDeductions').innerText = `-₹${Math.round(totalDeductions).toLocaleString('en-IN')}`;
  document.getElementById('summaryAdditions').innerText = `+₹${(totalNetOtPay + totalIncentives).toLocaleString('en-IN')}`;
  document.getElementById('summaryNetPayout').innerText = `₹${totalNetPayout.toLocaleString('en-IN')}`;
}

function onPayrollMonthChanged() {
  const input = document.getElementById('selectedMonthInput');
  if (input && input.value) {
    selectedMonthStr = input.value;
    renderMonthlyPayroll();
  }
}

function exportPayrollCSV() {
  const [yearStr, monthStr] = selectedMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = getDaysInMonth(year, month);

  let csvContent = 'Staff Name,Role,Base Salary,Food Allowance,Per Day Rate,Present Days,Weekly Offs,Leaves,Leave Deduction,Net OT Hours,OT Pay,Services Done,Products Sold,Incentives,Net Payable Salary\n';

  staffList.forEach(staff => {
    const p = calculateStaffMonthPayroll(staff, year, month);
    csvContent += `"${staff.name}","${staff.role}",${staff.baseSalary},${p.foodAllowance},${p.perDaySalary.toFixed(2)},${p.presentDays},${p.weeklyOffs},${p.unpaidLeaves},${Math.round(p.leaveDeduction)},${p.netOtHours},${p.netOtPay},${p.totalServicesDone},${p.totalProductsSold},${p.totalIncentives},${p.netPayable}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Green_Trends_Kothapet_Payroll_${selectedMonthStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported payroll CSV for ${selectedMonthStr}`);
}

// ==========================================
// 7. VIEW 3: INCENTIVE TRACKER (PERCENTAGES)
// ==========================================

function renderIncentivesView() {
  const container = document.getElementById('incentivesProgressContainer');
  const summaryBox = document.getElementById('incentivesSummaryHighlights');
  if (!container) return;

  const [yearStr, monthStr] = selectedMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // 1. Calculate overall salon statistics for this month
  const totalSalonRev = calculateTotalSalonServiceRevenue(year, month);
  const salonTarget = salonRules.salonMonthlyServiceTarget || 600000;
  const managerRate = salonRules.managerCommissionRate || 1;
  const managerAchieved = totalSalonRev >= salonTarget;
  const managerCommissionEarned = managerAchieved ? Math.round(totalSalonRev * (managerRate / 100)) : 0;

  let totalStylistCommissions = 0;
  let activeCommissionEarners = 0;
  let topServiceStylist = { name: 'None', amount: 0, commission: 0 };
  let topProductStylist = { name: 'None', amount: 0, commission: 0 };

  staffList.forEach(staff => {
    if (staff.isManager || staff.isHousekeeping) return;
    const p = calculateStaffMonthPayroll(staff, year, month);
    totalStylistCommissions += p.totalIncentives;
    if (p.totalIncentives > 0) activeCommissionEarners++;

    if (p.totalServicesDone > topServiceStylist.amount) {
      topServiceStylist = { name: staff.name, amount: p.totalServicesDone, commission: p.serviceCommission };
    }
    if (p.totalProductsSold > topProductStylist.amount) {
      topProductStylist = { name: staff.name, amount: p.totalProductsSold, commission: p.productCommission };
    }
  });

  // Render Top Highlights Summary Cards
  if (summaryBox) {
    const targetPct = Math.min(100, Math.round((totalSalonRev / salonTarget) * 100));
    summaryBox.innerHTML = `
      <!-- Card 1: Salon Target & Kalyan Manager 1% -->
      <div class="bg-[#0e0e18] p-4 rounded-2xl border border-[#232338] shadow-lg relative overflow-hidden">
        <div class="flex items-center justify-between text-xs text-gray-400 font-semibold">
          <span>Salon Target (Kalyan 1%)</span>
          <span class="px-2 py-0.5 rounded-full ${managerAchieved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-300'} font-bold font-mono text-[10px]">
            ${targetPct}%
          </span>
        </div>
        <div class="mt-2">
          <div class="flex items-baseline justify-between">
            <span class="text-xl font-black font-heading text-white">₹${totalSalonRev.toLocaleString('en-IN')}</span>
            <span class="text-[10px] text-gray-500 font-mono">/ ₹${salonTarget.toLocaleString('en-IN')}</span>
          </div>
          <div class="w-full bg-[#161628] h-1.5 rounded-full overflow-hidden mt-2">
            <div class="h-full ${managerAchieved ? 'bg-gradient-to-r from-purple-500 to-emerald-400' : 'bg-[#ff2a85]'} transition-all" style="width: ${targetPct}%"></div>
          </div>
          <span class="text-[10px] mt-1.5 block ${managerAchieved ? 'text-emerald-400 font-bold' : 'text-gray-400'}">
            ${managerAchieved ? `✓ Target Met! Kalyan 1% = +₹${managerCommissionEarned.toLocaleString('en-IN')}` : `₹${Math.max(0, salonTarget - totalSalonRev).toLocaleString('en-IN')} left to unlock 1%`}
          </span>
        </div>
      </div>

      <!-- Card 2: Total Stylist Commission Pool -->
      <div class="bg-[#0e0e18] p-4 rounded-2xl border border-[#232338] shadow-lg">
        <div class="flex items-center justify-between text-xs text-gray-400 font-semibold">
          <span>Total Commission Pool</span>
          <i class="fa-solid fa-coins text-[#ff7eb3] text-xs"></i>
        </div>
        <div class="mt-2">
          <span class="text-xl font-black font-heading text-[#ff7eb3]">₹${totalStylistCommissions.toLocaleString('en-IN')}</span>
          <span class="text-[10px] text-gray-400 block mt-1">
            ${activeCommissionEarners} of ${staffList.filter(s => !s.isManager && !s.isHousekeeping).length} stylists earned incentives
          </span>
        </div>
      </div>

      <!-- Card 3: Top Service Performer -->
      <div class="bg-[#0e0e18] p-4 rounded-2xl border border-[#232338] shadow-lg">
        <div class="flex items-center justify-between text-xs text-gray-400 font-semibold">
          <span>Top Service Performer</span>
          <i class="fa-solid fa-trophy text-amber-400 text-xs"></i>
        </div>
        <div class="mt-2">
          <div class="flex items-center justify-between">
            <span class="text-base font-bold font-heading text-white truncate">${topServiceStylist.name}</span>
            <span class="text-xs font-mono font-bold text-purple-400">₹${topServiceStylist.amount.toLocaleString('en-IN')}</span>
          </div>
          <span class="text-[10px] text-emerald-400 font-bold block mt-1">
            ${topServiceStylist.commission > 0 ? `+₹${topServiceStylist.commission.toLocaleString('en-IN')} commission (5%)` : 'Target in progress'}
          </span>
        </div>
      </div>

      <!-- Card 4: Top Product Seller -->
      <div class="bg-[#0e0e18] p-4 rounded-2xl border border-[#232338] shadow-lg">
        <div class="flex items-center justify-between text-xs text-gray-400 font-semibold">
          <span>Top Product Retailer</span>
          <i class="fa-solid fa-bottle-droplet text-pink-400 text-xs"></i>
        </div>
        <div class="mt-2">
          <div class="flex items-center justify-between">
            <span class="text-base font-bold font-heading text-white truncate">${topProductStylist.name}</span>
            <span class="text-xs font-mono font-bold text-pink-400">₹${topProductStylist.amount.toLocaleString('en-IN')}</span>
          </div>
          <span class="text-[10px] text-[#ff7eb3] font-bold block mt-1">
            ${topProductStylist.commission > 0 ? `+₹${topProductStylist.commission.toLocaleString('en-IN')} commission` : 'Below min tier'}
          </span>
        </div>
      </div>
    `;
  }

  // Render Individual Staff Progress Cards
  let html = '';

  staffList.forEach(staff => {
    const p = calculateStaffMonthPayroll(staff, year, month);

    if (staff.isManager) {
      const targetPercent = Math.min(100, Math.round((totalSalonRev / salonTarget) * 100));
      const achieved = totalSalonRev >= salonTarget;

      html += `
        <div class="bg-[#0d0d15] p-6 rounded-3xl border border-[#1f1f30] shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#181826] pb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1f1024] to-[#2a102e] border border-[#ff2a85]/30 flex items-center justify-center font-bold text-white text-sm">
                KY
              </div>
              <div>
                <h3 class="font-heading font-bold text-white text-base">${staff.name}</h3>
                <p class="text-xs text-gray-400">Salon Manager (${salonRules.managerCommissionRate || 1}% Total Salon Revenue)</p>
              </div>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Commission Earned</span>
              <span class="font-heading font-bold text-lg ${p.serviceCommission > 0 ? 'text-[#ff7eb3]' : 'text-gray-500'}">
                +₹${p.serviceCommission.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
          
          <div class="space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-gray-300">
                Salon Service Revenue: <strong class="text-white font-mono">₹${totalSalonRev.toLocaleString('en-IN')}</strong> / ₹${salonTarget.toLocaleString('en-IN')}
              </span>
              ${achieved ? 
                `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">Target Reached (${salonRules.managerCommissionRate || 1}% = ₹${p.serviceCommission})</span>` : 
                `<span class="text-gray-400 font-mono text-[10px]">${targetPercent}%</span>`
              }
            </div>
            <div class="w-full bg-[#131320] h-2.5 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500 ${achieved ? 'bg-gradient-to-r from-purple-500 to-emerald-400' : 'bg-purple-500'}" style="width: ${targetPercent}%"></div>
            </div>
            <p class="text-[10px] text-gray-500 italic mt-1">* Kalyan receives ${salonRules.managerCommissionRate || 1}% on total salon service revenue only; no product commission.</p>
          </div>
        </div>
      `;
      return;
    }

    if (staff.isHousekeeping) {
      html += `
        <div class="bg-[#0d0d15] p-6 rounded-3xl border border-[#1f1f30] shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-[#181826] pb-3">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-[#141420] border border-[#222234] flex items-center justify-center font-bold text-white text-sm">
                AN
              </div>
              <div>
                <h3 class="font-heading font-bold text-white text-base">${staff.name}</h3>
                <p class="text-xs text-gray-400">House Keeping</p>
              </div>
            </div>
            <span class="px-3 py-1 rounded-full bg-[#181826] text-gray-400 font-bold text-xs">
              FIXED SALARY
            </span>
          </div>
          <p class="text-xs text-gray-400 text-center py-2">House Keeping has no incentive targets or overtime.</p>
        </div>
      `;
      return;
    }

    const servTarget = staff.serviceTarget || (staff.baseSalary * 5);
    const servPercent = Math.min(100, Math.round((p.totalServicesDone / servTarget) * 100));
    const servAchieved = p.totalServicesDone >= servTarget;
    const servRate = staff.serviceCommissionRate || 5;

    const t1Min = staff.productTier1Min || 8000;
    const t1Rate = staff.productTier1Rate || 5;
    const t2Min = staff.productTier2Min || 15000;
    const t2Rate = staff.productTier2Rate || 8;
    const prodTierLabel = `${t1Rate}% above ₹${t1Min.toLocaleString('en-IN')}, ${t2Rate}% above ₹${t2Min.toLocaleString('en-IN')}`;

    html += `
      <div class="bg-[#0d0d15] p-6 rounded-3xl border border-[#1f1f30] shadow-xl space-y-4">
        <div class="flex items-center justify-between border-b border-[#181826] pb-3">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ff2a85]/20 to-purple-500/20 border border-[#ff2a85]/30 flex items-center justify-center font-bold text-white text-sm">
              ${staff.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 class="font-heading font-bold text-white text-base">${staff.name}</h3>
              <p class="text-xs text-gray-400">${staff.role}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="text-[10px] text-gray-400 uppercase tracking-wider block">Commissions Earned</span>
            <span class="font-heading font-bold text-lg ${p.totalIncentives > 0 ? 'text-[#ff7eb3]' : 'text-gray-500'}">
              +₹${p.totalIncentives.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <!-- Services Commission on Target -->
        <div class="space-y-1.5 text-xs">
          <div class="flex items-center justify-between">
            <span class="text-gray-300">
              Services (${servRate}% on Target): <strong class="text-white font-mono">₹${p.totalServicesDone.toLocaleString('en-IN')}</strong> / ₹${servTarget.toLocaleString('en-IN')}
            </span>
            ${servAchieved ? 
              `<span class="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">${servRate}% Earned (+₹${p.serviceCommission.toLocaleString('en-IN')})</span>` : 
              `<span class="text-gray-400 font-mono text-[10px]">${servPercent}%</span>`
            }
          </div>
          <div class="w-full bg-[#131320] h-2.5 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-500 ${servAchieved ? 'bg-gradient-to-r from-purple-500 to-emerald-400' : 'bg-purple-500'}" style="width: ${servPercent}%"></div>
          </div>
        </div>

        <!-- Products Tiered Commission -->
        <div class="space-y-1.5 text-xs pt-2 border-t border-[#181826]">
          <div class="flex items-center justify-between">
            <span class="text-gray-300">
              Product Sales: <strong class="text-white font-mono">₹${p.totalProductsSold.toLocaleString('en-IN')}</strong>
            </span>
            ${p.productCommission > 0 ? 
              `<span class="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-400 font-bold text-[10px]">Commission: +₹${p.productCommission.toLocaleString('en-IN')}</span>` : 
              `<span class="text-gray-500 text-[10px] font-mono">Below ₹${t1Min.toLocaleString('en-IN')}</span>`
            }
          </div>
          <span class="text-[10px] text-gray-500 block">Rule: ${prodTierLabel}</span>
        </div>

        <!-- Quick Log Sales for This Staff Button -->
        <div class="pt-2 border-t border-[#181826] flex items-center justify-between">
          <span class="text-[10px] text-gray-500">Log daily billings for ${selectedDateStr}</span>
          <button type="button" onclick="openQuickSalesModal('${staff.id}')" 
            class="px-3 py-1.5 rounded-xl bg-[#171728] hover:bg-[#ff2a85]/20 text-gray-300 hover:text-[#ff7eb3] border border-[#2b2b40] hover:border-[#ff2a85]/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer">
            <i class="fa-solid fa-plus-circle text-[#ff2a85]"></i>
            <span>Log Daily Sales</span>
          </button>
        </div>

      </div>
    `;
  });

  container.innerHTML = html;
}

/**
 * Quick Modal/Prompt for logging daily service and product sales directly from the Incentive Tracker
 */
function openQuickSalesModal(staffId) {
  const staff = staffList.find(s => s.id === staffId);
  if (!staff) return;

  const currentRecord = attendanceData[selectedDateStr]?.[staffId] || { servicesDone: 0, productsSold: 0 };
  const currentServ = currentRecord.servicesDone || 0;
  const currentProd = currentRecord.productsSold || 0;

  const servPrompt = prompt(`Enter Service Revenue for ${staff.name} on ${selectedDateStr} (in ₹):\n(Currently: ₹${currentServ})`, currentServ);
  if (servPrompt === null) return;

  const prodPrompt = prompt(`Enter Retail Products Sold by ${staff.name} on ${selectedDateStr} (in ₹):\n(Currently: ₹${currentProd})`, currentProd);
  if (prodPrompt === null) return;

  const newServ = Math.max(0, parseFloat(servPrompt) || 0);
  const newProd = Math.max(0, parseFloat(prodPrompt) || 0);

  if (!attendanceData[selectedDateStr]) attendanceData[selectedDateStr] = {};
  if (!attendanceData[selectedDateStr][staffId]) {
    attendanceData[selectedDateStr][staffId] = {
      status: 'Present',
      inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0,
      workedMinutes: 540, otHours: 0, shortfallHours: 0, otPay: 0,
      servicesDone: newServ,
      productsSold: newProd
    };
  } else {
    attendanceData[selectedDateStr][staffId].servicesDone = newServ;
    attendanceData[selectedDateStr][staffId].productsSold = newProd;
  }

  saveAttendanceData();
  renderIncentivesView();
  renderDailyAttendance();
  showToast(`Updated ${staff.name}: Services ₹${newServ.toLocaleString('en-IN')}, Products ₹${newProd.toLocaleString('en-IN')}`);
}

// ==========================================
// 8. VIEW 4: SCHEDULE ROSTER IMAGE SCANNER (MULTI-IMAGE GALLERY & PRECISE PARSER)
// ==========================================

let rosterImages = [];

function renderRosterView() {
  const targetDateInput = document.getElementById('rosterTargetDate');
  if (targetDateInput && !targetDateInput.value) {
    targetDateInput.value = selectedDateStr;
  }
  renderRosterImageGallery();
  renderParsedRosterList();
}

/**
 * Handles multiple images chosen through the file picker
 */
function handleRosterMultipleImages(e) {
  const files = e.target.files;
  if (!files || files.length === 0) return;
  for (let i = 0; i < files.length; i++) {
    addRosterImageFile(files[i]);
  }
  e.target.value = '';
}

/**
 * Adds an individual file or blob to the rosterImages array and updates UI
 */
function addRosterImageFile(fileOrBlob) {
  const reader = new FileReader();
  reader.onload = function(evt) {
    const dataUrl = evt.target.result;
    rosterImages.push({
      id: 'img_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      dataUrl: dataUrl,
      name: fileOrBlob.name || `Photo ${rosterImages.length + 1}`
    });
    renderRosterImageGallery();
    showToast(`Added schedule image (${rosterImages.length} loaded)!`);
  };
  reader.readAsDataURL(fileOrBlob);
}

/**
 * Removes a photo from the roster scanner gallery
 */
function removeRosterImage(index) {
  if (index >= 0 && index < rosterImages.length) {
    rosterImages.splice(index, 1);
    renderRosterImageGallery();
    showToast('Removed photo from gallery.');
  }
}

/**
 * Clears all loaded roster photos
 */
function clearAllRosterImages() {
  rosterImages = [];
  parsedRosterBuffer = {};
  renderRosterImageGallery();
  renderParsedRosterList();
  showToast('Cleared all schedule photos.');
}

/**
 * Renders the multi-image thumbnail gallery, badge, and scan button state
 */
function renderRosterImageGallery() {
  const promptEl = document.getElementById('uploadPrompt');
  const galleryContainer = document.getElementById('rosterGalleryContainer');
  const galleryGrid = document.getElementById('rosterGalleryGrid');
  const badge = document.getElementById('rosterImageCountBadge');
  const clearBtn = document.getElementById('clearAllImagesBtn');
  const scanBtn = document.getElementById('scanRosterBtn');
  const scanBtnLabel = document.getElementById('scanBtnLabel');

  const count = rosterImages.length;
  if (badge) {
    badge.innerText = `${count} Pic${count === 1 ? '' : 's'}`;
  }

  if (count === 0) {
    if (promptEl) promptEl.classList.remove('hidden');
    if (galleryContainer) galleryContainer.classList.add('hidden');
    if (clearBtn) clearBtn.classList.add('hidden');
    if (scanBtn) {
      scanBtn.disabled = true;
      scanBtn.classList.add('opacity-50');
    }
    if (scanBtnLabel) scanBtnLabel.innerText = 'Scan Schedule Image with AI';
    return;
  }

  if (promptEl) promptEl.classList.add('hidden');
  if (galleryContainer) galleryContainer.classList.remove('hidden');
  if (clearBtn) clearBtn.classList.remove('hidden');
  if (scanBtn) {
    scanBtn.disabled = false;
    scanBtn.classList.remove('opacity-50');
  }
  if (scanBtnLabel) {
    scanBtnLabel.innerText = `Scan ${count} Schedule Photo${count === 1 ? '' : 's'} with AI`;
  }

  if (galleryGrid) {
    galleryGrid.innerHTML = rosterImages.map((img, idx) => `
      <div class="relative group rounded-2xl overflow-hidden border border-[#2d2d46] bg-[#0c0c16] aspect-[4/3] flex items-center justify-center shadow-md">
        <img src="${img.dataUrl}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button type="button" onclick="removeRosterImage(${idx})" class="p-2 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white text-xs shadow-lg transition-all" title="Remove Photo">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <span class="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[10px] font-bold font-mono border border-white/20">
          #${idx + 1}
        </span>
      </div>
    `).join('');
  }
}

/**
 * Handles pasting image from clipboard (supports multiple pastes)
 */
async function pasteImageFromClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.read) {
      const items = await navigator.clipboard.read();
      let found = false;
      for (const item of items) {
        const imageType = item.types.find(type => type.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          addRosterImageFile(blob);
          found = true;
        }
      }
      if (found) {
        showToast('Image pasted! You can paste more pics or click Scan.');
        return;
      }
      showToast('No image in clipboard. Copy a screenshot or press Ctrl+V directly.');
    } else {
      showToast('Please press Ctrl + V directly anywhere on the page to paste.');
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
    showToast('Clipboard permission denied. Please press Ctrl + V directly to paste.');
  }
}

/**
 * Preprocesses low-resolution or compressed WhatsApp images:
 * Upscaling, Grayscale Rec.601, and Binarization thresholding (> 160)
 */
function preprocessImageSource(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const scale = 2.5;
        canvas.width = (img.naturalWidth || img.width || 400) * scale;
        canvas.height = (img.naturalHeight || img.height || 300) * scale;
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imgData.data;
        for (let i = 0; i < d.length; i += 4) {
          const avg = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
          const v = avg > 160 ? 255 : 0;
          d[i] = v;
          d[i + 1] = v;
          d[i + 2] = v;
        }
        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Canvas preprocess error:', err);
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/**
 * Sequential Multi-Image OCR Scanner with accurate overall progress tracking
 */
async function scanUploadedRoster() {
  if (!rosterImages || rosterImages.length === 0) {
    alert('Please paste (Ctrl+V) or upload at least one schedule image first.');
    return;
  }

  const pBox = document.getElementById('ocrProgressBox');
  const pBar = document.getElementById('ocrProgressBar');
  const pText = document.getElementById('ocrStatusText');
  const pPercent = document.getElementById('ocrPercent');
  const scanBtn = document.getElementById('scanRosterBtn');

  if (pBox) pBox.classList.remove('hidden');
  if (scanBtn) {
    scanBtn.disabled = true;
    scanBtn.classList.add('opacity-50');
  }

  if (typeof Tesseract === 'undefined') {
    if (pBox) pBox.classList.add('hidden');
    if (scanBtn) {
      scanBtn.disabled = false;
      scanBtn.classList.remove('opacity-50');
    }
    loadSampleUploadedRoster();
    return;
  }

  let aggregatedText = '';
  const totalImages = rosterImages.length;

  try {
    for (let i = 0; i < totalImages; i++) {
      const currentImg = rosterImages[i];
      if (pText) pText.innerText = `Enhancing & reading photo ${i + 1} of ${totalImages}...`;
      
      const cleanSource = await preprocessImageSource(currentImg.dataUrl);

      const result = await Tesseract.recognize(
        cleanSource,
        'eng',
        {
          logger: m => {
            if (m.status === 'recognizing text') {
              const currentImgPct = m.progress || 0;
              const overallPct = Math.round(((i + currentImgPct) / totalImages) * 100);
              if (pBar) pBar.style.width = overallPct + '%';
              if (pPercent) pPercent.innerText = overallPct + '%';
              if (pText) pText.innerText = `Reading photo ${i + 1} of ${totalImages} (${Math.round(currentImgPct * 100)}%)...`;
            }
          }
        }
      );

      aggregatedText += '\n' + (result.data?.text || '');
    }

    if (pBox) pBox.classList.add('hidden');
    if (scanBtn) {
      scanBtn.disabled = false;
      scanBtn.classList.remove('opacity-50');
    }

    parseRosterText(aggregatedText);
    const count = Object.keys(parsedRosterBuffer).length;
    showToast(`Scan complete! Identified ${count} staff schedules across ${totalImages} photos.`);
  } catch (err) {
    console.error('Multi-image OCR Error:', err);
    if (pBox) pBox.classList.add('hidden');
    if (scanBtn) {
      scanBtn.disabled = false;
      scanBtn.classList.remove('opacity-50');
    }
    if (aggregatedText.trim().length > 0) {
      parseRosterText(aggregatedText);
    } else {
      loadSampleUploadedRoster();
    }
  }
}

function loadSampleUploadedRoster() {
  const sampleOcrText = `DATE: 26-09-2026 SATURDAY
DAILY ROSTER
MALE STAFF
1 | SULEMAN | = 12:00 TO 9:00
2 | ISLAM | 9:00 TO 6:00
3 | IQRAM | LEAVE
FEMALE STAFF
1 | ARUNA | = 10:00 TO 7:00
2 | AFRIN | = 11:00 TO 8:00
3 | RESHMA | = 12:00 TO 9:00
NOTE: ANY LEAVE SAME DAY INFORMATION DOUBLE SALARY CUT`;

  parseRosterText(sampleOcrText);
  showToast('Loaded sample roster & verified schedule!');
}

/**
 * Strict Shift Extractor:
 * 1. WEEK OFF / DAY OFF: strictly mapped to 'Weekly Off' (entitled regular weekly off, ₹0 salary cut).
 *    Recognizes: DAY OFF, WEEK OFF, WEEKLY OFF, D.OFF, W.OFF, D/O, W/O, DO, WO, DAY-OFF, WEEK-OFF, OFF.
 * 2. LEAVE: strictly mapped to 'Leave' (unpaid leave, triggers daily salary deduction).
 *    Recognizes: LEAVE, EAVE, WEAVE, WEAV, LEAV, ABSENT, CASUAL LEAVE, SICK LEAVE, LV, LVE, CL, SL, PL, ABS.
 * 3. TIMINGS: 12:00 TO 9:00, 120070900, 900To600, 110070800, 1000T07:00, 10-7, etc.
 */
function extractShiftFromContext(line, nextLine = '', isManager = false) {
  const combined = (line + ' ' + (nextLine || '')).toUpperCase();

  // 1. Strict Week Off / Day Off Detection FIRST:
  const isWeekOff = 
    /\b(DAY\s*OFF|WEEK\s*OFF|WEEKLY\s*OFF|DAYOFF|WEEKOFF|D[.\s/_-]*OFF|W[.\s/_-]*OFF|DAY[._-]?OFF|WEEK[._-]?OFF|D\/O|W\/O|WK\s*OFF)\b/i.test(combined) ||
    /\b(DAY|WEEK|WEEKLY)[.\s/_-]*(?:OFF|QFF|CFF|UFF|0FF|EFF)\b/i.test(combined) ||
    /\b(DAY\s*QFF|WEEK\s*QFF|OFF\s*DAY)\b/i.test(combined) ||
    /(?:^|[\s|:=-])(?:DO|WO|D\.O|W\.O)(?:[\s|:=-]|$)/i.test(combined) ||
    (/(?:^|[\s|:=-])(OFF)(?:[\s|:=-]|$)/i.test(combined) && !combined.includes('COFFEE') && !combined.includes('OFFIC'));

  // 2. Strict Leave Detection (includes common OCR visual blur 'weave' / 'weav' for 'leave'):
  const isLeave = 
    /\b(LEAVE|EAVE|WEAVE|WEAV|LEAV|ABSENT|CASUAL\s*LEAVE|SICK\s*LEAVE|PAID\s*LEAVE|UNPAID\s*LEAVE)\b/i.test(combined) ||
    /(?:^|[\s|:=-])(?:WEAVE|WEAV|LEAVE|LEAV|EAVE|LV|LVE|CL|SL|PL|ABS)(?:[\s|:=-]|$)/i.test(combined);

  if (isWeekOff) {
    return { status: 'Weekly Off', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
  }
  if (isLeave) {
    return { status: 'Leave', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
  }

  // 3. High-precision Shift / Time Pattern Matching:
  // Handles:
  // - "12:00 TO 9:00", "10:00 TO 7:00", "9:00 TO 6:00", "11:00 TO 8:00"
  // - "1100710800" (OCR reads 11:00 TO 8:00 with TO as 710)
  // - "120010900" (OCR reads 12:00 TO 9:00 with TO as 10)
  // - "90070600" (OCR reads 9:00 TO 6:00 with TO as 70)
  // - "120070500" (OCR reads 12:00 TO 9:00 with 9 read as 5)
  // - "1000T07:00" (OCR reads 10:00 TO 7:00 with TO as T0)
  // - "10-7", "11-8", "12-9", "9-6"
  const shiftRegex = /(?:^|[^\d])(9|10|11|12)(?::|\.|00)?(\d{2})?\s*(?:TO|710|70|10|T0|T|UNTIL|-|[=\s])\s*([0-9]|1[0-2])(?::|\.|00)?(\d{2})?(?:[^\d]|$)/i;
  const match = combined.match(shiftRegex);
  if (match) {
    let inH = parseInt(match[1], 10);
    let inM = (match[2] && match[2].length === 2 && parseInt(match[2], 10) < 60 && parseInt(match[2], 10) !== 0) ? parseInt(match[2], 10) : 0;
    let outH = parseInt(match[3], 10);
    let outM = (match[4] && match[4].length === 2 && parseInt(match[4], 10) < 60 && parseInt(match[4], 10) !== 0) ? parseInt(match[4], 10) : 0;

    // Automatic OCR misread correction for standard salon shifts:
    // (e.g. 9 misread as 3, 5, or 0; 8 as 3 or 0; 7 as 1 or 0; 6 as 0 or 5)
    if (inH === 12 && (outH === 3 || outH === 5 || outH === 0)) {
      outH = 9; // 12:00 to 9:00 PM closing shift
    } else if (inH === 11 && (outH === 3 || outH === 0)) {
      outH = 8; // 11:00 to 8:00 PM shift
    } else if (inH === 10 && (outH === 1 || outH === 0)) {
      outH = 7; // 10:00 to 7:00 PM shift
    } else if (inH === 9 && (outH === 0 || outH === 5)) {
      outH = 6; // 9:00 to 6:00 PM shift
    }

    let startAmpm = (inH === 12 || inH === 1 || inH === 2 || inH === 3) ? 'PM' : 'AM';

    return {
      status: 'Present',
      inH: inH,
      inM: inM,
      inAmpm: startAmpm,
      outH: outH,
      outM: outM
    };
  }

  // 4. Secondary fallback time regex for general time patterns like "10:30-19:30":
  const fallbackMatch = combined.match(/(\d{3,4}|\d{1,2}(?::\d{2})?)\s*(?:TO|70|10|T0|-|UNTIL)\s*(\d{3,4}|\d{1,2}(?::\d{2})?)/i);
  if (fallbackMatch) {
    function parseTimeVal(str) {
      if (str.includes(':')) {
        const parts = str.split(':');
        return { h: parseInt(parts[0], 10), m: parseInt(parts[1], 10) || 0 };
      }
      const val = parseInt(str, 10);
      if (val >= 100) {
        return { h: Math.floor(val / 100), m: val % 100 };
      }
      return { h: val, m: 0 };
    }

    const start = parseTimeVal(fallbackMatch[1]);
    const end = parseTimeVal(fallbackMatch[2]);
    let inH = start.h || 10;
    let outH = end.h || 7;
    if (inH === 0) inH = 12;
    if (outH === 0) outH = 12;

    if (inH === 12 && (outH === 3 || outH === 5 || outH === 0)) outH = 9;
    else if (inH === 11 && (outH === 3 || outH === 0)) outH = 8;
    else if (inH === 10 && (outH === 1 || outH === 0)) outH = 7;
    else if (inH === 9 && (outH === 0 || outH === 5)) outH = 6;

    let startAmpm = (inH === 12 || inH === 1 || inH === 2 || inH === 3) ? 'PM' : 'AM';

    return {
      status: 'Present',
      inH: inH,
      inM: start.m || 0,
      inAmpm: startAmpm,
      outH: outH,
      outM: end.m || 0
    };
  }

  // Kalyan (Manager) standard scheduled shift: 12:00 PM – 9:00 PM
  if (isManager) {
    return { status: 'Present', inH: 12, inM: 0, inAmpm: 'PM', outH: 9, outM: 0 };
  }

  // General Stylist fallback: 10:00 AM - 7:00 PM
  return { status: 'Present', inH: 10, inM: 0, inAmpm: 'AM', outH: 7, outM: 0 };
}

/**
 * Strict Roster Parser:
 * 1. Checks names strictly. If staff name is NOT in text, their data is NOT touched!
 * 2. Kalyan (Manager) and Anusha (Housekeeping) are excluded if not in roster.
 * 3. Inspects current line and lookahead line to catch schedules where name and time are on separate lines.
 * 4. Extracts date from image header.
 */
function parseRosterText(rawText) {
  window._lastParsedRawText = rawText;
  parsedRosterBuffer = {};

  if (!rawText) {
    renderParsedRosterList();
    return;
  }

  // 1. Detect Date
  const dateMatch = rawText.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dateMatch) {
    let day = dateMatch[1].padStart(2, '0');
    let month = dateMatch[2].padStart(2, '0');
    let year = dateMatch[3];
    if (year.length === 2) year = '20' + year;
    const detectedDateStr = `${year}-${month}-${day}`;
    
    const targetDateInput = document.getElementById('rosterTargetDate');
    if (targetDateInput) {
      targetDateInput.value = detectedDateStr;
    }
  }

  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let inMaleSection = false;
  let inFemaleSection = false;

  const staffDefinitions = [
    {
      id: 'staff_1',
      name: 'KALYAN',
      isManager: true,
      aliases: ['KALYAN', 'MANAGER', 'KALAYAN', 'KALYANI', 'KALY', 'KALYN', 'KLYAN', 'CALYAN', 'KALIYAN', 'KLYN']
    },
    {
      id: 'staff_4',
      name: 'SULEMAN',
      gender: 'male',
      sectionIndex: 1,
      aliases: ['SULEMAN', 'SUEMAN', 'SULMAN', 'SULIMAN', 'SUMAN', 'SULEMAAN', 'SOLEMAN', 'SULAIMAN', 'SLMN', 'SULEM', 'SULI', 'SUL', 'SUEM']
    },
    {
      id: 'staff_2',
      name: 'ISLAM',
      gender: 'male',
      sectionIndex: 2,
      aliases: ['ISLAM', 'STAM', '1SLAM', 'SLAM', 'ISLM', 'ISLAAM', 'ASLAM', 'ISLLAM', 'ISLAMM', 'I-SLAM', 'SLM', '1SLM', 'TSLAM']
    },
    {
      id: 'staff_3',
      name: 'IQRAM',
      gender: 'male',
      sectionIndex: 3,
      aliases: ['IQRAM', 'IKRAM', 'ILARAM', 'RAM', 'ORAM', 'QRAM', 'ILARA', 'IKRM', 'IQRAAM', 'IKRAAM', 'ICRAM', 'IQRM', '1QRAM', 'GRAM', 'IORAM']
    },
    {
      id: 'staff_7',
      name: 'Aruna',
      gender: 'female',
      sectionIndex: 1,
      aliases: ['ARUNA', 'ARUN', 'AARUNA', 'ARU', 'ARUNAA', 'AURNA', 'ARONA', 'ARNA']
    },
    {
      id: 'staff_5',
      name: 'AFRIN',
      gender: 'female',
      sectionIndex: 2,
      aliases: ['AFRIN', 'AFREEN', 'AMN', 'ARN', 'AERIN', 'AARIN', 'AFRN', 'AFFRIN', 'APHRIN', 'AFRI', 'ARIN', 'APRN', 'AFFIN', 'RIN']
    },
    {
      id: 'staff_6',
      name: 'RESHMA',
      gender: 'female',
      sectionIndex: 3,
      aliases: ['RESHMA', 'RMESIMA', 'RMESAMA', 'RESHM', 'RISHMA', 'RESMA', 'RESHMAA', 'RESH', 'RSHMA', 'RESHMI', 'RESMHA', 'RSHM']
    }
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upper = line.toUpperCase();
    const cleanLine = line.replace(/[^A-Za-z0-9:\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const cleanUpper = cleanLine.toUpperCase();

    // Check FEMALE FIRST because 'FEMALE' contains substring 'MALE'!
    if (upper.includes('FEMALE')) {
      inFemaleSection = true;
      inMaleSection = false;
      continue;
    } else if (upper.includes('MALE')) {
      inMaleSection = true;
      inFemaleSection = false;
      continue;
    }

    for (const staffDef of staffDefinitions) {
      if (parsedRosterBuffer[staffDef.id]) continue;

      let matched = false;

      // 1. Alias matching (raw line and cleaned line)
      for (const alias of staffDef.aliases) {
        if (alias.length <= 4) {
          const regex = new RegExp('(?:^|[\\s|0-9_.-])' + alias + '(?:[\\s|0-9_.-]|$)', 'i');
          if (regex.test(line) || regex.test(cleanLine)) {
            matched = true;
            break;
          }
        } else {
          if (upper.includes(alias) || cleanUpper.includes(alias)) {
            matched = true;
            break;
          }
        }
      }

      // 2. Section + index matching
      if (!matched && staffDef.sectionIndex) {
        if ((inMaleSection && staffDef.gender === 'male') || (inFemaleSection && staffDef.gender === 'female')) {
          const indexRegex = new RegExp('(?:^|[\\s|(\\[])' + staffDef.sectionIndex + '[\\s|._)-]+', 'i');
          if (indexRegex.test(line) || indexRegex.test(cleanLine)) {
            matched = true;
          }
        }
      }

      if (matched) {
        const staffObj = staffList.find(s => s.id === staffDef.id);
        if (staffObj) {
          // Lookahead to next line if next line does not match another staff member
          let nextLineText = '';
          if (i + 1 < lines.length) {
            const nextL = lines[i + 1].toUpperCase();
            const isNextStaff = staffDefinitions.some(sd => sd.aliases.some(a => nextL.includes(a)));
            const isHeader = nextL.includes('MALE') || nextL.includes('FEMALE') || nextL.includes('NOTE') || nextL.includes('DATE');
            if (!isNextStaff && !isHeader) {
              nextLineText = lines[i + 1];
            }
          }

          const shift = extractShiftFromContext(line, nextLineText, staffDef.isManager);
          parsedRosterBuffer[staffDef.id] = {
            staff: staffObj,
            status: shift.status,
            inH: shift.inH,
            inM: shift.inM,
            inAmpm: shift.inAmpm,
            outH: shift.outH,
            outM: shift.outM
          };
        }
        break;
      }
    }
  }

  renderParsedRosterList();
}

/**
 * Allows the owner to adjust detected status directly from the preview card
 */
function updateDetectedStaffStatus(staffId, newStatus) {
  if (parsedRosterBuffer[staffId]) {
    parsedRosterBuffer[staffId].status = newStatus;
    renderParsedRosterList();
    showToast(`Updated ${parsedRosterBuffer[staffId].staff.name} to ${newStatus}`);
  }
}

function renderParsedRosterList() {
  const container = document.getElementById('parsedRosterList');
  const countBadge = document.getElementById('detectedCountBadge');
  if (!container) return;

  const detectedStaffIds = Object.keys(parsedRosterBuffer);
  const detectedCount = detectedStaffIds.length;

  if (countBadge) {
    countBadge.innerText = `${detectedCount} Staff Found in Roster`;
  }

  if (detectedCount === 0) {
    container.innerHTML = `
      <div class="text-center py-14 text-xs text-gray-500">
        <i class="fa-solid fa-images text-3xl mb-2 text-gray-600 block"></i>
        <span>Paste 1, 2, or more schedule photos (Ctrl+V) or browse to scan.</span>
      </div>
    `;
    return;
  }

  let html = '<div class="space-y-2.5">';

  detectedStaffIds.forEach(id => {
    const item = parsedRosterBuffer[id];
    const s = item.staff;

    const isOff = item.status === 'Weekly Off' || item.status === 'Day Off';
    const isLeave = item.status === 'Leave';

    html += `
      <div class="p-3.5 bg-[#0a0a12] rounded-2xl border border-[#202030] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        <div>
          <div class="flex items-center gap-2">
            <strong class="text-white font-heading text-sm">${s.name}</strong>
            <span class="text-[9px] px-2 py-0.5 rounded-full bg-[#ff2a85]/15 text-[#ff7eb3] uppercase font-bold border border-[#ff2a85]/30">In Roster</span>
          </div>
          <span class="text-[10px] text-gray-400 block mt-0.5">${s.role}</span>
        </div>

        <div class="flex items-center gap-2 justify-end">
          ${item.status === 'Present' ? 
            `<span class="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <i class="fa-solid fa-clock text-xs"></i>
              ${item.inH}:${item.inM < 10 ? '0' + item.inM : item.inM} ${item.inAmpm} - ${item.outH}:${item.outM < 10 ? '0' + item.outM : item.outM} PM
             </span>` : 
            (isOff ? 
              `<span class="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/40 flex items-center gap-1.5">
                <i class="fa-solid fa-mug-hot text-xs"></i> DAY OFF (₹0 CUT)
               </span>` : 
              `<span class="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 flex items-center gap-1.5">
                <i class="fa-solid fa-user-xmark text-xs"></i> LEAVE (SALARY CUT)
               </span>`
            )
          }

          <!-- Quick status override dropdown -->
          <select onchange="updateDetectedStaffStatus('${id}', this.value)" 
            class="bg-[#141424] border border-[#27273e] text-gray-300 rounded-xl px-2 py-1 text-[11px] font-semibold focus:border-[#ff2a85] focus:outline-none">
            <option value="Present" ${item.status === 'Present' ? 'selected' : ''}>Present</option>
            <option value="Weekly Off" ${isOff ? 'selected' : ''}>Day Off (0 Cut)</option>
            <option value="Leave" ${isLeave ? 'selected' : ''}>Leave (Cut)</option>
          </select>
        </div>
      </div>
    `;
  });

  const unmentionedStaff = staffList.filter(s => !s.isHousekeeping && !parsedRosterBuffer[s.id]);
  if (unmentionedStaff.length > 0) {
    html += `
      <div class="p-3 rounded-2xl bg-[#0e0e18] border border-[#1d1d2b] text-[11px] text-gray-400 mt-3">
        <span class="text-gray-300 font-bold block mb-1">
          <i class="fa-solid fa-shield-halved text-[#ff7eb3] mr-1"></i> Not in this roster (${unmentionedStaff.length} stylists):
        </span>
        <span class="text-gray-400">
          <strong class="text-gray-300">${unmentionedStaff.map(x => x.name).join(', ')}</strong> — their attendance will remain completely untouched.
        </span>
      </div>
    `;
  }

  html += '</div>';
  container.innerHTML = html;
}

/**
 * Opens quick modal allowing owner to manually add any stylist to the scanned roster
 */
function openQuickAddStaffToRoster() {
  const modal = document.getElementById('quickAddRosterModal');
  const container = document.getElementById('quickAddStaffList');
  if (!modal || !container) return;

  // Filter stylists (excluding housekeeping as Anusha has fixed schedule)
  const rosterStaffList = staffList.filter(s => !s.isHousekeeping);

  let html = '';
  rosterStaffList.forEach(s => {
    const isAlreadyIn = !!parsedRosterBuffer[s.id];
    const currentStatus = isAlreadyIn ? parsedRosterBuffer[s.id].status : 'Not Added';

    html += `
      <div class="p-3 bg-[#11111e] rounded-2xl border border-[#212135] flex items-center justify-between gap-2 text-xs">
        <div>
          <strong class="text-white font-bold block">${s.name}</strong>
          <span class="text-[10px] text-gray-400">${s.role}</span>
        </div>
        <div class="flex items-center gap-1.5">
          ${isAlreadyIn ? 
            `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Added (${currentStatus})</span>` :
            `<button type="button" onclick="quickAddStaffWithShift('${s.id}', 'Present', 10, 0, 'AM', 7, 0)" 
               class="px-2.5 py-1 rounded-xl bg-[#ff2a85] hover:bg-[#ff4d9a] text-white font-bold text-[11px] shadow-sm cursor-pointer">
               + 10-7 Shift
             </button>
             <button type="button" onclick="quickAddStaffWithShift('${s.id}', 'Weekly Off', 10, 0, 'AM', 7, 0)" 
               class="px-2 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 font-bold text-[10px] border border-indigo-500/40 cursor-pointer">
               Day Off
             </button>
             <button type="button" onclick="quickAddStaffWithShift('${s.id}', 'Leave', 10, 0, 'AM', 7, 0)" 
               class="px-2 py-1 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 font-bold text-[10px] border border-rose-500/40 cursor-pointer">
               Leave
             </button>`
          }
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  modal.classList.remove('hidden');
}

function quickAddStaffWithShift(staffId, status, inH, inM, inAmpm, outH, outM) {
  const staffObj = staffList.find(s => s.id === staffId);
  if (!staffObj) return;

  parsedRosterBuffer[staffId] = {
    staff: staffObj,
    status: status,
    inH: inH,
    inM: inM,
    inAmpm: inAmpm,
    outH: outH,
    outM: outM
  };

  renderParsedRosterList();
  openQuickAddStaffToRoster(); // refresh modal state
  showToast(`Added ${staffObj.name} (${status}) to roster`);
}

function closeQuickAddStaffModal() {
  const modal = document.getElementById('quickAddRosterModal');
  if (modal) modal.classList.add('hidden');
}

/**
 * Applies shifts ONLY for staff found in the roster!
 * Staff not in the roster are completely untouched.
 */
function applyRosterToAttendance() {
  const targetDate = document.getElementById('rosterTargetDate').value;
  if (!targetDate) {
    alert('Please select a target date.');
    return;
  }

  const detectedStaffIds = Object.keys(parsedRosterBuffer);
  if (detectedStaffIds.length === 0) {
    alert('No staff names found in the roster. Please paste or scan a roster with staff names.');
    return;
  }

  if (!attendanceData[targetDate]) {
    attendanceData[targetDate] = {};
  }

  // Update ONLY detected staff!
  detectedStaffIds.forEach(id => {
    const item = parsedRosterBuffer[id];
    const s = item.staff;
    const calc = calculateShiftHoursParsed(item.inH, item.inM, item.inAmpm, item.outH, item.outM, s.isHousekeeping);

    attendanceData[targetDate][id] = {
      status: item.status,
      inH: item.inH,
      inM: item.inM,
      inAmpm: item.inAmpm,
      outH: item.outH,
      outM: item.outM,
      workedMinutes: item.status === 'Present' ? calc.workedMinutes : 0,
      otHours: item.status === 'Present' ? calc.otHours : 0,
      shortfallHours: item.status === 'Present' ? calc.shortfallHours : 0,
      otPay: item.status === 'Present' ? calc.otPay : 0,
      servicesDone: attendanceData[targetDate][id]?.servicesDone || 0,
      productsSold: attendanceData[targetDate][id]?.productsSold || 0
    };
  });

  saveAttendanceData();
  selectedDateStr = targetDate;
  const input = document.getElementById('selectedDateInput');
  if (input) input.value = targetDate;

  navigateTo('attendance');
  showToast(`Updated attendance for ${detectedStaffIds.length} staff on ${targetDate}!`);
}

// ==========================================
// 9. VIEW 5: ADMIN MANAGEMENT PANEL (#admin)
// ==========================================

function renderAdminView() {
  const container = document.getElementById('adminStaffList');
  if (!container) return;

  document.getElementById('adminShiftHours').value = salonRules.shiftHours || 9;
  document.getElementById('adminOtThreshold').value = salonRules.otGraceThresholdMinutes || 45;
  document.getElementById('adminOtRate').value = salonRules.otHourlyRate || 50;
  document.getElementById('adminSalonTarget').value = salonRules.salonMonthlyServiceTarget || 600000;
  document.getElementById('adminManagerRate').value = salonRules.managerCommissionRate || 1;

  const authCreds = getAuthCredentials();
  const authUserInput = document.getElementById('adminAuthUsername');
  if (authUserInput) authUserInput.value = authCreds.username || 'admin';
  const authPassInput = document.getElementById('adminAuthPassword');
  if (authPassInput) authPassInput.value = '';

  let html = '';

  staffList.forEach((staff, idx) => {
    html += `
      <div class="bg-[#11111c] p-5 rounded-2xl border border-[#202032] space-y-4 text-xs">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#181826] pb-3">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-[#181826] text-[#ff7eb3] font-bold flex items-center justify-center font-mono">
              ${idx + 1}
            </span>
            <div>
              <input type="text" id="admin_name_${staff.id}" value="${staff.name}" 
                class="bg-[#181828] border border-[#26263a] rounded-xl px-3 py-1 text-white font-bold font-heading text-sm focus:border-[#ff2a85]">
              <input type="text" id="admin_role_${staff.id}" value="${staff.role}" 
                class="bg-transparent border-b border-[#222234] text-gray-400 text-xs mt-1 px-1 py-0.5 focus:border-[#ff2a85] block w-full">
            </div>
          </div>

          <div class="flex items-center gap-2">
            ${staff.isManager ? `<span class="px-2.5 py-1 rounded-full bg-[#ff2a85]/20 text-[#ff7eb3] font-bold text-[10px]">MANAGER (${salonRules.managerCommissionRate || 1}% SALON REVENUE)</span>` : ''}
            <button onclick="removeStaffMember('${staff.id}')" title="Delete Staff Member"
              class="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer">
              <i class="fa-solid fa-trash text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Row 1: Fixed Pay & Allowance -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label class="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Base Salary (₹)</label>
            <input type="number" id="admin_salary_${staff.id}" value="${staff.baseSalary}" 
              onfocus="this.select()"
              class="w-full bg-[#181828] border border-[#26263a] rounded-xl px-2.5 py-1.5 text-white font-mono font-bold focus:border-[#ff2a85]">
          </div>

          <div>
            <label class="text-[10px] text-gray-400 uppercase font-semibold block mb-1">Food Allowance (₹)</label>
            <input type="number" id="admin_food_${staff.id}" value="${staff.foodAllowance || 0}" 
              onfocus="this.select()"
              class="w-full bg-[#181828] border border-[#26263a] rounded-xl px-2.5 py-1.5 text-emerald-400 font-mono font-bold focus:border-[#ff2a85]">
          </div>

          ${staff.isManager ? `
            <div class="col-span-2 p-2.5 rounded-xl bg-[#090910] border border-[#1b1b2a] text-gray-400 text-[11px] flex items-center">
              Kalyan earns ${salonRules.managerCommissionRate || 1}% on total salon service revenue when salon target is met.
            </div>
          ` : (staff.isHousekeeping ? `
            <div class="col-span-2 p-2.5 rounded-xl bg-[#090910] border border-[#1b1b2a] text-gray-400 text-[11px] flex items-center">
              House Keeping has fixed salary. No OT or percentage commission rules apply.
            </div>
          ` : `
            <div>
              <label class="text-[10px] text-purple-400 uppercase font-semibold block mb-1">Service Comm. (%)</label>
              <input type="number" id="admin_serv_rate_${staff.id}" value="${staff.serviceCommissionRate || 5}" min="0" max="100" 
                onfocus="this.select()"
                class="w-full bg-[#181828] border border-[#26263a] rounded-xl px-2.5 py-1.5 text-purple-300 font-mono font-bold focus:border-[#ff2a85]">
            </div>

            <div>
              <label class="text-[10px] text-purple-400 uppercase font-semibold block mb-1">Service Target (₹)</label>
              <input type="number" id="admin_serv_target_${staff.id}" value="${staff.serviceTarget || (staff.baseSalary * 5)}" 
                onfocus="this.select()"
                class="w-full bg-[#181828] border border-[#26263a] rounded-xl px-2.5 py-1.5 text-purple-300 font-mono font-bold focus:border-[#ff2a85]">
            </div>
          `)}
        </div>

        <!-- Row 2: Product Percentage Tiers (For Stylists) -->
        ${(!staff.isManager && !staff.isHousekeeping) ? `
          <div class="p-3 bg-[#0a0a14] rounded-xl border border-[#1e1e30] space-y-2">
            <span class="text-[10px] font-bold uppercase tracking-wider text-pink-400 block">
              <i class="fa-solid fa-bottle-droplet mr-1"></i> Retail Product Commission Percentage Rules
            </span>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label class="text-[9px] text-gray-400 block mb-0.5">Tier 1 Comm (%)</label>
                <input type="number" id="admin_prod_tier1_rate_${staff.id}" value="${staff.productTier1Rate || 5}" min="0" max="100"
                  class="w-full bg-[#181828] border border-[#26263a] rounded-lg px-2 py-1 text-pink-300 font-mono text-xs font-bold focus:border-[#ff2a85]">
              </div>
              <div>
                <label class="text-[9px] text-gray-400 block mb-0.5">Tier 1 Min Sales (₹)</label>
                <input type="number" id="admin_prod_tier1_min_${staff.id}" value="${staff.productTier1Min || 8000}" min="0"
                  class="w-full bg-[#181828] border border-[#26263a] rounded-lg px-2 py-1 text-white font-mono text-xs font-bold focus:border-[#ff2a85]">
              </div>
              <div>
                <label class="text-[9px] text-gray-400 block mb-0.5">Tier 2 Comm (%)</label>
                <input type="number" id="admin_prod_tier2_rate_${staff.id}" value="${staff.productTier2Rate || 8}" min="0" max="100"
                  class="w-full bg-[#181828] border border-[#26263a] rounded-lg px-2 py-1 text-pink-300 font-mono text-xs font-bold focus:border-[#ff2a85]">
              </div>
              <div>
                <label class="text-[9px] text-gray-400 block mb-0.5">Tier 2 Min Sales (₹)</label>
                <input type="number" id="admin_prod_tier2_min_${staff.id}" value="${staff.productTier2Min || 15000}" min="0"
                  class="w-full bg-[#181828] border border-[#26263a] rounded-lg px-2 py-1 text-white font-mono text-xs font-bold focus:border-[#ff2a85]">
              </div>
            </div>
          </div>
        ` : ''}

      </div>
    `;
  });

  container.innerHTML = html;
}

function saveAllStaffEdits() {
  staffList.forEach(staff => {
    const nameEl = document.getElementById(`admin_name_${staff.id}`);
    const roleEl = document.getElementById(`admin_role_${staff.id}`);
    const salaryEl = document.getElementById(`admin_salary_${staff.id}`);
    const foodEl = document.getElementById(`admin_food_${staff.id}`);

    if (nameEl) staff.name = nameEl.value.trim();
    if (roleEl) staff.role = roleEl.value.trim();
    if (salaryEl) staff.baseSalary = parseFloat(salaryEl.value) || 0;
    if (foodEl) staff.foodAllowance = parseFloat(foodEl.value) || 0;

    if (!staff.isManager && !staff.isHousekeeping) {
      const sTarg = document.getElementById(`admin_serv_target_${staff.id}`);
      const sRate = document.getElementById(`admin_serv_rate_${staff.id}`);
      const p1Rate = document.getElementById(`admin_prod_tier1_rate_${staff.id}`);
      const p1Min = document.getElementById(`admin_prod_tier1_min_${staff.id}`);
      const p2Rate = document.getElementById(`admin_prod_tier2_rate_${staff.id}`);
      const p2Min = document.getElementById(`admin_prod_tier2_min_${staff.id}`);

      if (sTarg) staff.serviceTarget = parseFloat(sTarg.value) || (staff.baseSalary * 5);
      if (sRate) staff.serviceCommissionRate = parseFloat(sRate.value) || 5;
      if (p1Rate) staff.productTier1Rate = parseFloat(p1Rate.value) || 5;
      if (p1Min) staff.productTier1Min = parseFloat(p1Min.value) || 8000;
      if (p2Rate) staff.productTier2Rate = parseFloat(p2Rate.value) || 8;
      if (p2Min) staff.productTier2Min = parseFloat(p2Min.value) || 15000;
    }
  });

  saveStaffList();
  renderIncentivesView();
  showToast('All staff salaries, targets & percentage commission rates saved!');
}

function saveSalonManagerTarget() {
  const target = parseFloat(document.getElementById('adminSalonTarget').value) || 600000;
  const rate = parseFloat(document.getElementById('adminManagerRate').value) || 1;

  salonRules.salonMonthlyServiceTarget = target;
  salonRules.managerCommissionRate = rate;

  saveSalonRules();
  showToast('Salon revenue target for Kalyan updated!');
}

function saveAdminShiftRules() {
  const shiftHours = parseFloat(document.getElementById('adminShiftHours').value) || 9;
  const otThreshold = parseFloat(document.getElementById('adminOtThreshold').value) || 45;
  const otRate = parseFloat(document.getElementById('adminOtRate').value) || 50;

  salonRules.shiftHours = shiftHours;
  salonRules.otGraceThresholdMinutes = otThreshold;
  salonRules.otHourlyRate = otRate;

  saveSalonRules();
  showToast('Shift and Overtime rules updated successfully!');
}

function openAddStaffModal() {
  document.getElementById('staffFormId').value = '';
  document.getElementById('staffFormName').value = '';
  document.getElementById('staffFormRole').value = '';
  document.getElementById('staffFormSalary').value = '';
  document.getElementById('staffFormFood').value = '0';
  document.getElementById('staffModalTitle').innerText = 'Add New Staff Member';
  document.getElementById('staffModal').classList.remove('hidden');
}

function closeStaffModal() {
  document.getElementById('staffModal').classList.add('hidden');
}

function handleStaffFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('staffFormName').value.trim();
  const role = document.getElementById('staffFormRole').value.trim();
  const salary = parseFloat(document.getElementById('staffFormSalary').value) || 0;
  const food = parseFloat(document.getElementById('staffFormFood').value) || 0;

  const newStaff = {
    id: 'staff_' + Date.now(),
    name,
    role,
    gender: 'female',
    baseSalary: salary,
    foodAllowance: food,
    isManager: false,
    isHousekeeping: false,
    serviceTarget: salary * 5,
    serviceCommissionRate: 5,
    productTier1Min: 8000,
    productTier1Rate: 5,
    productTier2Min: 15000,
    productTier2Rate: 8
  };

  staffList.push(newStaff);
  saveStaffList();
  closeStaffModal();
  renderAdminView();
  showToast(`Added ${name} to Green Trends Kothapet!`);
}

function removeStaffMember(staffId) {
  const staff = staffList.find(s => s.id === staffId);
  if (!staff) return;

  if (confirm(`Remove ${staff.name} from the roster?`)) {
    staffList = staffList.filter(s => s.id !== staffId);
    saveStaffList();
    renderAdminView();
    showToast(`Removed ${staff.name}.`);
  }
}

function backupSystemData() {
  const data = {
    exportDate: new Date().toISOString(),
    salon: 'Green Trends Kothapet',
    staff: staffList,
    rules: salonRules,
    attendance: attendanceData
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Green_Trends_Kothapet_Backup_${formatDateKey(new Date())}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast('Downloaded full system backup JSON!');
}

function restoreSystemData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.staff) staffList = data.staff;
      if (data.rules) salonRules = data.rules;
      if (data.attendance) attendanceData = data.attendance;

      saveStaffList();
      saveSalonRules();
      saveAttendanceData();

      renderAdminView();
      showToast('System data restored successfully!');
    } catch (err) {
      alert('Invalid backup JSON file.');
    }
  };
  reader.readAsText(file);
}

function resetAllSalesAndIncentivesToZero(buttonElement) {
  for (const dateKey in attendanceData) {
    if (attendanceData[dateKey]) {
      for (const staffId in attendanceData[dateKey]) {
        if (attendanceData[dateKey][staffId]) {
          attendanceData[dateKey][staffId].servicesDone = 0;
          attendanceData[dateKey][staffId].productsSold = 0;
        }
      }
    }
  }
  saveAttendanceData();
  renderDailyAttendance();
  renderMonthlyPayroll();
  renderIncentivesView();
  showToast('✓ All sales and incentives have been reset to ₹0!');

  if (buttonElement && buttonElement.innerHTML) {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-300 font-bold">Reset to ₹0 Done!</span>';
    setTimeout(() => {
      buttonElement.innerHTML = originalText;
    }, 2500);
  }
}

function clearAllAttendanceDataToZero(buttonElement) {
  attendanceData = {};
  saveAttendanceData();
  renderDailyAttendance();
  renderMonthlyPayroll();
  renderIncentivesView();
  showToast('✓ All attendance and sales data cleared to a clean 0 slate!');

  if (buttonElement && buttonElement.innerHTML) {
    const originalText = buttonElement.innerHTML;
    buttonElement.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> <span class="text-emerald-300 font-bold">Cleared to 0!</span>';
    setTimeout(() => {
      buttonElement.innerHTML = originalText;
    }, 2500);
  }
}

window.resetAllSalesAndIncentivesToZero = resetAllSalesAndIncentivesToZero;
window.clearAllAttendanceDataToZero = clearAllAttendanceDataToZero;

function confirmResetDefaults() {
  if (confirm('Reset Green Trends Kothapet to factory default settings?')) {
    staffList = [...DEFAULT_STAFF];
    salonRules = { ...DEFAULT_SALON_RULES };
    attendanceData = {};
    saveStaffList();
    saveSalonRules();
    saveAttendanceData();
    renderAdminView();
    updateViewFromHash();
    showToast('Reset system to factory default configurations!');
  }
}

// ==========================================
// 10. PAY SLIP MODAL & PRINTING
// ==========================================

function openPaySlipModal(staffId) {
  const staff = staffList.find(s => s.id === staffId);
  if (!staff) return;

  const [yearStr, monthStr] = selectedMonthStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const p = calculateStaffMonthPayroll(staff, year, month);

  const monthName = new Date(year, month - 1, 1).toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();

  document.getElementById('psMonthYear').innerText = monthName;
  document.getElementById('psGeneratedDate').innerText = `Date: ${formatDateKey(new Date())}`;
  document.getElementById('psStaffName').innerText = staff.name;
  document.getElementById('psStaffRole').innerText = staff.role;
  document.getElementById('psMonthDays').innerText = `${p.daysInMonth} Days`;
  document.getElementById('psPerDayRate').innerText = `₹${p.perDaySalary.toFixed(2)}`;

  document.getElementById('psDaysPresent').innerText = `${p.presentDays} Days`;
  document.getElementById('psWeeklyOffs').innerText = `${p.weeklyOffs} Days`;
  document.getElementById('psUnpaidLeaves').innerText = `${p.unpaidLeaves}`; // STRICTLY NUMBER

  document.getElementById('psBaseSalary').innerText = `₹${staff.baseSalary.toLocaleString('en-IN')}`;

  const foodRow = document.getElementById('psFoodRow');
  if (staff.foodAllowance > 0) {
    foodRow.classList.remove('hidden');
    document.getElementById('psFoodAllowance').innerText = `₹${staff.foodAllowance.toLocaleString('en-IN')}`;
  } else {
    foodRow.classList.add('hidden');
  }

  document.getElementById('psOtHoursText').innerText = `${p.netOtHours}h`;
  document.getElementById('psOtPay').innerText = `₹${p.netOtPay.toLocaleString('en-IN')}`;
  
  if (staff.isManager) {
    document.getElementById('psServiceIncentiveLabel').innerText = 'Manager 1% Commission';
  } else {
    document.getElementById('psServiceIncentiveLabel').innerText = 'Services Commission (5%)';
  }
  document.getElementById('psServiceIncentive').innerText = `₹${p.serviceCommission.toLocaleString('en-IN')}`;
  document.getElementById('psProductIncentive').innerText = `₹${p.productCommission.toLocaleString('en-IN')}`;

  const shortfallRow = document.getElementById('psShortfallRow');
  if (p.totalShortfallHours > 0) {
    shortfallRow.classList.remove('hidden');
    document.getElementById('psShortfallText').innerText = `${p.totalShortfallHours}h short`;
  } else {
    shortfallRow.classList.add('hidden');
  }

  document.getElementById('psLeaveDeduction').innerText = `-₹${Math.round(p.leaveDeduction).toLocaleString('en-IN')}`;
  document.getElementById('psNetPayable').innerText = `₹${p.netPayable.toLocaleString('en-IN')}`;

  document.getElementById('paySlipModal').classList.remove('hidden');
}

function closePaySlipModal() {
  document.getElementById('paySlipModal').classList.add('hidden');
}

function printPaySlip() {
  window.print();
}

// ==========================================
// 11. UTILITIES & TOAST ALERTS
// ==========================================

function getStaffName(staffId) {
  const s = staffList.find(x => x.id === staffId);
  return s ? s.name : 'Staff';
}

function formatDateKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatMonthKey(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'bg-[#141420] text-white border border-[#ff2a85]/50 px-4 py-2.5 rounded-2xl shadow-2xl text-xs flex items-center gap-2 transform transition-all duration-300 pointer-events-auto';
  toast.innerHTML = `
    <i class="fa-solid fa-circle-check text-[#ff2a85]"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function saveAttendanceToast() {
  saveAttendanceData();
  showToast('Today\'s attendance and sales saved successfully!');
}

function startLiveClock() {
  function tick() {
    const now = new Date();
    const timeEl = document.getElementById('liveTime');
    const dateEl = document.getElementById('liveDate');
    if (timeEl) timeEl.innerText = now.toLocaleTimeString('en-US', { hour12: true });
    if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }
  tick();
  setInterval(tick, 1000);
}

// ==========================================
// 12. BOOTSTRAP & GLOBAL EVENT LISTENERS
// ==========================================

window.addEventListener('DOMContentLoaded', () => {
  initStorage();
  initAuth();

  const dateInput = document.getElementById('selectedDateInput');
  if (dateInput) dateInput.value = selectedDateStr;

  const monthInput = document.getElementById('selectedMonthInput');
  if (monthInput) monthInput.value = selectedMonthStr;

  const targetDateInput = document.getElementById('rosterTargetDate');
  if (targetDateInput) targetDateInput.value = selectedDateStr;

  window.addEventListener('hashchange', updateViewFromHash);

  // Global Clipboard Paste Listener (Ctrl + V for images - supports 1, 2, 3+ photos)
  window.addEventListener('paste', (e) => {
    const items = (e.clipboardData || window.clipboardData)?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type && items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          if (window.location.hash !== '#roster') {
            navigateTo('roster');
          }
          addRosterImageFile(blob);
        }
      }
    }
  });

  // Drag and Drop support on #dropZone (supports multiple files dropped at once)
  const dropZone = document.getElementById('dropZone');
  if (dropZone) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-[#ff2a85]', 'bg-[#150b1a]');
    });
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#ff2a85]', 'bg-[#150b1a]');
    });
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-[#ff2a85]', 'bg-[#150b1a]');
      if (e.dataTransfer && e.dataTransfer.files) {
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          addRosterImageFile(e.dataTransfer.files[i]);
        }
      }
    });
  }

  startLiveClock();
  updateViewFromHash();
});
