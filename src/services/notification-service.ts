import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export const notificationService = {
  async create(data: {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        type: data.type || "INFO",
        link: data.link,
      },
    });
  },

  async findByUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  },

  async markAsRead(id: string) {
    return prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  },

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  },
};
