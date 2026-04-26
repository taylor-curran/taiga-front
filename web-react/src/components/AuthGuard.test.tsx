import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { AuthGuard } from '@/components/AuthGuard';
import { useAppStore } from '@/stores/appStore';

function Child() {
    return <div data-testid="child">in</div>;
}

describe('AuthGuard', () => {
    beforeEach(() => {
        useAppStore.setState({ isAuthenticated: false, user: null });
    });

    it('redirects to login with next when not authed', () => {
        render(
            <MemoryRouter initialEntries={['/user-settings/mail-notifications']}>
                <Routes>
                    <Route
                        path="/user-settings/*"
                        element={
                            <AuthGuard>
                                <Child />
                            </AuthGuard>
                        }
                    />
                    <Route path="/login" element={<div>login</div>} />
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.queryByTestId('child')).toBeNull();
    });

    it('renders children when authed', () => {
        useAppStore.setState({
            isAuthenticated: true,
            user: { id: 1, username: 'u', email: '', fullName: '' },
        });
        render(
            <MemoryRouter initialEntries={['/user-settings/mail-notifications']}>
                <Routes>
                    <Route
                        path="/user-settings/*"
                        element={
                            <AuthGuard>
                                <Child />
                            </AuthGuard>
                        }
                    />
                </Routes>
            </MemoryRouter>,
        );
        expect(screen.getByTestId('child')).toBeInTheDocument();
    });
});
