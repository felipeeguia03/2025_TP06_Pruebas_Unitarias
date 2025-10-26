// Configurar React en modo desarrollo para permitir act() en tests
process.env.NODE_ENV = "development";

// Mock de localStorage para entorno node
if (typeof global !== "undefined") {
  global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  };
}

// Mock de window para entorno node
if (typeof global !== "undefined") {
  global.window = {
    location: {
      href: "http://localhost:3000",
      assign: jest.fn(),
      replace: jest.fn(),
      reload: jest.fn(),
    },
    localStorage: global.localStorage,
  };
}

// Mock de document para entorno node
if (typeof global !== "undefined") {
  global.document = {
    createElement: jest.fn(() => ({
      setAttribute: jest.fn(),
      appendChild: jest.fn(),
    })),
    getElementById: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(() => []),
  };
}

// Mock de navigator para entorno node
if (typeof global !== "undefined") {
  global.navigator = {
    userAgent: "node",
  };
}
