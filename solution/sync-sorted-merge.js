"use strict";
// Lets not build and maintain a custom heap implementation unless theres a business reason to do so.
// We care about the max value in the heap and its a relatively performant solution since we always care about the max log entry
const { Heap } = require("@datastructures-js/heap");
const {
  LogSourceState,
  logSourceStateComparator,
} = require("./log-source-state");

const syncSortedSolution = (logSources, printer) => {
  const totalSources = logSources.length;
  const logStateHeap = new Heap(logSourceStateComparator);

  // Seed the heap with at most N values onto the heap where N is the total amount of log sources
  // Lets assume for now that the one record from each log source can fit into the total memory
  // of this machine. This should be adjustable via node memory settings.
  for (let i = 0; i < totalSources; i++) {
    const currentLogSource = logSources[i];
    const logEntry = currentLogSource.pop();
    const drained = !logEntry;

    const initialState = new LogSourceState(drained, logEntry, i);

    if (!initialState.drained) {
      logStateHeap.insert(initialState);
    }
  }

  let emptyHeap = logStateHeap.isEmpty();

  while (!emptyHeap) {
    const mostActiveLogEntry = logStateHeap.extractRoot();
    printer.print(mostActiveLogEntry.logEntry);

    emptyHeap = logStateHeap.isEmpty();

    if (!emptyHeap) {
      const sourceIndex = mostActiveLogEntry.logSourceIndex;
      const logSourceToExtraNewRecord = logSources[sourceIndex];
      const newLogEntry = logSourceToExtraNewRecord.pop();
      const drained = !newLogEntry;

      const newState = new LogSourceState(drained, newLogEntry, sourceIndex);
      // if the log source is
      if (!newState.drained) {
        logStateHeap.insert(newState);
      }
    }
  }

  return console.log("Sync sort complete.");
};

// Changed this to export an object. In the event a module grows in size its sometimes necessary to export multiple things.
// This allows for more flexibility in the future, without having to do massive module refactoring in PRs on file imports.
// It also create a searchable name for the code in the module that is being exported in the event a persons IDE doesn't support reference checking.
module.exports = {
  syncSortedSolution,
};
