import { photoUrl } from '../services/api';

export const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0].toUpperCase()).join('');

export default function Avatar({ name, src, large = false }) {
  const cls = `avatar ${large ? 'lg' : ''}`;
  return src ? <img className={cls} src={photoUrl(src)} alt={name} /> : <span className={cls} aria-hidden="true">{initials(name)}</span>;
}
