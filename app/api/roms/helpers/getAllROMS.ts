import fs from "fs";


export type ROMEntry = fs.Dirent & fs.Stats & {
  fullPath: string;
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
  ];

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

          const stat = await fs.promises.stat(
            `${romsPath}/${directory.name}/${file.name}`,
          );

          fileObject[directory.name].push({
            ...file,
            name: file.name.split(".")[0],
            fullPath: `${romsPath}/${directory.name}/${file.name}`,
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
