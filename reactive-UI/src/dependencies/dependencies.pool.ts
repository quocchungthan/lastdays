import { BackupMongoDb } from './open-ai/backup/backup-mongodb';
import { IDependenciesPool } from './meta/backup-storage.inteface';
import { loadSecretConfiguration } from './meta/configuration.serve';
import { DisabledStorage } from './meta/disabledDependencies';
import BackupWithJsonFileService from '@ai/backup/backup-json-file';
import { ConsoleLogger } from '@com/connection.manager';

const { useBackup } = loadSecretConfiguration();

export const dependenciesPool: IDependenciesPool = {
    _logger: undefined,
    _backupService: undefined,
    backup () {
        if (!this._backupService) {
            this._backupService = useBackup ? new BackupWithJsonFileService() : new DisabledStorage();
        }

        return this._backupService;
    },
    logger() {
        if (!this._logger) {
            this._logger = new ConsoleLogger();
        }

        return this._logger;
    }
}