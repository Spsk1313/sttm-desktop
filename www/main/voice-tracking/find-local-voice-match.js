import { searchShabads } from '../navigator/utils';

const findLocalVoiceMatch = async (initials, shabadId, filteredItems) => {
  const matches = await searchShabads(initials, 1, 'all', 20, shabadId);

  if (matches.length !== 1) {
    return {
      type: 'local-miss',
    };
  }

  const matchedVerseId = matches[0].ID;

  const verseIndex = filteredItems.findIndex((verse) => verse.verseId === matchedVerseId);

  if (verseIndex < 0) {
    return {
      type: 'local-miss',
    };
  }

  return {
    type: 'local-match',
    verseId: matchedVerseId,
    verseIndex,
  };
};

export default findLocalVoiceMatch;
