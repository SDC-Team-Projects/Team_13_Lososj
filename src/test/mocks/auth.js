export const registerMock = jest.fn(() =>
  Promise.resolve({ user: { id: 1, email: 'test@mail.com' } })
)