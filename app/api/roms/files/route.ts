import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAllROMS } from "../helpers/getAllROMS";
import { groupBy } from "lodash"

export async function GET(request: NextRequest) {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const allRoms = await getAllROMS();

    for (const [directoryPath, romFiles] of Object.entries(allRoms)) {
      for (const rom of romFiles) {
        await prisma.rom.upsert({
          where: { ino: rom.ino },
          update: {},
          create: {
            ino: rom.ino,
            name: rom.name,
            parentPath: rom.parentPath,
            fullPath: rom.fullPath,
            size: rom.size,
            system: directoryPath
          }
        });
      }
    }

    const romsResponse = groupBy(await prisma.rom.findMany(), "system");

    return Response.json({ result: romsResponse }, { status: 200 });
  } catch (error) {
    return new Response(`Internal Server Error: ${error}`, { status: 500 });
  }
}
