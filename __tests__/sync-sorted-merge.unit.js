const {
  buildHeapSyncronouslyFromLogSources,
  printLogEntriesSync,
} = require("../solution/sync-sorted-merge");

describe("buildHeapSyncronouslyFromLogSources", () => {
  test("It should create an empty heap if no log sources exist", () => {
    const logSources = [];

    const heap = buildHeapSyncronouslyFromLogSources({ logSources });

    expect(heap.isEmpty()).toBe(true);
  });

  test("It should create an empty heap if all log sources are drained via the pop method", () => {
    const logSources = [{ pop: () => false }, { pop: () => false }];

    const heap = buildHeapSyncronouslyFromLogSources({ logSources });

    expect(heap.isEmpty()).toBe(true);
  });

  test("The top value on the heap should be the oldest date", () => {
    const now = Date.now();
    const currentDate = new Date(now);
    const dateInThePast = new Date(now - 1000000000);
    const currentEntry = {
      date: currentDate,
      msg: "Not important for the test",
    };
    const entryInThePast = {
      date: dateInThePast,
      msg: "Not important for the test",
    };
    const logSources = [
      {
        pop: () => currentEntry,
        last: currentEntry,
      },
      {
        pop: () => entryInThePast,
        last: entryInThePast,
      },
    ];

    const heap = buildHeapSyncronouslyFromLogSources({ logSources });
    expect(heap.isEmpty()).toBe(false);

    const root = heap.extractRoot();
    expect(root.last).toBe(entryInThePast);
  });
});

describe("printLogEntriesSync", () => {
  test("it should not print any log entries if the heap is empty", () => {
    const logStateHeap = buildHeapSyncronouslyFromLogSources({
      logSources: [],
    });
    const printer = {
      print: jest.fn(),
    };

    printLogEntriesSync({ logStateHeap, printer });

    expect(printer.print).not.toHaveBeenCalled();
  });

  test("it should print the root log message in the heap and get the next value from the source until all sources are drained", () => {
    const firstLogEntry = { date: new Date(), msg: "1" };

    const popMock = jest.fn();
    popMock.mockReturnValueOnce(firstLogEntry);
    popMock.mockReturnValueOnce(false);
    const logSources = [
      {
        pop: popMock,
      },
    ];

    const logStateHeap = buildHeapSyncronouslyFromLogSources({
      logSources,
    });

    const printer = {
      print: jest.fn(),
    };

    printLogEntriesSync({ logStateHeap, printer });

    expect(printer.print).toHaveBeenCalledTimes(1);
  });
});
