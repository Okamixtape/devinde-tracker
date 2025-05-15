// Mock les dépendances React qui ne sont pas bien prises en charge dans l'environnement de test
jest.mock('next/router', () => ({
  useRouter: jest.fn(() => ({
    query: {},
    pathname: '/',
    asPath: '/',
    events: {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    },
    push: jest.fn(),
    replace: jest.fn(),
    reload: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(() => Promise.resolve()),
    beforePopState: jest.fn(),
    isReady: true,
  })),
}));

// Mock les fonctions globales
global.console = {
  ...console,
  // Keep native behaviour for other methods, use mock for specified methods
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Déactiver les animations pendant les tests
jest.mock('react-transition-group', () => {
  const FakeTransition = jest.fn(({ children }) => children);
  const FakeCSSTransition = jest.fn(props =>
    props.in ? props.children : null
  );
  return {
    CSSTransition: FakeCSSTransition,
    Transition: FakeTransition,
  };
});