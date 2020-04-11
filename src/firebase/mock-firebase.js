const mockFirebaseDbRef = () => {
  return {
    update: jest.fn(),
    child: jest.fn(() => {
      return {
        update: jest.fn(),
        child: jest.fn(() => {
          return {
            update: jest.fn(),
            child: jest.fn(),
          };
        }),
      };
    }),
  };
};

export default mockFirebaseDbRef;
