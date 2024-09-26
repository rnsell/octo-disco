"use strict";
const { Heap } = require("@datastructures-js/heap");
const {
  LogSourceState,
  logSourceStateComparator,
} = require("./log-source-state");
const bluebird = require("bluebird");

// Its probably not a good idea to allow for unlimited promises to resolve conncurrently
// There could be other solutions worth evalutating such as using a rate limiter to control the amount of promises that can resolve concurrently
// while also setting a max read limit depending on the type of sources we're reading from
const MAX_NUMBER_OF_CONCURRENT_PROMISES = 10;
// Print all entries, across all of the *async* sources, in chronological order.
// This function was converted to async await to simplify the code
const asyncSortedSolution = async (asyncLogSources, printer) => {
  const logStateHeap = new Heap(logSourceStateComparator);

  // Seed the heap with values from the async log sources.
  // we need each to resolve before we can start printing them
  // We don't want to allow an infinite amount of concurrent promises to resolve
  // so we'll limit the amount of promises that can resolve concurrently
  // a recommendation for at a later time is to let a developer set a config value for this
  await bluebird.each(
    asyncLogSources,
    // Async await does simplify the code a bit vs using promises
    async (currentLogSource, i) => {
      const logEntry = await currentLogSource.popAsync();
      const initialState = logEntry
        ? new LogSourceState(false, logEntry, i)
        : new LogSourceState(true, null, i);

      if (!initialState.drained) {
        logStateHeap.insert(initialState);
      }
    },
    { concurrency: MAX_NUMBER_OF_CONCURRENT_PROMISES }
  );

  let emptyHeap = logStateHeap.isEmpty();

  while (!emptyHeap) {
    const latestLogEntry = logStateHeap.extractRoot();
    printer.print(latestLogEntry.logEntry);

    emptyHeap = logStateHeap.isEmpty();

    if (!emptyHeap) {
      const sourceIndex = latestLogEntry.logSourceIndex;
      const logSourceToExtraNewRecord = asyncLogSources[sourceIndex];
      // We need to wait for the promise to resolve before we can continue
      const newLogEntry = await logSourceToExtraNewRecord.popAsync();
      const drained = !newLogEntry;
      const newState = new LogSourceState(drained, newLogEntry, sourceIndex);
      // if the log source is not drained, we need to insert the new state into the heap
      if (!newState.drained) {
        logStateHeap.insert(newState);
      }
    }
  }

  console.log("Async sort complete.");
};

module.exports = {
  asyncSortedSolution,
};
