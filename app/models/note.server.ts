import type { User, Note } from "@prisma/client";

import { prisma } from "~/db.server";

import { EventEmitter } from "node:events";

export type { Note } from "@prisma/client";

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

myEmitter.on("note.created", (params) => {
  console.log("a new note was created", params);
});

prisma.$use(async (params, next) => {
  // const before = Date.now();

  const result = await next(params);

  // const after = Date.now();

  // console.log(
  //   `Query ${params.model}.${params.action} took ${after - before}ms`
  // );

  if (`${params.model}.${params.action}` === "Note.create") {
    // console.log("New note created");
    myEmitter.emit("note.created", params);
  }

  return result;
});

export function getNote({
  id,
  userId,
}: Pick<Note, "id"> & {
  userId: User["id"];
}) {
  return prisma.note.findFirst({
    select: { id: true, body: true, title: true },
    where: { id, userId },
  });
}

export function getNoteListItems({ userId }: { userId: User["id"] }) {
  return prisma.note.findMany({
    where: { userId },
    select: { id: true, title: true },
    orderBy: { updatedAt: "desc" },
  });
}

export function createNote({
  body,
  title,
  userId,
}: Pick<Note, "body" | "title"> & {
  userId: User["id"];
}) {
  return prisma.note.create({
    data: {
      title,
      body,
      user: {
        connect: {
          id: userId,
        },
      },
    },
  });
}

export function deleteNote({
  id,
  userId,
}: Pick<Note, "id"> & { userId: User["id"] }) {
  return prisma.note.deleteMany({
    where: { id, userId },
  });
}
