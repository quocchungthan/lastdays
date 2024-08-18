import { BackupMongoDb } from './open-ai/backup/backup-mongodb';
import { IDependenciesPool } from './meta/backup-storage.inteface';
import { loadSecretConfiguration } from './meta/configuration.serve';
import { DisabledStorage } from './meta/disabledDependencies';

const { useBackup } = loadSecretConfiguration();

export const dependenciesPool: IDependenciesPool = {
    backup () {
        return useBackup ? new BackupMongoDb() : new DisabledStorage()
    }
}