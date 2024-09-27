import { PropertyDescription, DataType } from "../../../utilities/property-extractor/description-extractor";

export class OtherMeta {
   @PropertyDescription('Name')
   @DataType("Title")
   public name: string = '';

   @PropertyDescription('FirstLineOFContent')
   @DataType("FirstLineOFContent")
   public content: string = '';
}