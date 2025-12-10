import fs from "fs";
import fetch from "node-fetch";

const STATE_FILE = "data/last_state.json";
const API_URL = "https://api.torn.com/v2/torn/elimination?key=li0qoJSKMsD1xmVr";

async function main() {
  const response = await fetch(API_URL);
  const data = await response.json();

  const newState = data.elimination;
  let oldState = [];

  if (fs.existsSync(STATE_FILE)) {
    oldState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  }

  const eliminatedTeams = [];

  for (const team of newState) {
    const prev = oldState.find(t => t.id === team.id);

    if (prev && !prev.eliminated && team.eliminated) {
      eliminatedTeams.push(team);
    }
  }

  if (eliminatedTeams.length > 0) {
    console.log("New eliminations detected:", eliminatedTeams.map(t => t.name));
    const { handleEliminations } = await import("./onElimination.js");
    await handleEliminations(eliminatedTeams);
  }

  fs.writeFileSync(STATE_FILE, JSON.stringify(newState, null, 2));
}

console.log("Checking elimination status");
main();

import { handleEliminations } from "./onElimination.js";

await handleEliminations([{ id: 9997, name: "Test Team3" }]);
