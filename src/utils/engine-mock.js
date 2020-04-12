export const mockPlayersComparePhase = {
  Tester: {
    avatar: 'axolotl',
    isAdmin: true,
    lastUpdated: 1586640900000,
    nickname: 'Tester',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Tester;0': {
        text: 'FOXTROT',
        isMatch: false,
      },
      'q1;Tester;1': {
        text: 'BRAVO',
        isMatch: false,
      },
      'q1;Tester;2': {
        text: 'CHARLIE',
        isMatch: false,
      },
    },
  },
  Beth: {
    avatar: 'cardinal',
    isAdmin: false,
    lastUpdated: 1586640900000,
    nickname: 'Beth',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Beth;0': {
        text: 'ALPHA',
        isMatch: false,
      },
      'q1;Beth;1': {
        text: 'DELTA',
        isMatch: false,
      },
      'q1;Beth;2': {
        text: 'ECHO',
        isMatch: false,
      },
    },
  },
  Cam: {
    avatar: 'fox',
    isAdmin: false,
    lastUpdated: 1586640900000,
    nickname: 'Cam',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Cam;0': {
        text: 'ECHO',
        isMatch: false,
      },
      'q1;Cam;1': {
        text: 'CHARLIE',
        isMatch: false,
      },
      'q1;Cam;2': {
        text: 'ALPHA',
        isMatch: false,
      },
    },
  },
};

export const mockCompare = {
  currentAnswer: 'ALPHA',
  matches: {
    Beth: {
      answer: 'ALPHA',
      answerId: 'q1;Beth;0',
      isLocked: true,
    },
    Tester: {
      answer: 'ALPHA',
      answerId: 'q1;Tester;0',
      isLocked: true,
    },
  },
};

export const mockPlayersRemoveMatch = {
  Tester: {
    avatar: 'axolotl',
    isAdmin: true,
    lastUpdated: 1586640900000,
    nickname: 'Tester',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Tester;0': {
        isMatch: true,
        text: 'FOXTROT',
      },
      'q1;Tester;1': {
        isMatch: false,
        text: 'BRAVO',
      },
      'q1;Tester;2': {
        isMatch: false,
        text: 'CHARLIE',
      },
    },
  },
  Beth: {
    avatar: 'cardinal',
    isAdmin: false,
    lastUpdated: 1586640900000,
    nickname: 'Beth',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Beth;0': {
        isMatch: false,
        text: 'ALPHA',
      },
      'q1;Beth;1': {
        isMatch: false,
        text: 'DELTA',
      },
      'q1;Beth;2': {
        isMatch: false,
        text: 'ECHO',
      },
    },
  },
  Cam: {
    avatar: 'fox',
    isAdmin: false,
    lastUpdated: 1586640900000,
    nickname: 'Cam',
    floor: 6,
    isReady: false,
    score: 0,
    answers: {
      'q1;Cam;0': {
        isMatch: false,
        text: 'ECHO',
      },
      'q1;Cam;1': {
        isMatch: false,
        text: 'CHARLIE',
      },
      'q1;Cam;2': {
        isMatch: false,
        text: 'ALPHA',
      },
    },
  },
};

export const mockCompareRemove = {
  currentAnswer: 'ALPHA',
  matches: {
    Beth: {
      answer: 'ALPHA',
      answerId: 'q1;Beth;0',
      isLocked: true,
    },
    Tester: {
      answer: 'FOXTROT',
      answerId: 'q1;Tester;0',
      downvotes: {
        Tester: true,
      },
      isLocked: false,
    },
  },
};

export const mockCompareUpvote = {
  currentAnswer: 'ALPHA',
  matches: {
    Beth: {
      answer: 'ALPHA',
      answerId: 'q1;Beth;0',
      isLocked: true,
    },
    Cam: {
      answer: 'FOXTROT',
      answerId: 'q1;Cam;0',
      downvotes: {
        Cam: true,
      },
      isLocked: false,
    },
  },
};

export const mockCompareDownvote = {
  currentAnswer: 'ALPHA',
  matches: {
    Beth: {
      answer: 'ALPHA',
      answerId: 'q1;Beth;0',
      isLocked: true,
    },
    Cam: {
      answer: 'FOXTROT',
      answerId: 'q1;Cam;0',
      downvotes: {
        Cam: true,
        Tester: true,
      },
      isLocked: false,
    },
  },
};

export const mockResultsScore3PlayersUpvoted = {
  Beth: {
    answers: {
      'q1;Beth;0': {
        isMatch: false,
        text: 'ALPHA',
      },
      'q1;Beth;1': {
        isMatch: false,
        text: 'DELTA',
      },
      'q1;Beth;2': {
        isMatch: false,
        text: 'ECHO',
      },
    },
    avatar: 'cardinal',
    floor: 6,
    isAdmin: false,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Beth',
    score: 2,
  },
  Cam: {
    answers: {
      'q1;Cam;0': {
        isMatch: false,
        text: 'ECHO',
      },
      'q1;Cam;1': {
        isMatch: false,
        text: 'CHARLIE',
      },
      'q1;Cam;2': {
        isMatch: false,
        text: 'ALPHA',
      },
    },
    avatar: 'fox',
    floor: 6,
    isAdmin: false,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Cam',
    score: 2,
  },
  Tester: {
    answers: {
      'q1;Tester;0': {
        isMatch: true,
        text: 'FOXTROT',
      },
      'q1;Tester;1': {
        isMatch: false,
        text: 'BRAVO',
      },
      'q1;Tester;2': {
        isMatch: false,
        text: 'CHARLIE',
      },
    },
    avatar: 'axolotl',
    floor: 6,
    isAdmin: true,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Tester',
    score: 0,
  },
};

export const mockResultsScore3PlayersDownvoted = {
  Beth: {
    answers: {
      'q1;Beth;0': {
        isMatch: false,
        text: 'ALPHA',
      },
      'q1;Beth;1': {
        isMatch: false,
        text: 'DELTA',
      },
      'q1;Beth;2': {
        isMatch: false,
        text: 'ECHO',
      },
    },
    avatar: 'cardinal',
    floor: 6,
    isAdmin: false,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Beth',
    score: 1,
  },
  Cam: {
    answers: {
      'q1;Cam;0': {
        isMatch: false,
        text: 'ECHO',
      },
      'q1;Cam;1': {
        isMatch: false,
        text: 'CHARLIE',
      },
      'q1;Cam;2': {
        isMatch: false,
        text: 'ALPHA',
      },
    },
    avatar: 'fox',
    floor: 6,
    isAdmin: false,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Cam',
    score: 0,
  },
  Tester: {
    answers: {
      'q1;Tester;0': {
        isMatch: true,
        text: 'FOXTROT',
      },
      'q1;Tester;1': {
        isMatch: false,
        text: 'BRAVO',
      },
      'q1;Tester;2': {
        isMatch: false,
        text: 'CHARLIE',
      },
    },
    avatar: 'axolotl',
    floor: 6,
    isAdmin: true,
    isReady: false,
    lastUpdated: 1586640900000,
    nickname: 'Tester',
    score: 0,
  },
};
