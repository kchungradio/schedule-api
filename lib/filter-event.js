module.exports = function filterEvent(event) {
  if (!event.name) return false
  return !['TENTATIVE', 'TBD', 'Open Slot', 'DONOTLIST'].includes(event.name)
}
