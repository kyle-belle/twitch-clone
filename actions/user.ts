"use server";

import { User } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { getSelf } from "@/lib/auth-service";

export const updateUser = async (values: Partial<User>) => {
  const self = await getSelf();

  const validData = {
    bio: values.bio,
  };

  const user = await db.user.update({
    where: { id: self.id },
    data: { ...validData },
  });

  revalidatePath(`/${self.username}`);
  revalidatePath(`/u/${self.username}`);

  return user;
};

export const getUserUploads = async () => {
  const self = await getSelf();

  if (self) {
    const uploads = await db.upload.findMany({
      where: { userId: self.id },
      orderBy: { createdAt: "desc" },
    });

    return uploads;
  }

  return [];
};

export const addUserUpload = async (filepath: string) => {
  const self = await getSelf();

  if (!self) {
    throw new Error("User not found");
  }

  const newUplad = await db.upload.create({
    data: { filepath, userId: self.id },
  });

  revalidatePath(`/${self.username}`);
  revalidatePath(`/u/${self.username}`);

  return newUplad;
};
