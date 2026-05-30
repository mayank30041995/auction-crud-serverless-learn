import { getEndedAuctions } from "../lib/getEndedAuctions.mjs";

async function processAuctions(event, context) {
  const auctionsToClose = await getEndedAuctions();
  console.log(auctionsToClose);
}

export const handler = processAuctions;

// sls invoke -f processAuctions -l
