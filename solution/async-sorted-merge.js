"use strict";
const { Heap } = require("@datastructures-js/heap");
const { logSourceComparator } = require("./log-source-comparator");
const bluebird = require("bluebird");

// The next two functions are private functions essentially not for public consumption but I am exposing them for testing purposes
// One idea could be to add _ in front of the function name to indicate that its private or create a private namespace
// or possibly split them out into a seperate files and only expose the public functions in a roll up index.js file
// _ is a hold over from other languages to indicate a private function.

// We don't want to allow an infinite amount of concurrent promises to resolve
// This could be a config value that a developer could set
const MAX_NUMBER_OF_CONCURRENT_PROMISES = 10;
const buildHeapAsyncronouslyFromLogSources = async ({ asyncLogSources }) => {
  const logStateHeap = new Heap(logSourceComparator);
  // Seed the heap with values from the async log sources.
  // we need each to resolve before we can start printing them
  // We don't want to allow an infinite amount of concurrent promises to resolve
  // so we'll limit the amount of promises that can resolve concurrently
  // a recommendation for at a later time is to let a developer set a config value for this
  await bluebird.each(
    asyncLogSources,
    // Async await does simplify the code a bit vs using promises
    async (logSource) => {
      try {
        const latestEntry = await logSource.popAsync();

        if (latestEntry) {
          logStateHeap.insert(logSource);
        }
      } catch (error) {
        console.error(
          "Error occurred while trying to read from the log source",
          error
        );
        throw new Error(
          "Error occurred while trying to read from the log source"
        );
      }
    },
    { concurrency: MAX_NUMBER_OF_CONCURRENT_PROMISES }
  );

  return logStateHeap;
};

// with async await this is pretty much the exact same alg as the sync version
// The only difference is that we are using async await to handle the promises
// the example code doesn't throw an error nor give any indications of what to do if an error occurs
const printLogEntriesAsync = async ({ logStateHeap, printer }) => {
  let emptyHeap = logStateHeap.isEmpty();

  while (!emptyHeap) {
    const logSourceWithOldestDate = logStateHeap.extractRoot();
    printer.print(logSourceWithOldestDate.last);

    emptyHeap = logStateHeap.isEmpty();

    if (!emptyHeap) {
      try {
        const latestEntry = await logSourceWithOldestDate.popAsync();

        if (latestEntry) {
          logStateHeap.insert(logSourceWithOldestDate);
        }
      } catch (error) {
        console.error(
          "Error occurred while trying to read from the log source",
          error
        );
        throw new Error(
          "Error occurred while trying to read from the log source"
        );
      }
    }
  }
};

// Print all entries, across all of the *async* sources, in chronological order.
// This function was converted to async await to simplify the code
const asyncSortedSolution = async (asyncLogSources, printer) => {
  const logStateHeap = await buildHeapAsyncronouslyFromLogSources({
    asyncLogSources,
  });

  await printLogEntriesAsync({ logStateHeap, asyncLogSources, printer });

  console.log("Async sort complete.");
};

module.exports = {
  asyncSortedSolution,
  printLogEntriesAsync,
  buildHeapAsyncronouslyFromLogSources,
};
