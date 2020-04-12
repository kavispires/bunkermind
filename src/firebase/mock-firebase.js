const mockFirebaseDbRef = () => {
  const firstLevelUpdate = jest.fn();
  const secondLevelUpdate = jest.fn();
  const thirdLevelUpdate = jest.fn();

  const thirdLevelChild = jest.fn();
  const secondLevelChild = jest.fn(() => {
    return {
      update: thirdLevelUpdate,
      child: thirdLevelChild,
    };
  });

  const firstLevelChild = jest.fn(() => {
    return {
      update: secondLevelUpdate,
      child: secondLevelChild,
    };
  });

  return {
    update: firstLevelUpdate,
    update2: secondLevelUpdate,
    update3: thirdLevelUpdate,
    child: firstLevelChild,
    child2: secondLevelChild,
    child3: thirdLevelChild,
  };
};

export default mockFirebaseDbRef;
