import type { File as MulterFile } from "multer";

declare global {
  namespace Express {
    export interface Request {
      files?: {
        [fieldname: string]: MulterFile[];
      };
    }
  }
}
