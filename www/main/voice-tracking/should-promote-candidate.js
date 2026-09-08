const shouldPromoteCandidate = ({ candidateShabadId, candidateHits, candidateVerseIds }) =>
  candidateShabadId !== null && candidateHits >= 3 && candidateVerseIds.length >= 3;

export default shouldPromoteCandidate;
