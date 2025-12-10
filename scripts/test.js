import { handleEliminations } from "./onElimination.js";

async function test() {
  const fakeTeams = [
    { id: 9998, name: "Test Team2" }
  ];

  await handleEliminations(fakeTeams);
  console.log("Test complete!");
}

test();
