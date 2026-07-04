const apiKey = process.argv[2];

if (!apiKey) {
  console.log("Usage: node scratch/find_bible_id.js <YOUR_API_KEY>");
  process.exit(1);
}

console.log("Fetching available Bibles from API.Bible...");

fetch("https://api.scripture.api.bible/v1/bibles", {
  headers: { "api-key": apiKey }
})
  .then(res => {
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  })
  .then(payload => {
    const list = payload.data || [];
    console.log(`\nFound ${list.length} bibles. Filtering for Catholic or RSV translations:\n`);
    console.log("--------------------------------------------------------------------------------");
    console.log("ID\t\t\t\tABBREVIATION\tNAME");
    console.log("--------------------------------------------------------------------------------");
    
    const matches = list.filter(b => 
      b.name.toLowerCase().includes("catholic") || 
      b.name.toLowerCase().includes("rsv") || 
      b.abbreviation.toLowerCase().includes("catholic") || 
      b.abbreviation.toLowerCase().includes("rsv")
    );
    
    if (matches.length === 0) {
      console.log("No specific matches found. Here are the first 15 bibles available in your plan:\n");
      list.slice(0, 15).forEach(b => {
        console.log(`${b.id}\t\t${b.abbreviation}\t\t${b.name}`);
      });
    } else {
      matches.forEach(b => {
        console.log(`${b.id}\t\t${b.abbreviation}\t\t${b.name}`);
      });
    }
  })
  .catch(err => {
    console.error("Error fetching bibles:", err.message);
  });
