import { searchShabads } from '../navigator/utils/search-shabads';

const findGlobalShabadCandidate = async (initials) => {
  const matches = await searchShabads(initials, 1, 'all', 20);

  if (matches.length === 0) {
    return {
      type: 'global-miss',
    };
  }

  const shabadIds = matches
    .map((verse) => verse.Shabads?.[0]?.ShabadID)
    .filter((shabadId) => shabadId !== undefined);

  const uniqueShabadIds = [...new Set(shabadIds)];

  if (uniqueShabadIds.length !== 1) {
    return {
      type: 'global-ambiguous',
    };
  }

  return {
    type: 'global-candidate',
    shabadId: uniqueShabadIds[0],
    verseId: matches.length === 1 ? matches[0].ID : null,
  };
};

export default findGlobalShabadCandidate;
