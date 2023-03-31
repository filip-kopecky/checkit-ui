import { Change } from "../model/Change";
import { ChangeListData } from "../components/publications/PublicationReviewVocabulary";

export const createChangeListDataStructure = (
  changes: Change[]
): ChangeListData => {
  let allChanges = [];
  let headers = [];
  let groupCounts = [];
  let paddedIndex: number[] = [];

  const grouped = changes.reduce<{
    [key: string]: Change[];
  }>(function (r, a) {
    r[a.subject] = r[a.subject] || [];
    r[a.subject].push(a);
    return r;
  }, Object.create(null));

  for (const [, value] of Object.entries(grouped)) {
    const header = value[0].label;
    headers.push(header);
    allChanges.push(...value);
    groupCounts.push(value.length);
    if (paddedIndex.length === 0) {
      paddedIndex.push(value.length - 1);
    } else {
      paddedIndex.push(paddedIndex[paddedIndex.length - 1] + value.length);
    }
  }

  return {
    allChanges: allChanges,
    headers: headers,
    groupCounts: groupCounts,
    lastInGroupIndexes: paddedIndex,
  };
};

export const generateTripleFromChange = (change: Change): string => {
  return `<${change.subject}>\n<${change.predicate}>\n<${change.object}> .`;
};

export const getModificationColor = (state: string): string => {
  switch (state) {
    case "CREATED":
      return "#2EA903";
    case "REMOVED":
      return "#FF0000";
    case "MODIFIED":
    case "ROLLBACKED":
      return "#ED6C02";
  }
  return "";
};

/**
 * Mapping known properties to human-readable translations
 */
export const UriToTranslationMapper: {
  [uri: string]: { id: string; descriptionId: string };
} = {
  "http://www.w3.org/2004/02/skos/core#Concept": {
    id: "SKOS_CONCEPT",
    descriptionId: "DESCRIPTION_SKOS_CONCEPT",
  },
  "http://www.w3.org/2004/02/skos/core#definition": {
    id: "SKOS_DEFINITION",
    descriptionId: "DESCRIPTION_SKOS_DEFINITION",
  },
  "http://www.w3.org/2004/02/skos/core#broader": {
    id: "SKOS_BROADER",
    descriptionId: "DESCRIPTION_SKOS_BROADER",
  },
  "http://www.w3.org/2004/02/skos/core#narrower": {
    id: "SKOS_NARROWER",
    descriptionId: "DESCRIPTION_SKOS_NARROWER",
  },
  "http://www.w3.org/2004/02/skos/core#prefLabel": {
    id: "SKOS_PREF_LABEL",
    descriptionId: "DESCRIPTION_SKOS_PREF_LABEL",
  },
  "http://www.w3.org/2004/02/skos/core#altLabel": {
    id: "SKOS_ALT_LABEL",
    descriptionId: "DESCRIPTION_SKOS_ALT_LABEL",
  },
  "http://www.w3.org/2004/02/skos/core#hiddenLabel": {
    id: "SKOS_HIDDEN_LABEL",
    descriptionId: "DESCRIPTION_SKOS_HIDDEN_LABEL",
  },
  "http://www.w3.org/2004/02/skos/core#scopeNote": {
    id: "SKOS_SCOPE_NOTE",
    descriptionId: "DESCRIPTION_SKOS_SCOPE_NOTE",
  },
  "http://www.w3.org/2004/02/skos/core#inScheme": {
    id: "SKOS_IN_SCHEME",
    descriptionId: "DESCRIPTION_SKOS_IN_SCHEME",
  },
  "http://www.w3.org/2004/02/skos/core#exactMatch": {
    id: "SKOS_EXACT_MATCH",
    descriptionId: "DESCRIPTION_SKOS_EXACT_MATCH",
  },
  "http://www.w3.org/2004/02/skos/core#related": {
    id: "SKOS_RELATED",
    descriptionId: "DESCRIPTION_SKOS_RELATED",
  },
  "http://www.w3.org/2004/02/skos/core#relatedMatch": {
    id: "SKOS_RELATED_MATCH",
    descriptionId: "DESCRIPTION_SKOS_RELATED_MATCH",
  },
  "http://www.w3.org/2004/02/skos/core#notation": {
    id: "SKOS_NOTATION",
    descriptionId: "DESCRIPTION_SKOS_NOTATION",
  },
  "http://www.w3.org/2004/02/skos/core#example": {
    id: "SKOS_EXAMPLE",
    descriptionId: "DESCRIPTION_SKOS_EXAMPLE",
  },
  "http://www.w3.org/2004/02/skos/core#hasTopConcept": {
    id: "SKOS_HAS_TOP_CONCEPT",
    descriptionId: "DESCRIPTION_SKOS_HAS_TOP_CONCEPT",
  },
};
