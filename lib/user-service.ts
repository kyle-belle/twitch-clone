import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs";
import { Prisma } from "@prisma/client";

export const getUserByUsername = async (username?: string) => {
  const userSelect = {
    id: true,
    externalUserId: true,
    username: true,
    bio: true,
    imageUrl: true,
    stream: {
      select: {
        id: true,
        isLive: true,
        isChatDelayed: true,
        isChatEnabled: true,
        isChatFollowersOnly: true,
        thumbnailUrl: true,
        name: true,
        egresses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    },
    _count: {
      select: {
        followedBy: true,
      },
    },
  };

  let user;

  if (username) {
    user = await db.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
        externalUserId: true,
        username: true,
        bio: true,
        imageUrl: true,
        stream: {
          select: {
            id: true,
            isLive: true,
            isChatDelayed: true,
            isChatEnabled: true,
            isChatFollowersOnly: true,
            thumbnailUrl: true,
            name: true,
            egresses: {
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        _count: {
          select: {
            followedBy: true,
          },
        },
      },
    });
  } else {
    const self = await currentUser();

    if (self) {
      user = await db.user.findUnique({
        where: { externalUserId: self.id },
        select: {
          id: true,
          externalUserId: true,
          username: true,
          bio: true,
          imageUrl: true,
          stream: {
            select: {
              id: true,
              isLive: true,
              isChatDelayed: true,
              isChatEnabled: true,
              isChatFollowersOnly: true,
              thumbnailUrl: true,
              name: true,
              egresses: {
                orderBy: {
                  createdAt: "desc",
                },
              },
            },
          },
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
      });

      return user;
    } else {
      return null;
    }
  }

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const getUserById = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      stream: true,
    },
  });

  return user;
};
