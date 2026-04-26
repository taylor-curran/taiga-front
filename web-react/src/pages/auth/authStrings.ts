/** Parity with `app/locales/taiga/locale-en.json` keys used on auth pages (admin slice). */
export const authStrings = {
    tagline: 'SIMPLE, POWERFUL, FREE',
    loginTitle: 'LOGIN.PAGE_TITLE',
    login: {
        username: 'Email or username',
        password: 'Password',
        signIn: 'Sign in',
        forgotPassword: "I can't remember my password",
        errorIncorrect:
            "Oops! Either your username or your password is incorrect — let's try again",
        publicRegister: "Don't have an account?",
    },
    register: {
        title: 'Create account',
        submit: 'Create account',
        termsNote: 'By clicking "Create account" you accept our terms',
    },
    forgotPassword: {
        title: 'Password recovery',
        email: 'Email',
        request: 'Send',
        backToLogin: 'Back to login',
    },
    changePasswordRecovery: {
        title: 'Set new password',
        password: 'New password',
        submit: 'Change password',
    },
    common: { genericError: (msg: string) => `Error: ${msg}` },
    invitation: { notFound: 'Invitation not found' },
} as const;
