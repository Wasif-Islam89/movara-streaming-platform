import { 
  Smile, 
  Sparkles, 
  Film, 
  Star, 
  Bot, 
  Baby, 
  User 
} from 'lucide-react';
import { AVATAR_PRESETS } from '../context/ProfileContext';

/**
 * Renders an authentic Netflix-style colorful profile avatar.
 * 
 * @param {Object} props
 * @param {string} [props.avatarId] - Preset avatar identifier ('av-red', 'av-gold', etc.)
 * @param {string} [props.name] - Profile name
 * @param {boolean} [props.isKids] - Whether this is a kids profile
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.size='md'] - Visual dimension size
 * @param {string} [props.className] - Additional styling classes
 */
export default function ProfileAvatar({
  avatarId = 'av-gold',
  name = 'Profile',
  isKids = false,
  size = 'md',
  className = '',
}) {
  const preset = AVATAR_PRESETS.find((p) => p.id === avatarId) || AVATAR_PRESETS[0];

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-md text-xs',
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-10 h-10 rounded-xl text-base',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 rounded-2xl text-2xl',
    xl: 'w-32 h-32 rounded-2xl text-3xl',
  };

  const iconSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  function renderIcon() {
    const iconClass = `${iconSizes[size] || 'w-5 h-5'} text-white/95 drop-shadow-md`;

    if (isKids) {
      return <Baby className={iconClass} />;
    }

    switch (preset.icon) {
      case 'smile':
        return <Smile className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
      case 'film':
        return <Film className={iconClass} />;
      case 'star':
        return <Star className={iconClass} />;
      case 'bot':
        return <Bot className={iconClass} />;
      case 'baby':
        return <Baby className={iconClass} />;
      default:
        return <User className={iconClass} />;
    }
  }

  return (
    <div
      className={`relative select-none flex items-center justify-center bg-gradient-to-br ${preset.bg} shadow-md overflow-hidden transition-transform duration-200 ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      aria-label={`${name}'s avatar`}
    >
      {/* Ambient glass shine */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/20 pointer-events-none" />
      
      {/* Center Icon */}
      <div className="relative z-10 flex items-center justify-center">
        {renderIcon()}
      </div>

      {/* Kids tag on larger sizes */}
      {isKids && (size === 'lg' || size === 'xl') && (
        <span className="absolute bottom-1.5 inset-x-2 text-center text-[10px] font-extrabold uppercase tracking-wider bg-black/60 text-[#F2B84B] rounded py-0.5 backdrop-blur-xs">
          KIDS
        </span>
      )}
    </div>
  );
}
