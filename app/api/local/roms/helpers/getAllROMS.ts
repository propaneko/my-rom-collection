import fs from "fs";
import path from "path";
import { Media } from "../types";

export type ROMEntry = fs.Dirent &
  fs.Stats & {
    fullPath: string;
    system: string;
    extension: string;
    metadata?: {
      title?: string;
      description?: string;
      media?: Media[];
      id: string;
      systemId: string;
      systemName?: string;
    };
  };

export type ROMFileObject = Record<string, ROMEntry[]>;

const getAllROMS = async () => {
  const romsPath = process.env.ROMS_PATH;
  if (!romsPath) {
    throw new Error("ROMS_PATH is not defined in environment variables.");
  }
  const allowedExtensions = [
    "nes",
    "smc",
    "sfc",
    "gba",
    "gb",
    "gbc",
    "n64",
    "z64",
    "v64",
    "bin",
    "iso",
    "cue",
    "img",
    "md",
    "chd",
    "wad"
  ];

  const directoryToSystemMap: Record<string, string> = {
    nes: "NES",
    snes: "Super Nintendo",
    gba: "Game Boy Advance",
    gb: "Game Boy",
    gbc: "Game Boy Color",
    n64: "Nintendo 64",
    psx: "PlayStation",
    psp: "PSP",
    megadrive: "Genesis",
    ps2: "PlayStation 2",
    dreamcast: "Dreamcast",
    c64: "Commodore 64",
    doom: "PC Dos"
  };

  const fileObject: ROMFileObject = {};

  try {
    const getFiles = await fs.promises.readdir(romsPath, {
      withFileTypes: true,
    });

    const filteredDirectories = getFiles.filter(
      (file) => file.isDirectory() && !file.name.startsWith("."),
    );

    for (const directory of filteredDirectories) {
      const currentDirectory = await fs.promises.readdir(
        `${directory.parentPath}/${directory.name}`,
      );
      if (currentDirectory.length === 0) continue;
      if (!directory) continue;

      const filesFromDirectory = await fs.promises.readdir(
        `${romsPath}/${directory.name}`,
        { withFileTypes: true },
      );

      for (const file of filesFromDirectory) {
        const fileExtension = file.name.split(".").pop()?.toLowerCase();
        if (fileExtension && allowedExtensions.includes(fileExtension)) {
          if (!fileObject[directory.name]) {
            fileObject[directory.name] = [];
          }

          const fullFilePath = path.join(romsPath, directory.name, file.name);
          const stat = await fs.promises.stat(fullFilePath);

          const nameWithoutExt =
            file.name.slice(0, file.name.lastIndexOf(".")) || file.name;

          const cleanedName = nameWithoutExt
            .replace(/\s*\([^()]*\)/g, "") // removes (USA), (Europe) (En,Fr), (v1.1), etc.
            .replace(/\s+/g, " ")
            .trim();

          fileObject[directory.name].push({
            ...file,
            name: cleanedName || file.name,
            fullPath: fullFilePath,
            system: directoryToSystemMap[directory.name] || "Unknown",
            extension: fileExtension,
            ...stat,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error reading ROMs directory:", error);
    throw error;
  }

  return fileObject;
};

export { getAllROMS };
