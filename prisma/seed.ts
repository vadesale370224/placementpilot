// prisma/seed.ts
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("Seeding database with 20 MSME jobs across 10 roles...");

  // 1. Create Employer Users & Profiles (Realistic MSME companies)
  const employers = [
    {
      userId: "emp-satpur-elec-id",
      profileId: "prof-satpur-elec",
      email: "jobs@satpurelectricals.com",
      companyName: "Satpur Electricals Ltd",
      fullName: "Rajesh Kulkarni (Satpur Electricals)",
      phone: "+91 25311 11111",
      bio: "Satpur MIDC industrial electrical contractor.",
    },
    {
      userId: "emp-ambad-weld-id",
      profileId: "prof-ambad-weld",
      email: "info@ambadwelders.co.in",
      companyName: "Ambad Industrial Welders",
      fullName: "Sanjay Patil (Ambad Welders)",
      phone: "+91 25322 22222",
      bio: "Heavy fabrication shop in Ambad MIDC.",
    },
    {
      userId: "emp-sinnar-cnc-id",
      profileId: "prof-sinnar-cnc",
      email: "hr@sinnarcnctech.com",
      companyName: "Sinnar CNC Tech",
      fullName: "Anand Shah (Sinnar CNC)",
      phone: "+91 25333 33333",
      bio: "High precision CNC milling and turning works.",
    },
    {
      userId: "emp-nashik-sec-id",
      profileId: "prof-nashik-sec",
      email: "contact@nashiksecurity.in",
      companyName: "Nashik Security Solutions",
      fullName: "Vikram Gaikwad (Nashik Security)",
      phone: "+91 25344 44444",
      bio: "Industrial and residential security guarding service provider.",
    },
    {
      userId: "emp-panchavati-mp-id",
      profileId: "prof-panchavati-mp",
      email: "build@panchavati.com",
      companyName: "Panchavati Builders & Painters",
      fullName: "Dinesh Marathe (Panchavati Builders)",
      phone: "+91 25355 22222",
      bio: "Civil construction, masonry, and wall painting contractors.",
    },
    {
      userId: "emp-nashik-plumb-id",
      profileId: "prof-nashik-plumb",
      email: "plumb@nashikcare.com",
      companyName: "Nashik Plumbing Care",
      fullName: "Karan Johar (Nashik Plumbing)",
      phone: "+91 25366 33333",
      bio: "Providing commercial pipe fittings and sanitization services.",
    },
    {
      userId: "emp-sinnar-carp-id",
      profileId: "prof-sinnar-carp",
      email: "design@sinnarwood.com",
      companyName: "Sinnar Woodcrafts",
      fullName: "Milind Soman (Sinnar Wood)",
      phone: "+91 25377 44444",
      bio: "Bespoke commercial furniture makers.",
    },
  ];

  for (const emp of employers) {
    // Create User
    await prisma.user.upsert({
      where: { id: emp.userId },
      update: { role: "EMPLOYER" },
      create: {
        id: emp.userId,
        email: emp.email,
        role: "EMPLOYER",
      },
    });

    // Create Profile
    await prisma.profile.upsert({
      where: { id: emp.profileId },
      update: {
        fullName: emp.fullName,
        companyName: emp.companyName,
        phone: emp.phone,
        bio: emp.bio,
        languages: ["en", "hi", "mr"],
        state: "Maharashtra",
        isVerified: true,
      },
      create: {
        id: emp.profileId,
        userId: emp.userId,
        fullName: emp.fullName,
        companyName: emp.companyName,
        phone: emp.phone,
        bio: emp.bio,
        languages: ["en", "hi", "mr"],
        state: "Maharashtra",
        isVerified: true,
      },
    });
  }

  // 2. Define 20 MSME Jobs (2 for each of 10 Roles)
  const jobs = [
    // 1. Electrician
    {
      id: "job-elec-nashik-1",
      employerId: "prof-satpur-elec",
      title: "ITI Maintenance Electrician",
      description: "Urgent hiring for a plant maintenance electrician to wire circuits, service heavy machinery, and handle panel board diagnostics.",
      requirements: ["Wiring", "Electrical Maintenance", "Troubleshooting"],
      requiredLanguages: ["mr"],
      location: "Satpur MIDC, Nashik",
      salary: "₹15,000 - ₹20,000 / month",
    },
    {
      id: "job-elec-mumbai-2",
      employerId: "prof-satpur-elec",
      title: "Commercial AC Fitter & Electrician",
      description: "Perform split AC installations, cable routing, and electric circuit repairs in new office spaces.",
      requirements: ["Wiring", "Troubleshooting", "Air Conditioning"],
      requiredLanguages: ["hi", "en"],
      location: "Thane, Mumbai",
      salary: "₹18,000 - ₹25,000 / month",
    },
    // 2. Welder
    {
      id: "job-weld-nashik-1",
      employerId: "prof-ambad-weld",
      title: "Structural MIG Welder",
      description: "Requires fabricating steel beams, grinding joints, and gas arc MIG welding for industrial boiler setups.",
      requirements: ["Welding", "Grinding", "Metal Fabrication"],
      requiredLanguages: ["hi"],
      location: "Ambad MIDC, Nashik",
      salary: "₹16,000 - ₹22,000 / month",
    },
    {
      id: "job-weld-pune-2",
      employerId: "prof-ambad-weld",
      title: "TIG Argon Welder",
      description: "Stainless steel welding for auto component fabrication. Requires reading mechanical blueprint drawings and quality checks.",
      requirements: ["Welding", "Blueprints", "Metal Fabrication"],
      requiredLanguages: ["mr", "hi"],
      location: "Chakan, Pune",
      salary: "₹20,000 - ₹26,500 / month",
    },
    // 3. Fitter
    {
      id: "job-fitter-nashik-1",
      employerId: "prof-ambad-weld",
      title: "Mechanical Assembly Fitter",
      description: "Perform gear assembly, hydraulic pipe fittings, and alignment checks using vernier calipers.",
      requirements: ["Metal Fabrication", "Blueprints", "Conveyor Systems"],
      requiredLanguages: ["mr"],
      location: "Ambad, Nashik",
      salary: "₹14,500 - ₹19,000 / month",
    },
    {
      id: "job-fitter-pune-2",
      employerId: "prof-ambad-weld",
      title: "Production Assembly Fitter",
      description: "Fits and assembles automotive chassis panels. Follows safety layouts and operates standard tooling systems.",
      requirements: ["Blueprints", "Troubleshooting", "Safety Protocols"],
      requiredLanguages: ["hi"],
      location: "Pimpri, Pune",
      salary: "₹17,000 - ₹23,000 / month",
    },
    // 4. Plumber
    {
      id: "job-plumb-nashik-1",
      employerId: "prof-nashik-plumb",
      title: "Commercial Building Plumber",
      description: "Fitting water lines, laying PVC/GI drainage pipes, fixing toilet accessories in commercial complexes.",
      requirements: ["Conduit Bending", "Troubleshooting", "Pipe Fitting"],
      requiredLanguages: ["hi", "mr"],
      location: "College Road, Nashik",
      salary: "₹13,000 - ₹18,000 / month",
    },
    {
      id: "job-plumb-mumbai-2",
      employerId: "prof-nashik-plumb",
      title: "Industrial Pipe Fitter Plumber",
      description: "Installation and repair of high pressure industrial water inlets, cooling tubes, and valves in chemical plants.",
      requirements: ["Safety Protocols", "Troubleshooting", "Pipe Fitting"],
      requiredLanguages: ["en", "hi"],
      location: "Navi Mumbai, Mumbai",
      salary: "₹18,500 - ₹24,000 / month",
    },
    // 5. AC Technician
    {
      id: "job-ac-nashik-1",
      employerId: "prof-satpur-elec",
      title: "AC Mechanic / HVAC Installer",
      description: "Split AC servicing, charging R-32 cooling gases, detecting pipeline leakages, and panel wiring.",
      requirements: ["Wiring", "Troubleshooting", "Electrical Maintenance"],
      requiredLanguages: ["mr"],
      location: "Pathardi Phata, Nashik",
      salary: "₹16,000 - ₹22,000 / month",
    },
    {
      id: "job-ac-pune-2",
      employerId: "prof-satpur-elec",
      title: "Chiller Plant Operator AC Tech",
      description: "Monitoring and servicing commercial central HVAC cooling towers, fan coil units, and checking compressors.",
      requirements: ["Electrical Maintenance", "Troubleshooting", "Safety Protocols"],
      requiredLanguages: ["hi", "en"],
      location: "Hinjewadi, Pune",
      salary: "₹19,000 - ₹25,000 / month",
    },
    // 6. CNC Operator
    {
      id: "job-cnc-nashik-1",
      employerId: "prof-sinnar-cnc",
      title: "CNC Lathe Machine Operator",
      description: "Operating CNC lathe machinery, loading metal billets, checking component tolerances, and tool indexing.",
      requirements: ["Tool Indexing", "Calipers", "Machine Operations"],
      requiredLanguages: ["hi", "mr"],
      location: "Sinnar MIDC, Nashik",
      salary: "₹15,000 - ₹20,000 / month",
    },
    {
      id: "job-cnc-pune-2",
      employerId: "prof-sinnar-cnc",
      title: "CNC VMC Machine Operator",
      description: "VMC loading, offsets editing, check depth dimensions using micrometers. Must read design blueprints.",
      requirements: ["Blueprints", "Micrometers", "Machine Operations"],
      requiredLanguages: ["hi"],
      location: "Bhosari, Pune",
      salary: "₹16,500 - ₹22,500 / month",
    },
    // 7. Painter
    {
      id: "job-paint-nashik-1",
      employerId: "prof-panchavati-mp",
      title: "Industrial Spray Painter",
      description: "Operate air compressor spray guns to paint sheet metal enclosures. Grinding, primer coating, and finish coating.",
      requirements: ["Spray Painting", "Primer Coating", "Grinding"],
      requiredLanguages: ["mr"],
      location: "Satpur MIDC, Nashik",
      salary: "₹14,000 - ₹19,000 / month",
    },
    {
      id: "job-paint-mumbai-2",
      employerId: "prof-panchavati-mp",
      title: "Wall Painter / Deco Finish Painter",
      description: "Applying wall putty, sanding, rolling primer coats, and finishing luxury decorative paints at residential buildings.",
      requirements: ["Putty Application", "Sanding", "Wall Painting"],
      requiredLanguages: ["hi"],
      location: "Andheri, Mumbai",
      salary: "₹12,000 - ₹18,000 / month",
    },
    // 8. Carpenter
    {
      id: "job-carp-nashik-1",
      employerId: "prof-sinnar-carp",
      title: "Furniture Carpenter",
      description: "Cutting ply sheets, fixing laminates, wood routing, and assembling kitchen cabinets or commercial desks.",
      requirements: ["Wood Cutting", "Lamination", "Furniture Assembly"],
      requiredLanguages: ["mr", "hi"],
      location: "Sinnar, Nashik",
      salary: "₹15,000 - ₹21,000 / month",
    },
    {
      id: "job-carp-pune-2",
      employerId: "prof-sinnar-carp",
      title: "Office Interior Wood Carpenter",
      description: "Assembling modular office cabins, dry wall partitions, ceiling frames, and fitting glass door hinges.",
      requirements: ["Modular Partitioning", "Ceiling Frames", "Blueprints"],
      requiredLanguages: ["hi"],
      location: "Wakad, Pune",
      salary: "₹17,000 - ₹23,000 / month",
    },
    // 9. Mason
    {
      id: "job-mason-nashik-1",
      employerId: "prof-panchavati-mp",
      title: "Bricklayer / Civil Mason",
      description: "Mixing cement, laying brick walls, plastering surfaces, tile setting at housing sites.",
      requirements: ["Cement Mixing", "Plastering", "Tile Setting"],
      requiredLanguages: ["mr"],
      location: "Panchavati, Nashik",
      salary: "₹14,000 - ₹19,500 / month",
    },
    {
      id: "job-mason-mumbai-2",
      employerId: "prof-panchavati-mp",
      title: "Concrete Mason & Plasterer",
      description: "Concrete casting, structural pillar reinforcing checks, high quality wall plastering and alignment.",
      requirements: ["Cement Mixing", "Concreting", "Plastering"],
      requiredLanguages: ["hi"],
      location: "Kalyan, Mumbai",
      salary: "₹16,000 - ₹22,000 / month",
    },
    // 10. Security Guard
    {
      id: "job-sec-nashik-1",
      employerId: "prof-nashik-sec",
      title: "Industrial Security Guard",
      description: "Gate registration, patrolling warehouse grounds, verifying shipping logs, locking access gates.",
      requirements: ["Patrolling", "Visitor Registration", "Safety Protocols"],
      requiredLanguages: ["mr", "hi"],
      location: "Satpur MIDC, Nashik",
      salary: "₹12,000 - ₹16,000 / month",
    },
    {
      id: "job-sec-pune-2",
      employerId: "prof-nashik-sec",
      title: "Commercial Building Guard",
      description: "Manning corporate entry reception, monitoring CCTV alerts, regulating employee parking spaces.",
      requirements: ["Visitor Registration", "CCTV Monitoring", "Communication"],
      requiredLanguages: ["hi", "en"],
      location: "Koregaon Park, Pune",
      salary: "₹14,000 - ₹18,500 / month",
    },
  ];

  for (const job of jobs) {
    await prisma.jobListing.upsert({
      where: { id: job.id },
      update: {
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        requiredLanguages: job.requiredLanguages,
        location: job.location,
        salary: job.salary,
        employerId: job.employerId,
      },
      create: {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        requiredLanguages: job.requiredLanguages,
        location: job.location,
        salary: job.salary,
        employerId: job.employerId,
      },
    });
  }

  console.log("Database successfully seeded with 20 jobs!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
