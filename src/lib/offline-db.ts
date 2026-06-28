// src/lib/offline-db.ts
import fs from "fs";
import path from "path";

// Define the file path for the JSON database inside the workspace
const DB_FILE = path.join(process.cwd(), "src", "lib", "offline_db.json");

// Default initial jobs data (copied from prisma/seed.ts)
const DEFAULT_JOBS = [
  {
    id: "nashik-job-elec-1",
    title: "Industrial Electrician (औद्योगिक इलेक्ट्रिशियन)",
    description: "Require an experienced ITI Electrician for machinery wiring, circuit troubleshooting, and high-voltage control panel maintenance. Must follow plant LOTO safety protocols.",
    requirements: ["Wiring", "Electrical Maintenance", "Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["hi", "mr"],
    location: "Ambad MIDC, Nashik",
    salary: "₹18,000 - ₹24,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-elec-2",
    title: "Maintenance Electrician (इलेक्ट्रिशियन)",
    description: "Urgent opening for a plant maintenance electrician. Main responsibilities include generator servicing, breakdown repairs, and domestic facility light wiring.",
    requirements: ["Wiring", "Electrical Maintenance", "Troubleshooting"],
    requiredLanguages: ["mr"],
    location: "Satpur MIDC, Nashik",
    salary: "₹16,000 - ₹20,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-elec-3",
    title: "Substation Operator / Junior Electrician",
    description: "Monitoring control desk meters, documenting voltage logs, switching grids, and supervising physical safety barriers at our Ambad power distribution center.",
    requirements: ["Electrical Maintenance", "Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["hi", "en"],
    location: "Ambad, Nashik",
    salary: "₹17,000 - ₹22,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-elec-4",
    title: "AC & Panel Wiring Electrician",
    description: "Perform precision panel board assembly, structural wiring, duct layouts, and cooling unit testing in an automated manufacturing environment.",
    requirements: ["Wiring", "Electrical Maintenance"],
    requiredLanguages: ["mr", "hi"],
    location: "Sinnar MIDC, Nashik",
    salary: "₹19,000 - ₹25,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-weld-1",
    title: "MIG Structural Welder (वेल्डर)",
    description: "Structural fabricator needed at heavy steel forging site in Satpur. Must read basic drawings and perform MIG/arc welding with proper gas shielding.",
    requirements: ["Welding", "Blueprints", "Metal Fabrication"],
    requiredLanguages: ["hi"],
    location: "Satpur MIDC, Nashik",
    salary: "₹18,000 - ₹26,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-weld-2",
    title: "TIG Argon Welder",
    description: "Stainless steel pipe welding job. High precision and quality check compliance required. Must be able to grind joints and inspect for porosity.",
    requirements: ["Welding", "Grinding", "Metal Fabrication"],
    requiredLanguages: ["mr", "hi"],
    location: "Ambad MIDC, Nashik",
    salary: "₹20,000 - ₹28,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-weld-3",
    title: "Gas Cutter & Assistant Welder",
    description: "Operating gas oxy-fuel torches, grinding scrap metal sheets, cleaning weld seams, and setting up shielding gas tanks under senior guidance.",
    requirements: ["Welding", "Grinding"],
    requiredLanguages: ["mr"],
    location: "Sinnar, Nashik",
    salary: "₹14,000 - ₹18,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-weld-4",
    title: "Custom Sheet Metal Welder",
    description: "Welding thin-gauge sheets for commercial kitchen equipment. Demands high structural neatness, dimensional checking, and seam polishing.",
    requirements: ["Welding", "Grinding", "Metal Fabrication", "Blueprints"],
    requiredLanguages: ["hi", "mr"],
    location: "Satpur, Nashik",
    salary: "₹17,000 - ₹22,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-fitter-1",
    title: "Mechanical Assembly Fitter (फिटर)",
    description: "Requires alignment of motor mounts, gearbox fitting, checking tolerances with vernier calipers, and heavy bolt assembly at auto component unit.",
    requirements: ["Metal Fabrication", "Blueprints", "Grinding", "Troubleshooting"],
    requiredLanguages: ["mr", "hi"],
    location: "Ambad MIDC, Nashik",
    salary: "₹18,000 - ₹24,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-fitter-2",
    title: "Pipe Fitter / Fabricator",
    description: "Laying out pipeline routes, threading iron ducts, bending conduits, and assembling flanges per detailed blueprints at Nashik chemical plant.",
    requirements: ["Metal Fabrication", "Blueprints", "Safety Protocols"],
    requiredLanguages: ["hi"],
    location: "Satpur, Nashik",
    salary: "₹19,000 - ₹25,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-fitter-3",
    title: "Maintenance Fitter",
    description: "Dismantling conveyor lines, replacing worn bearings, aligning pulleys, and lubricating gears to avoid production shutdowns.",
    requirements: ["Troubleshooting", "Grinding", "Safety Protocols"],
    requiredLanguages: ["mr"],
    location: "Nashik Road, Nashik",
    salary: "₹16,000 - ₹21,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-fitter-4",
    title: "Machine Assembler Fitter",
    description: "Precision bench fitting, hydraulic hose routing, sliding guide adjustment, and structural alignment for bespoke machinery builders.",
    requirements: ["Metal Fabrication", "Blueprints", "Troubleshooting"],
    requiredLanguages: ["en", "hi", "mr"],
    location: "Ambad MIDC, Nashik",
    salary: "₹20,000 - ₹27,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-plumb-1",
    title: "Commercial Plumber (प्लंबर)",
    description: "Lay out water lines, install PVC/GI drainage pipes, repair toilet fixtures, and inspect for leakage in new residential housing sites.",
    requirements: ["Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["hi", "mr"],
    location: "Indira Nagar, Nashik",
    salary: "₹15,000 - ₹20,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-plumb-2",
    title: "Industrial Pipe Plumber",
    description: "Installation and repair of high-pressure cooling pipes, boiler water inlets, valves, and gauges in food processing unit.",
    requirements: ["Safety Protocols", "Troubleshooting"],
    requiredLanguages: ["mr"],
    location: "Sinnar MIDC, Nashik",
    salary: "₹17,000 - ₹23,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-plumb-3",
    title: "Maintenance Plumber & Handyman",
    description: "Attend to daily leak calls, unclog commercial sewer lines, inspect fire hydrant pipe lines, and change utility pumps at hotel cluster.",
    requirements: ["Troubleshooting"],
    requiredLanguages: ["hi"],
    location: "Panchavati, Nashik",
    salary: "₹14,000 - ₹18,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-plumb-4",
    title: "Submersible Pump Installer & Plumber",
    description: "Borewell pipe dropping, submersible motor leveling, pressure relief valve connections, and controller electrical hookups for agricultural supply units.",
    requirements: ["Wiring", "Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["mr", "hi"],
    location: "Dindori, Nashik",
    salary: "₹16,000 - ₹22,005 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-ac-1",
    title: "AC Technician / HVAC Mechanic (एसी मेकॅनिक)",
    description: "Installing commercial split AC systems, charging R-32 refrigerant, checking pressure leaks, and diagnosing compressor defects in office structures.",
    requirements: ["Wiring", "Troubleshooting", "Electrical Maintenance"],
    requiredLanguages: ["mr", "hi"],
    location: "College Road, Nashik",
    salary: "₹18,000 - ₹25,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-ac-2",
    title: "Chiller Plant Operator & HVAC Fitter",
    description: "Requires running and daily maintenance logs of centralized cooling towers, servicing industrial ducts, and cleaning filter cassettes.",
    requirements: ["Electrical Maintenance", "Troubleshooting", "Safety Protocols"],
    requiredLanguages: ["hi"],
    location: "Ambad MIDC, Nashik",
    salary: "₹20,050 - ₹26,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-ac-3",
    title: "Apprentice AC Technician",
    description: "Cleaning air filters, checking blower motor currents, climbing ladders for brackets installation, and loading parts truck.",
    requirements: ["Electrical Maintenance", "Wiring"],
    requiredLanguages: ["mr"],
    location: "Satpur, Nashik",
    salary: "₹12,000 - ₹15,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  },
  {
    id: "nashik-job-ac-4",
    title: "Refrigeration & Cooling Technician",
    description: "Repairing walk-in commercial cold rooms, supermarket display freezers, and dynamic temp control boards. Relies on troubleshooting expertise.",
    requirements: ["Wiring", "Troubleshooting", "Electrical Maintenance", "Safety Protocols"],
    requiredLanguages: ["en", "mr", "hi"],
    location: "Pathardi Phata, Nashik",
    salary: "₹19,000 - ₹26,000 / month",
    employerId: "prof-nashik-recruiter",
    status: "OPEN"
  }
];

export interface OfflineSchema {
  users: any[];
  profiles: any[];
  skillPassports: any[];
  jobListings: any[];
  applications: any[];
  matchResults: any[];
  interviewSessions: any[];
}

// Read database from file, or initialize with defaults if not present
export function readOfflineDb(): OfflineSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("Failed to read offline JSON database:", err);
  }

  // Create initial data
  const initialDb: OfflineSchema = {
    users: [
      {
        id: "emp-nashik-msme",
        email: "recruiter@nashikmsme.org",
        role: "EMPLOYER",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    profiles: [
      {
        id: "prof-nashik-recruiter",
        userId: "emp-nashik-msme",
        fullName: "Nashik MSME Industrial Association",
        companyName: "Nashik MSME Cluster Association",
        phone: "+91 25300 00000",
        bio: "Coordinating placements and vocational training jobs across Satpur MIDC, Ambad MIDC, and Sinnar areas in Nashik.",
        languages: ["en", "hi", "mr"],
        state: "Maharashtra",
        isVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ],
    skillPassports: [],
    jobListings: [...DEFAULT_JOBS],
    applications: [],
    matchResults: [],
    interviewSessions: []
  };

  writeOfflineDb(initialDb);
  return initialDb;
}

// Write database to file
export function writeOfflineDb(data: OfflineSchema): void {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write offline JSON database:", err);
  }
}

// Utility to match standard Prisma query filtering
function matchWhere(item: any, where: any): boolean {
  if (!where) return true;
  for (const key of Object.keys(where)) {
    const val = where[key];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      const op = Object.keys(val)[0];
      if (op === "equals") {
        if (item[key] !== val.equals) return false;
      } else if (op === "in") {
        if (!val.in.includes(item[key])) return false;
      } else if (op === "contains") {
        if (!String(item[key] || "").toLowerCase().includes(String(val.contains).toLowerCase())) return false;
      }
    } else {
      if (item[key] !== val) return false;
    }
  }
  return true;
}

// Deep resolve nested includes for our schemas
function resolveRelations(model: string, item: any, include: any, db: OfflineSchema): any {
  if (!item) return item;
  const result = { ...item };

  if (include) {
    if (model === "user" && include.profile) {
      const profile = db.profiles.find(p => p.userId === item.id);
      result.profile = resolveRelations("profile", profile, include.profile === true ? null : include.profile.include, db);
    }
    if (model === "profile") {
      if (include.skillPassport) {
        const passport = db.skillPassports.find(sp => sp.profileId === item.id);
        result.skillPassport = resolveRelations("skillPassport", passport, include.skillPassport === true ? null : include.skillPassport.include, db);
      }
      if (include.user) {
        const user = db.users.find(u => u.id === item.userId);
        result.user = resolveRelations("user", user, include.user === true ? null : include.user.include, db);
      }
      if (include.applications) {
        const apps = db.applications.filter(a => a.jobSeekerId === item.id);
        result.applications = apps.map(app => resolveRelations("application", app, include.applications === true ? null : include.applications.include, db));
      }
    }
    if (model === "application") {
      if (include.job) {
        const job = db.jobListings.find(j => j.id === item.jobId);
        result.job = resolveRelations("jobListing", job, include.job === true ? null : include.job.include, db);
      }
      if (include.jobSeeker) {
        const seeker = db.profiles.find(p => p.id === item.jobSeekerId);
        result.jobSeeker = resolveRelations("profile", seeker, include.jobSeeker === true ? null : include.jobSeeker.include, db);
      }
    }
    if (model === "matchResult" && include.jobListing) {
      const job = db.jobListings.find(j => j.id === item.jobListingId);
      result.jobListing = resolveRelations("jobListing", job, include.jobListing === true ? null : include.jobListing.include, db);
    }
    if (model === "jobListing" && include.employer) {
      const employer = db.profiles.find(p => p.id === item.employerId);
      result.employer = resolveRelations("profile", employer, include.employer === true ? null : include.employer.include, db);
    }
  }
  return result;
}

// Generate CUID style ID fallback
function generateId(prefix: string = ""): string {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`;
}

// Mock Prisma Operations
export const offlineDb = {
  // FIND UNIQUE
  findUnique: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    const list = db[model] || [];
    const item = list.find((x: any) => matchWhere(x, args?.where));
    if (!item) return null;
    return resolveRelations(model.replace(/s$/, ""), item, args?.include, db);
  },

  // FIND MANY
  findMany: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    let list = db[model] || [];
    
    // Filtering
    if (args?.where) {
      list = list.filter((x: any) => matchWhere(x, args.where));
    }

    // Include
    let results = list.map((item: any) => resolveRelations(model.replace(/s$/, ""), item, args?.include, db));

    // Order By
    if (args?.orderBy) {
      const orderKeys = Object.keys(args.orderBy);
      if (orderKeys.length > 0) {
        const key = orderKeys[0];
        const dir = args.orderBy[key];
        results.sort((a: any, b: any) => {
          const valA = a[key];
          const valB = b[key];
          if (valA === valB) return 0;
          if (dir === "desc") {
            return valA < valB ? 1 : -1;
          } else {
            return valA > valB ? 1 : -1;
          }
        });
      }
    }

    return results;
  },

  // CREATE
  create: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    const list = db[model] || [];
    
    const newRecord = {
      id: args.data.id || generateId(model.substring(0, 4) + "-"),
      ...args.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newRecord);
    db[model] = list;
    writeOfflineDb(db);

    return resolveRelations(model.replace(/s$/, ""), newRecord, args?.include, db);
  },

  // UPDATE
  update: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    const list = db[model] || [];
    const index = list.findIndex((x: any) => matchWhere(x, args?.where));
    if (index === -1) {
      throw new Error(`Record to update not found in offline DB: ${model}`);
    }

    const updatedRecord = {
      ...list[index],
      ...args.data,
      updatedAt: new Date().toISOString()
    };

    list[index] = updatedRecord;
    db[model] = list;
    writeOfflineDb(db);

    return resolveRelations(model.replace(/s$/, ""), updatedRecord, args?.include, db);
  },

  // UPSERT
  upsert: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    const list = db[model] || [];
    const index = list.findIndex((x: any) => matchWhere(x, args?.where));

    let record;
    if (index !== -1) {
      // Update
      record = {
        ...list[index],
        ...args.update,
        updatedAt: new Date().toISOString()
      };
      list[index] = record;
    } else {
      // Create
      record = {
        id: args.create.id || generateId(model.substring(0, 4) + "-"),
        ...args.create,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      list.push(record);
    }

    db[model] = list;
    writeOfflineDb(db);

    return resolveRelations(model.replace(/s$/, ""), record, args?.include, db);
  },

  // DELETE MANY
  deleteMany: async (model: keyof OfflineSchema, args: any) => {
    const db = readOfflineDb();
    const list = db[model] || [];
    
    const remaining = list.filter((x: any) => !matchWhere(x, args?.where));
    const deletedCount = list.length - remaining.length;

    db[model] = remaining;
    writeOfflineDb(db);

    return { count: deletedCount };
  }
};
