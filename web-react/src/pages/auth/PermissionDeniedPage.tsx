import { Link } from 'react-router-dom';
import { en } from '../../i18n/en';
import './PermissionDeniedPage.css';

export function PermissionDeniedPage() {
  return (
    <div className="tg-error-main">
      <div className="tg-error-container">
        <img src="/logo-color.svg" width={96} height={96} alt="" />
        <h1 className="logo">{en.permissionDenied.title}</h1>
        <p>{en.permissionDenied.text}</p>
        <Link to="/">{en.common.goHome}</Link>
      </div>
    </div>
  );
}
