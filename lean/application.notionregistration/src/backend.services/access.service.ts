import * as fs from 'fs';
import * as path from 'path';
import { ClientAuthorization } from './client-authorization.entity';

export class AccessService {
   static STORAGE_DIR = 'D:/assets/';

   constructor(private userIdentity: string) {}

   // Method to retrieve access token from a JSON file
   retrieveAccessToken(): ClientAuthorization | null {
      const sanitizedUserIdentity = this.sanitizeUserIdentity(this.userIdentity);
      const filePath = path.join(AccessService.STORAGE_DIR, `client_authorization_${sanitizedUserIdentity}.json`);

      // Check if the file exists
      if (!fs.existsSync(filePath)) {
         return null;  // Return null if the file doesn't exist
      }

      // Read and parse the file content synchronously
      const fileData = fs.readFileSync(filePath, 'utf-8');
      const clientAuthorization: ClientAuthorization = JSON.parse(fileData);

      return clientAuthorization;
   }

   // Method to store the access token as JSON in a file
   storeAccessToken(clientAuthorization: ClientAuthorization): void {
      const sanitizedUserIdentity = this.sanitizeUserIdentity(this.userIdentity);
      const filePath = path.join(AccessService.STORAGE_DIR, `client_authorization_${sanitizedUserIdentity}.json`);

      // Ensure the directory exists
      this.ensureDirectoryExists();

      // Save the new client authorization (overwrite existing if needed)
      const jsonData = JSON.stringify(clientAuthorization, null, 2);
      fs.writeFileSync(filePath, jsonData, 'utf-8');
   }

   // Ensures that the storage directory exists, creates it if it doesn't
   private ensureDirectoryExists(): void {
      const dirPath = path.dirname(path.join(AccessService.STORAGE_DIR, `client_authorization_${this.userIdentity}.json`));

      try {
         // Create directory if it doesn't exist (synchronously)
         if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
         }
      } catch (error) {
         // @ts-ignore
         throw new Error(`Failed to ensure directory exists: ${error.message}`);
      }
   }

   // Sanitizes the user identity to remove invalid characters for file paths
   private sanitizeUserIdentity(userIdentity: string): string {
      // Replace characters that are not valid in file names
      return userIdentity.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
   }
}
