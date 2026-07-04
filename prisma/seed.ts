import { PrismaClient } from "@prisma/client";
import { hashPassword } from "@better-auth/utils/password";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.note.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.selectionCriteriaScore.deleteMany();
  await prisma.selectionResult.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentType.deleteMany();
  await prisma.document.deleteMany();
  await prisma.registrationStep.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.programQuota.deleteMany();
  await prisma.program.deleteMany();
  await prisma.academicPeriod.deleteMany();
  await prisma.academicHistory.deleteMany();
  await prisma.parent.deleteMany();
  await prisma.address.deleteMany();
  await prisma.applicant.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await hashPassword("password123");

  // ─── USERS ───
  const admin = await prisma.user.create({
    data: {
      name: "Admin Utama",
      email: "admin@beyondschool.sch.id",
      emailVerified: true,
      role: "ADMIN",
      phone: "081111111111",
      accounts: {
        create: {
          accountId: "admin",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Staff Verifikasi",
      email: "staff@beyondschool.sch.id",
      emailVerified: true,
      role: "STAFF",
      phone: "081111111112",
      accounts: {
        create: {
          accountId: "staff",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  const finance = await prisma.user.create({
    data: {
      name: "Keuangan",
      email: "finance@beyondschool.sch.id",
      emailVerified: true,
      role: "FINANCE",
      phone: "081111111113",
      accounts: {
        create: {
          accountId: "finance",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  const principal = await prisma.user.create({
    data: {
      name: "Kepala Sekolah",
      email: "principal@beyondschool.sch.id",
      emailVerified: true,
      role: "PRINCIPAL",
      phone: "081111111114",
      accounts: {
        create: {
          accountId: "principal",
          providerId: "credential",
          password: hashedPassword,
        },
      },
    },
  });

  const applicantUsers = await Promise.all(
    [
      { name: "Ahmad Fauzi", email: "ahmad@email.com" },
      { name: "Siti Nurhaliza", email: "siti@email.com" },
      { name: "Budi Santoso", email: "budi@email.com" },
      { name: "Dewi Lestari", email: "dewi@email.com" },
      { name: "Rizky Pratama", email: "rizky@email.com" },
      { name: "Dian Permata", email: "dian@email.com" },
      { name: "Agus Wijaya", email: "agus@email.com" },
      { name: "Rina Amelia", email: "rina@email.com" },
      { name: "Hendra Gunawan", email: "hendra@email.com" },
      { name: "Fitri Handayani", email: "fitri@email.com" },
    ].map((u, i) =>
      prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          emailVerified: i < 7,
          role: "APPLICANT",
          phone: `08123456789${i}`,
          accounts: {
            create: {
              accountId: `applicant${i}`,
              providerId: "credential",
              password: hashedPassword,
            },
          },
        },
      })
    )
  );

  // ─── PROFILES ───
  const allUsers = [admin, staff, finance, principal, ...applicantUsers];
  await Promise.all(
    allUsers.map((u) =>
      prisma.profile.create({
        data: { userId: u.id },
      })
    )
  );

  // ─── ACADEMIC PERIOD ───
  const period = await prisma.academicPeriod.create({
    data: {
      name: "Tahun Ajaran 2025/2026",
      year: 2026,
      semester: "Ganjil",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2026-07-31"),
      isActive: true,
      description: "Penerimaan Peserta Didik Baru Tahun Ajaran 2025/2026",
    },
  });

  // ─── PROGRAMS ───
  const programs = await Promise.all(
    [
      { code: "IPA", name: "Ilmu Pengetahuan Alam", capacity: 120, fee: 5000000 },
      { code: "IPS", name: "Ilmu Pengetahuan Sosial", capacity: 90, fee: 4500000 },
      { code: "BAHASA", name: "Program Bahasa", capacity: 60, fee: 4000000 },
    ].map((p) =>
      prisma.program.create({
        data: {
          academicPeriodId: period.id,
          code: p.code,
          name: p.name,
          capacity: p.capacity,
          minAge: 14,
          maxAge: 18,
          description: `Program ${p.name} - PPDB 2025/2026`,
          fee: p.fee,
          isActive: true,
        },
      })
    )
  );

  // ─── PROGRAM QUOTAS ───
  const programQuotas = await Promise.all(
    [
      { programIdx: 0, totalQuota: 60, quotaType: "ZONASI" },
      { programIdx: 0, totalQuota: 30, quotaType: "AFIRMASI" },
      { programIdx: 0, totalQuota: 30, quotaType: "PRESTASI" },
      { programIdx: 1, totalQuota: 45, quotaType: "ZONASI" },
      { programIdx: 1, totalQuota: 22, quotaType: "AFIRMASI" },
      { programIdx: 1, totalQuota: 23, quotaType: "PRESTASI" },
      { programIdx: 2, totalQuota: 30, quotaType: "ZONASI" },
      { programIdx: 2, totalQuota: 15, quotaType: "AFIRMASI" },
      { programIdx: 2, totalQuota: 15, quotaType: "PRESTASI" },
    ].map((q) =>
      prisma.programQuota.create({
        data: {
          academicPeriodId: period.id,
          programId: programs[q.programIdx].id,
          totalQuota: q.totalQuota,
          quotaType: q.quotaType,
        },
      })
    )
  );

  // ─── APPLICANTS ───
  const applicantData = [
    { firstName: "Ahmad", lastName: "Fauzi", gender: "MALE", religion: "ISLAM", birthPlace: "Jakarta", birthDate: new Date("2008-03-15"), childNumber: 1, siblingsCount: 2 },
    { firstName: "Siti", lastName: "Nurhaliza", gender: "FEMALE", religion: "ISLAM", birthPlace: "Bandung", birthDate: new Date("2008-07-22"), childNumber: 2, siblingsCount: 1 },
    { firstName: "Budi", lastName: "Santoso", gender: "MALE", religion: "ISLAM", birthPlace: "Jakarta", birthDate: new Date("2008-01-10"), childNumber: 3, siblingsCount: 3 },
    { firstName: "Dewi", lastName: "Lestari", gender: "FEMALE", religion: "ISLAM", birthPlace: "Bogor", birthDate: new Date("2008-11-05"), childNumber: 1, siblingsCount: 1 },
    { firstName: "Rizky", lastName: "Pratama", gender: "MALE", religion: "ISLAM", birthPlace: "Tangerang", birthDate: new Date("2008-05-18"), childNumber: 1, siblingsCount: 0 },
    { firstName: "Dian", lastName: "Permata", gender: "FEMALE", religion: "KRISTEN", birthPlace: "Jakarta", birthDate: new Date("2008-09-30"), childNumber: 2, siblingsCount: 2 },
    { firstName: "Agus", lastName: "Wijaya", gender: "MALE", religion: "ISLAM", birthPlace: "Depok", birthDate: new Date("2008-02-14"), childNumber: 1, siblingsCount: 1 },
    { firstName: "Rina", lastName: "Amelia", gender: "FEMALE", religion: "ISLAM", birthPlace: "Jakarta", birthDate: new Date("2008-06-20"), childNumber: 3, siblingsCount: 4 },
    { firstName: "Hendra", lastName: "Gunawan", gender: "MALE", religion: "KATOLIK", birthPlace: "Bandung", birthDate: new Date("2008-04-08"), childNumber: 2, siblingsCount: 1 },
    { firstName: "Fitri", lastName: "Handayani", gender: "FEMALE", religion: "ISLAM", birthPlace: "Jakarta", birthDate: new Date("2008-12-25"), childNumber: 1, siblingsCount: 2 },
  ];

  const applicants = await Promise.all(
    applicantData.map((a, i) => {
      const regNum = `PPDB/2026/${String(i + 1).padStart(5, "0")}`;
      return prisma.applicant.create({
        data: {
          userId: applicantUsers[i].id,
          registrationNumber: regNum,
          ...a,
        },
      });
    })
  );

  // ─── PARENTS ───
  const parentData = [
    { type: "FATHER", name: "Bapak Ahmad", phone: "081111111121", occupation: "PNS", education: "S1" },
    { type: "MOTHER", name: "Ibu Ahmad", phone: "081111111122", occupation: "Ibu Rumah Tangga", education: "SMA" },
  ];

  await Promise.all(
    applicants.flatMap((app) =>
      parentData.map((p) =>
        prisma.parent.create({
          data: {
            applicantId: app.id,
            type: p.type,
            name: p.name,
            phone: p.phone,
            occupation: p.occupation,
            education: p.education,
          },
        })
      )
    )
  );

  // ─── ADDRESSES ───
  const cities = ["Jakarta Timur", "Jakarta Barat", "Jakarta Selatan", "Jakarta Utara", "Jakarta Pusat"];
  const provinces = ["DKI Jakarta", "Jawa Barat", "Banten"];

  await Promise.all(
    applicants.map((app, i) =>
      prisma.address.create({
        data: {
          applicantId: app.id,
          type: "HOME",
          street: `Jl. Contoh No. ${i + 1}`,
          district: `Kecamatan ${i + 1}`,
          city: cities[i % cities.length],
          province: provinces[i % provinces.length],
          postalCode: `${10000 + i}`,
          isDomisili: true,
        },
      })
    )
  );

  // ─── ACADEMIC HISTORIES ───
  await Promise.all(
    applicants.map((app, i) =>
      prisma.academicHistory.create({
        data: {
          applicantId: app.id,
          level: "SMP",
          institutionName: `SMP Negeri ${i + 1} Jakarta`,
          city: "Jakarta",
          province: "DKI Jakarta",
          graduationYear: 2026,
          nisn: `123456789${i}`,
          finalGrade: 80 + Math.floor(Math.random() * 20),
          isPreviousSchool: true,
        },
      })
    )
  );

  // ─── REGISTRATIONS ───
  const statuses = ["DRAFT", "SUBMITTED", "SUBMITTED", "COMPLETED", "VERIFIED", "SUBMITTED", "SUBMITTED", "DRAFT", "COMPLETED", "VERIFIED"];

  const registrations = await Promise.all(
    applicants.map((app, i) => {
      const isSubmitted = statuses[i] !== "DRAFT";
      return prisma.registration.create({
        data: {
          applicantId: app.id,
          academicPeriodId: period.id,
          programId: programs[i % programs.length].id,
          status: statuses[i],
          stepCompleted: statuses[i] === "DRAFT" ? 0 : 5,
          submittedAt: isSubmitted ? new Date(`2026-06-${10 + i}`) : null,
          appliedAt: isSubmitted ? new Date(`2026-06-${10 + i}`) : null,
        },
      });
    })
  );

  // ─── REGISTRATION STEPS ───
  const stepNames = ["Data Pribadi", "Alamat", "Data Orang Tua", "Data Akademik", "Upload Dokumen"];
  await Promise.all(
    registrations.flatMap((reg, regIdx) =>
      stepNames.map((name, stepIdx) =>
        prisma.registrationStep.create({
          data: {
            registrationId: reg.id,
            stepNumber: stepIdx + 1,
            stepName: name,
            status: statuses[regIdx] === "DRAFT" && stepIdx > 0 ? "PENDING" : "COMPLETED",
            completedAt: statuses[regIdx] !== "DRAFT" ? new Date(`2026-06-${10 + regIdx}`) : null,
          },
        })
      )
    )
  );

  // ─── PAYMENT TYPES ───
  const paymentTypes = await Promise.all(
    [
      { code: "REGISTRATION_FEE", name: "Biaya Pendaftaran", amount: 500000, isMandatory: true },
      { code: "UNIFORM", name: "Seragam Sekolah", amount: 1500000, isMandatory: true },
      { code: "BOOKS", name: "Buku Pelajaran", amount: 1000000, isMandatory: true },
      { code: "ACTIVITY", name: "Kegiatan Ekstrakurikuler", amount: 500000, isMandatory: false },
      { code: "DONATION", name: "Sumbangan Sukarela", amount: 0, isMandatory: false },
    ].map((pt) =>
      prisma.paymentType.create({ data: pt })
    )
  );

  // ─── PAYMENTS ───
  const paymentRegistrations = registrations.filter((_, i) =>
    ["SUBMITTED", "COMPLETED", "VERIFIED", "SUBMITTED", "SUBMITTED", "COMPLETED", "VERIFIED"].includes(statuses[i])
  );

  await Promise.all(
    paymentRegistrations.map((reg, i) =>
      prisma.payment.create({
        data: {
          registrationId: reg.id,
          paymentTypeId: paymentTypes[0].id,
          invoiceNumber: `INV/${String(i + 1).padStart(6, "0")}`,
          amount: paymentTypes[0].amount,
          paidAmount: paymentTypes[0].amount,
          status: i % 2 === 0 ? "PAID" : "PENDING",
          method: i % 2 === 0 ? "TRANSFER" : null,
          paidAt: i % 2 === 0 ? new Date(`2026-06-${15 + i}`) : null,
          expiredAt: new Date("2026-08-01"),
        },
      })
    )
  );

  // ─── SELECTION RESULTS ───
  const selectionCandidates = registrations.filter((_, i) =>
    ["COMPLETED", "VERIFIED"].includes(statuses[i])
  );

  const selectionResults = await Promise.all(
    selectionCandidates.map((reg, i) =>
      prisma.selectionResult.create({
        data: {
          registrationId: reg.id,
          status: "PASSED",
          score: 80 + Math.floor(Math.random() * 20),
          rank: i + 1,
          decidedAt: new Date("2026-07-01"),
        },
      })
    )
  );

  // ─── SELECTION CRITERIA SCORES ───
  const criteria = [
    { name: "Nilai Akademik", maxScore: 100, weight: 0.5 },
    { name: "Prestasi", maxScore: 100, weight: 0.2 },
    { name: "Tes Potensi", maxScore: 100, weight: 0.3 },
  ];

  await Promise.all(
    selectionResults.flatMap((sr) =>
      criteria.map((c) =>
        prisma.selectionCriteriaScore.create({
          data: {
            selectionResultId: sr.id,
            criteriaName: c.name,
            score: 70 + Math.floor(Math.random() * 30),
            maxScore: c.maxScore,
            weight: c.weight,
          },
        })
      )
    )
  );

  // ─── NOTIFICATIONS ───
  await Promise.all(
    applicantUsers.slice(0, 5).map((u) =>
      prisma.notification.create({
        data: {
          userId: u.id,
          title: "Pendaftaran Berhasil",
          message: "Pendaftaran Anda telah berhasil dikirim. Silakan tunggu proses verifikasi.",
          type: "SUCCESS",
          isRead: false,
        },
      })
    )
  );

  await Promise.all(
    applicantUsers.slice(0, 3).map((u) =>
      prisma.notification.create({
        data: {
          userId: u.id,
          title: "Dokumen Perlu Dilengkapi",
          message: "Ada beberapa dokumen yang perlu dilengkapi. Silakan cek halaman dokumen.",
          type: "WARNING",
          isRead: false,
        },
      })
    )
  );

  // ─── NOTES (internal staff notes) ───
  await prisma.note.create({
    data: {
      userId: staff.id,
      registrationId: registrations[4].id,
      content: "Dokumen sudah lengkap, menunggu verifikasi.",
      isInternal: true,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("📧 All passwords: password123");
  console.log("👤 Users created:", allUsers.length);
  console.log("📋 Applicants created:", applicants.length);
  console.log("📝 Registrations created:", registrations.length);
  console.log("💰 Payments created:", paymentRegistrations.length);
  console.log("🏆 Selection results created:", selectionResults.length);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
