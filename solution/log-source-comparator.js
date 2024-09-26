const logSourceComparator = (logSource1, logSource2) => {
  return logSource1.last.date - logSource2.last.date;
};

module.exports = {
  logSourceComparator,
};
