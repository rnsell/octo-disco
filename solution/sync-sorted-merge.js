"use strict";
// Lets not build and maintain a custom heap implementation unless theres a reason to do so.
// If I was suppose to build my own custom heap implementation then I guess I struck out on this one
// We care about the max value in the heap and its a relatively performant solution since we always care about the old log entry
const { Heap } = require("@datastructures-js/heap");
const { logSourceComparator } = require("./log-source-comparator");

// The next two functions are private functions essentially not for public consumption but I am exposing them for testing purposes
// One idea could be to add _ in front of the function name to indicate that its private or create a private namespace
// or possibly split them out into a seperate files and only expose the public functions in a roll up index.js file
// _ is a hold over from other languages to indicate a private data in a class.
const buildHeapSyncronouslyFromLogSources = ({ logSources }) => {
  const logSourceHeap = new Heap(logSourceComparator);

  // Seed the heap with at most N values onto the heap where N is the total amount of log sources
  // The heap is using references to the original array of log sources. This should reduce the amount of memory used.
  // I am going to assume the heap is not cloning the references to the log sources.
  logSources.forEach((logSource) => {
    // This try try catch is a bit redundant but its probably worth throwing a custom error if something occurs in real life
    try {
      const latestEntry = logSource.pop();
      if (latestEntry) {
        logSourceHeap.insert(logSource);
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
  });

  return logSourceHeap;
};

const printLogEntriesSync = ({ logStateHeap, printer }) => {
  let emptyHeap = logStateHeap.isEmpty();

  while (!emptyHeap) {
    const logSourceWithOldestDate = logStateHeap.extractRoot();
    printer.print(logSourceWithOldestDate.last);

    emptyHeap = logStateHeap.isEmpty();

    if (!emptyHeap) {
      // This try try catch is a bit redundant but its probably worth throwing a custom error if something occurs in real life
      try {
        const latestEntry = logSourceWithOldestDate.pop();

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

const syncSortedSolution = (logSources, printer) => {
  const logStateHeap = buildHeapSyncronouslyFromLogSources({ logSources });

  printLogEntriesSync({ logStateHeap, printer });

  return console.log("Sync sort complete.");
};

// Changed this to export an object. In the event a module grows in size its sometimes necessary to export multiple things especially for testing purposes.
// It also create a searchable name for the code in the module that is being exported in the event a persons IDE doesn't support reference checking.
module.exports = {
  buildHeapSyncronouslyFromLogSources,
  printLogEntriesSync,
  syncSortedSolution,
};
