import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, FileSpreadsheet, Lock, Mail, MapPin, Phone, UserRoundCog, Users } from 'lucide-react';
import Logo from '../components/Logo';
import { ABOUT_IMAGE, HERO_IMAGE } from '../config';

const features = [
  { icon: Users, title: 'One record per person', text: 'Add, update and find any employee in seconds, with a unique ID generated automatically.' },
  { icon: Building2, title: 'Departments that stay in sync', text: 'See headcount per department and jump straight to the people who belong to it.' },
  { icon: FileSpreadsheet, title: 'Excel reports on demand', text: 'Export everyone, or one department, as a clean workbook ready to share.' },
  { icon: UserRoundCog, title: 'A view for every role', text: 'HR manages the workforce. Employees see only their own profile.' },
  { icon: Lock, title: 'Access you can trust', text: 'Permissions are enforced on the server, not just hidden in the interface.' },
  { icon: CheckCircle2, title: 'Built for daily use', text: 'Search, filters and pagination keep large teams easy to navigate on any screen.' },
];

export default function Home() {
  return (
    <>
      <header className="nav-public">
        <div className="inner">
          <Logo />
          <nav className="nav-links" aria-label="Primary">
            <a className="link" href="#features">Features</a>
            <a className="link" href="#about">About</a>
            <a className="link" href="#contact">Contact</a>
            <Link className="btn btn-primary" to="/login">Login</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="inner">
          <div>
            <h1>Simplify Your Workforce Management</h1>
            <p className="lead">One platform to manage your people, streamline operations and empower your workforce.</p>
            <div className="hero-cta">
              <Link className="btn btn-accent btn-lg" to="/login">Get Started <ArrowRight size={18} /></Link>
              <a className="btn btn-ghost btn-lg" href="#features">See features</a>
            </div>
          </div>
          <div className="photo-frame">
            <img src={HERO_IMAGE} alt="A team collaborating around a table" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="inner">
          <h2>Everything HR needs to run the day</h2>
          <p className="sub">Focused tools for employee records, departments and reporting, without the clutter.</p>
          <div className="features">
            {features.map(({ icon: Icon, title, text }) => (
              <div className="feature" key={title}><Icon size={26} /><h3>{title}</h3><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="about">
        <div className="inner about">
          <div className="photo-frame" style={{ aspectRatio: '4 / 3' }}>
            <img src={ABOUT_IMAGE} alt="Colleagues working together in an office" onError={(e) => (e.currentTarget.style.display = 'none')} />
          </div>
          <div>
            <h2>About Teamora</h2>
            <p>Teamora gives growing companies a single, reliable home for employee information. HR teams stop chasing spreadsheets, and employees always know their details are accurate.</p>
            <ul>
              <li><CheckCircle2 size={18} />Employee records, departments and reports in one workspace</li>
              <li><CheckCircle2 size={18} />Separate, secure dashboards for HR/Admin and employees</li>
              <li><CheckCircle2 size={18} />Accounts created by HR, never open to public sign-up</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="cta-band">
            <div><h2>Ready to bring your people together?</h2><p>Sign in to your Teamora workspace.</p></div>
            <Link className="btn btn-accent btn-lg" to="/login">Login <ArrowRight size={18} /></Link>
          </div>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="inner">
          <div className="cols">
            <div><Logo light /><p style={{ marginTop: 14, maxWidth: 320 }}>Smart employee management for modern teams.</p></div>
            <div>
              <h4>Contact</h4>
              <ul>
                <li><Mail size={16} /><a href="mailto:hello@teamora.com">hello@teamora.com</a></li>
                <li><Phone size={16} />+91 80 4000 1234</li>
                <li><MapPin size={16} />Bengaluru, Karnataka, India</li>
              </ul>
            </div>
            <div>
              <h4>Explore</h4>
              <ul><li><a href="#features">Features</a></li><li><a href="#about">About</a></li><li><Link to="/login">Login</Link></li></ul>
            </div>
          </div>
          <p className="copy">© {new Date().getFullYear()} Teamora. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
