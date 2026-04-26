/** English strings aligned with app/locales/taiga/locale-en.json for this slice. */
export const en = {
  common: {
    tagLine2: 'LOVE YOUR PROJECT',
    goHome: 'Take me home',
    logout: 'Logout',
    capslock: 'Be careful! You are using capital letters in an input field that is case sensitive.',
  },
  login: {
    title: 'Taiga',
    usernamePlaceholder: 'Username or email (case sensitive)',
    passwordPlaceholder: 'Password (case sensitive)',
    forgot: 'Forgot it?',
    forgotTitle: 'Did you forget your password?',
    submit: 'Login',
    errorIncorrect:
      'According to the Taiga, your username/email or password are incorrect.',
  },
  permissionDenied: {
    title: 'Permission denied',
    text: "You don't have permission to access this page.",
  },
  admin: {
    placeholder: 'This admin section is not implemented in the React port yet.',
    backProject: 'Back to project',
  },
} as const;
