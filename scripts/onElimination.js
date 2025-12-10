import fs from "fs";
import https from "https";

// Hardcoded API key since it's temporary
const API_KEY = 'xdebhV4kVsmzMj8X';

const URLS = {
  attacksWon: `https://api.torn.com/v2/faction/contributors?stat=attackswon&key=${API_KEY}`,
  attacksLost: `https://api.torn.com/v2/faction/contributors?stat=attackslost&key=${API_KEY}`,
  hosps: `https://api.torn.com/v2/faction/contributors?stat=hosps&key=${API_KEY}`,
  cans: `https://api.torn.com/v2/faction/contributors?stat=energydrinkused&key=${API_KEY}`,
  travels: `https://api.torn.com/v2/faction/contributors?stat=traveltimes&key=${API_KEY}`
};

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch (err) {
          reject(`Failed to parse JSON: ${err}`);
        }
      });
    }).on("error", reject);
  });
}

async function fetchFactionStats() {
  const responses = await Promise.all(
    Object.entries(URLS).map(([key, url]) =>
      fetchJson(url).then(r => ({ key, data: r }))
    )
  );

  const users = {};

  for (const { key, data } of responses) {
    if (!data?.contributors) continue;

    for (const c of data.contributors) {
      if (!users[c.id]) {
        users[c.id] = {
          id: c.id,
          username: c.username,
          attacksWon: 0,
          attacksLost: 0,
          hosps: 0,
          cans: 0,
          travels: 0
        };
      }
      users[c.id][key] = c.value ?? 0;
    }
  }

  let out = "";

  for (const id of Object.keys(users).sort((a, b) => a - b)) {
    const u = users[id];

    out += `${u.id} - ${u.username}\n`;
    out += `Attacks won: ${u.attacksWon}\n`;
    out += `Attacks lost: ${u.attacksLost}\n`;
    out += `Hosps: ${u.hosps}\n`;
    out += `Cans: ${u.cans}\n`;
    out += `Travels: ${u.travels}\n\n`;
  }

  return out;
}

export async function handleEliminations(teams) {
  for (const team of teams) {
    console.log(`Creating stats file for eliminated team: ${team.name}`);

    const stats = await fetchFactionStats();

    const filename = `data/${team.name.replace(/[^a-z0-9]/gi, "_")}.txt`;

    fs.writeFileSync(filename, stats);
    console.log(`Saved faction stats to ${filename}`);
  }
}
