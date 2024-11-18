import axios from "axios";

// Function to search for pages
export async function searchPages(access_token: string) {
  try {
    const response = await axios.post(
      'https://api.notion.com/v1/search',
      {
        query: '',  // Optional: Empty query to return all pages
        filter: {
          property: 'object',
          value: 'page',
        },
      },
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Notion-Version': '2021-05-13', // Make sure to use the correct API version
        },
      }
    );

    // Return the pages found in the workspace
    return response.data.results;  // This will contain the list of pages
  } catch (error) {
    console.error('Error searching pages:', error);
    throw new Error('Failed to search pages');
  }
}

export function mapNotionPages(pages: any[]) {
   return pages.map(page => {
     const title = page.properties.title.title[0]?.plain_text || 'No Title'; // Get the title (fallback if not found)
     const icon = page.icon?.external?.url || null; // Get the icon link (null if not available)
     const color = page.icon?.external?.color || null; // Assuming color could be within the icon (check this if needed)
 
     return {
       id: page.id,          // The page ID
       name: title,          // The page title (name)
       icon: icon,           // The icon URL
       color: color          // The color (if available in the icon object)
     };
   });
 }