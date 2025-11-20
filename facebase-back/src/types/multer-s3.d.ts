import { File as MulterFile } from "multer";

interface S3File extends MulterFile {
  bucket: string;
  key: string;
  acl?: string;
  contentType?: string;
  contentDisposition?: string;
  storageClass?: string;
  serverSideEncryption?: string;
  metadata?: any;
  location: string;
  etag?: string;
}

declare global {
  namespace Express {
    interface Request {
      file?: S3File;
      files?:
        | {
            [fieldname: string]: S3File[];
          }
        | S3File[];
    }
  }
}
