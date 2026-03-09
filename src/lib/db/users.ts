// src/lib/db/users.ts
import prisma from "@/lib/prisma";

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}
// export async function getUserById(userId: string) {
//   return await prisma.user.findUnique({
//     where: { id: userId },
//   });
// }
// export async function createUser(data: {
//   email: string;
//   username: string;
//   password: string;
// }) {
//   return await prisma.user.create({
//     data: {
//       email: data.email,
//       username: data.username,
//       password: data.password, // Ensure this is hashed before saving
//     },
//   });
// }
// export async function updateUser(userId: string, data: Partial<{
//   email: string;
//   username: string;
//   password: string;
// }>) {
//   return await prisma.user.update({
//     where: { id: userId },
//     data: {
//       ...data,
//       // Ensure password is hashed if provided
//       ...(data.password && { password: data.password }),
//     },
//   });
// }
// export async function deleteUser(userId: string) {
//   return await prisma.user.delete({
//     where: { id: userId },
//   });
// }
// export async function getAllUsers() {
//   return await prisma.user.findMany();
// }
// export async function getUserByUsername(username: string) {
//   return await prisma.user.findUnique({
//     where: { username },
//   });
// }
// export async function getUserByPhone(phone: string) {
//   return await prisma.user.findUnique({
//     where: { phone },
//   });
// }
// export async function getUserByAddress(address: string) {
//   return await prisma.user.findUnique({
//     where: { address },
//   });
// }
// export async function getUserByZipCode(zip: string) {
//   return await prisma.user.findUnique({
//     where: { zip },
//   });
// }
// export async function getUserByCity(city: string) {
//   return await prisma.user.findUnique({
//     where: { city },
//   });
// }
// export async function getUserByState(state: string) {
//   return await prisma.user.findUnique({
//     where: { state },
//   });
// }
// export async function getUserByCountry(country: string) {       
//   return await prisma.user.findUnique({
//     where: { country },
//   });
// }
// export async function getUserByCreditCard(cardNumber: string) {
//   return await prisma.user.findUnique({
//     where: { creditCard: cardNumber },
//   });
// }    
