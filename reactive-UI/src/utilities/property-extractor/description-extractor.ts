import "reflect-metadata";

export function PropertyDescription(description: string) {
    return function (target: any, propertyKey: string) {
        // Store the description in metadata
        Reflect.defineMetadata("description", description, target, propertyKey);
    };
}

export function DataType(description: string) {
   return function (target: any, propertyKey: string) {
       // Store the description in metadata
       Reflect.defineMetadata("dataType", description, target, propertyKey);
   };
}

// Example usage of the decorator
class ExampleClass {
    @PropertyDescription("This is the name of the user.")
    name: string = '';

    @PropertyDescription("This is the age of the user.")
    age: number = 0;
}

// Function to get property descriptions
export function getPropertyDescriptions(target: any) {
    const descriptions: { [key: string]: string } = {};
    
    for (const key of Object.keys(target)) {
        const description = Reflect.getMetadata("description", target, key);
        if (description) {
            descriptions[key] = description;
        }
    }

    return descriptions;
}

// Function to get property dataTypes
export function getPropertyDataTypes(target: any) {
   const descriptions: { [key: string]: string } = {};
   
   for (const key of Object.keys(target)) {
       const description = Reflect.getMetadata("dataType", target, key);
       if (description) {
           descriptions[key] = description;
       }
   }

   return descriptions;
}

// Example of extracting descriptions
const example = new ExampleClass();
const descriptions = getPropertyDescriptions(example);
console.log(descriptions);
