import { promises as fs } from "node:fs";

export const deleteFileFromDir = (file) => {
  fs.unlink("uploads/" + file.filename, (err) => {
    if (err) {
      console.error(`Error removing file: ${err}`);
      return;
    }

    console.log(`File ${file.filename} has been successfully removed.`);
  });
};

export const deletePdfImagesFromDir = (filename) => {
  fs.unlink(filename, (err) => {
    if (err) {
      console.error(`Error removing file: ${err}`);
      return;
    }

    console.log(`File ${filename} has been successfully removed.`);
  });
};

export const deletePdfFromDir = (filename) => {
  fs.unlink(filename, (err) => {
    if (err) {
      console.error(`Error removing file: ${err}`);
      return;
    }

    console.log(`File ${filename} has been successfully removed.`);
  });
};
