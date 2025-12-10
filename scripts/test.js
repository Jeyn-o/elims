import { handleEliminations } from "./onElimination.js";

async function test() {
  const fakeTeams = [
    { id: 9999, name: "Test Team" }
  ];

  await handleEliminations(fakeTeams);
  console.log("Test complete!");
}

test();
