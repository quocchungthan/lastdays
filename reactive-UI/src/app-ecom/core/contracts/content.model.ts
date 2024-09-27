import { DataType, PropertyDescription } from "../../../utilities/property-extractor/description-extractor";

export class Content {
   @PropertyDescription('Name')
   @DataType("Title")
   public pageTitle: string = '';

   @PropertyDescription('inverted indices')
   @DataType("MultiSelect")
   public keywords: string[] = [];

   @PropertyDescription('inverted indices')
   @DataType("Text")
   public descriptiveKey: string = '';

   @PropertyDescription('OG:description')
   @DataType("Text")
   public ogDescription: string = '';

   @PropertyDescription('PictureUrl')
   @DataType("Text")
   public previewPictureUrl: string = '';
}