import { EnvironmentProviders, Provider } from "@angular/core";
import { BackendConfigurationService } from "../configurations/backend-configuration.service";
import { GolfStationsService } from "../switching-services-attempts/golf-stations.service";
import { IqStationsService } from "../switching-services-attempts/iq-stations.service";
import { IStationsService, TOKEN } from "./services/3rds/i-stations.service";

export const provideStationsService = () : Provider | EnvironmentProviders => ({
  provide: TOKEN,
  useFactory:
    (
      configService: BackendConfigurationService,
      golfService: IStationsService,
      iqService: IStationsService
    ) => configService.isGolf ? golfService : iqService,
  deps: [BackendConfigurationService, GolfStationsService, IqStationsService],
});
