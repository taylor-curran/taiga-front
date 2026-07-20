import { Link } from 'react-router-dom';
import { en } from '../../i18n/en';
import './LoginPage.css';

/** Route exists for parity with Angular nav; full form is out of scope for this slice. */
export function ForgotPasswordPlaceholder() {
  return (
    <div className="tg-auth">
      <div className="tg-auth-container">
        <h1 className="logo">{en.login.title}</h1>
        <p style={{ textAlign: 'center', color: 'var(--tg-color-black600)' }}>
          Password recovery UI is not implemented in this React slice yet.
        </p>
        <p style={{ textAlign: 'center' }}>
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
