import { IConfiguration } from "./contracts/configuration.interface";
import { IContentRespository } from "./contracts/content.repository.interface";
import { IOrdersRespository } from "./contracts/orders.repository.interface";
import { IOtherMetaRespository } from "./contracts/other-meta.repository.interface";
import { ContentRepository } from "./implementation-notion/content.repository";
import { OrdersRepository } from "./implementation-notion/order.repository";
import { OtherMetaRepository } from "./implementation-notion/other-meta.repository";
import { loadSecretConfiguration } from "./meta/configuration.serve";

class DependenciesPool {
   private _secret?: IConfiguration;
   private _otherMetaRepository?: IOtherMetaRespository;
   private _ordersRepository?: IOrdersRespository;
   private _contentRepository?: IContentRespository;

   getSecret() {
      if (!this._secret) {
         this._secret = loadSecretConfiguration();
      }

      return this._secret;
   }

   getMetaRepository() {
      if (!this._otherMetaRepository) {
         this._otherMetaRepository = new OtherMetaRepository();
      }

      return this._otherMetaRepository;
   }

   getContentRepository() {
      if (!this._contentRepository) {
         this._contentRepository = new ContentRepository();
      }

      return this._contentRepository;
   }

   getOrdersRepository() {
      if (!this._ordersRepository) {
         this._ordersRepository = new OrdersRepository();
      }

      return this._ordersRepository;
   }

   clear() {
      // this._secret?.clear();
      // this._otherMetaRepository?.clear();
      // this._ordersRepository?.clear();
      // this._contentRepository?.clear();
   }
}

export const pool = new DependenciesPool();