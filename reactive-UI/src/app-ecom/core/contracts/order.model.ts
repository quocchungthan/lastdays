import { PropertyDescription, DataType } from "../../../utilities/property-extractor/description-extractor";

export class Order {
   @PropertyDescription('ThreadId')
   @DataType("Title")
   public threadId: string = '';

   @PropertyDescription('phonenumber')
   @DataType("Text")
   public phoneNumber: string[] = [];

   @PropertyDescription('clien name')
   @DataType("Text")
   public clientName: string = '';

   @PropertyDescription('amount estimated')
   @DataType("Number")
   public amountEstimated: string = '';

   @PropertyDescription('status')
   @DataType("MultiSelect")
   public status: string[] = [];
}