import { Link } from 'react-router-dom';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo light />
          <p>Find medicine at pharmacies near you, compare prices and availability, and order in a few taps.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/medicines">All medicines</Link>
          <Link to="/pharmacies">Pharmacies</Link>
          <Link to="/cart">Cart</Link>
        </div>
        <div>
          <h4>Pharmacies</h4>
          <Link to="/register-pharmacy">Register your pharmacy</Link>
          <Link to="/login">Owner login</Link>
        </div>
        <div>
          <h4>Help</h4>
          <span>support@medivault.lk</span>
          <span>011 234 5678</span>
        </div>
      </div>
      <div className="container footer-bottom">© {new Date().getFullYear()} Medi_vault. Always follow your doctor's advice.</div>
    </footer>
  );
}
