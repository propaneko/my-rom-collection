declare global {
  interface BigInt {
    toJSON(): string;
  }
}

BigInt.prototype.toJSON = function () {
  return this.toString();
};

import { NextResponse, type NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getAllROMS } from "./helpers/getAllROMS";
import { groupBy } from "lodash";

export async function GET(request: NextRequest) {
  if (request.method !== "GET") {
    return new NextResponse("Method Not Allowed", { status: 405 });
  }

  try {
    const allRoms = await getAllROMS();

    for (const romFiles of Object.values(allRoms)) {
      for (const rom of romFiles) {
        await prisma.rom.upsert({
          where: { ino: rom.ino },
          update: {
            name: rom.name,
            parentPath: rom.parentPath,
            fullPath: rom.fullPath,
            size: rom.size,
            system: rom.system,
            extension: rom.extension,
          },
          create: {
            ino: rom.ino,
            name: rom.name,
            parentPath: rom.parentPath,
            fullPath: rom.fullPath,
            size: rom.size,
            system: rom.system,
            extension: rom.extension,
          },
        });
      }
    }

    const romsResponse = groupBy(
      await prisma.rom.findMany({ include: { metadata: true } }),
      "system",
    );

    return NextResponse.json({ result: romsResponse }, { status: 200 });
  } catch (error) {
    return new NextResponse(`Internal Server Error: ${error}`, { status: 500 });
  }
}
