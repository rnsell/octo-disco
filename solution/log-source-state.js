class LogSourceState {
  constructor(drained, logEntry, logSourceIndex) {
    this.drained = drained;
    this.logEntry = logEntry;
    // This lets us know which log source to get a new value from once its removed from the heap
    this.logSourceIndex = logSourceIndex;
  }
}

const logSourceStateComparator = (state1, state2) => {
  return state1.logEntry.date - state2.logEntry.date;
};

module.exports = {
  LogSourceState,
  logSourceStateComparator,
};
