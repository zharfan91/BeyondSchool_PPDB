import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password harus diisi"),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
});

export const personalDataSchema = z.object({
  firstName: z.string().min(1, "Nama depan harus diisi"),
  lastName: z.string().optional(),
  birthPlace: z.string().min(1, "Tempat lahir harus diisi"),
  birthDate: z.string().min(1, "Tanggal lahir harus diisi"),
  gender: z.enum(["MALE", "FEMALE"]),
  religion: z.string().min(1, "Agama harus diisi"),
});

export const addressSchema = z.object({
  street: z.string().min(1, "Alamat harus diisi"),
  village: z.string().optional(),
  subDistrict: z.string().optional(),
  district: z.string().min(1, "Kecamatan harus diisi"),
  city: z.string().min(1, "Kota harus diisi"),
  province: z.string().min(1, "Provinsi harus diisi"),
  postalCode: z.string().min(5, "Kode pos harus diisi"),
});

export const parentSchema = z.object({
  fatherName: z.string().min(1, "Nama ayah harus diisi"),
  fatherPhone: z.string().min(10, "Nomor WA ayah minimal 10 digit"),
  motherName: z.string().min(1, "Nama ibu harus diisi"),
  motherPhone: z.string().min(10, "Nomor WA ibu minimal 10 digit"),
});
