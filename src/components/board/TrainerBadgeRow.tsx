import type { Badge } from '../../store/storeTypes';
import './TrainerBadges.css';

interface TrainerBadgeRowProps {
    badge: Badge;
    onUpdate: (field: 'name' | 'emoji', value: string) => void;
    onRemove: () => void;
}

export function TrainerBadgeRow({ badge, onUpdate, onRemove }: TrainerBadgeRowProps) {
    return (
        <div className="trainer-badge-row">
            <input
                type="text"
                className="trainer-badge-row__emoji-input"
                value={badge.emoji}
                onChange={(e) => onUpdate('emoji', e.target.value)}
                onFocus={(e) => e.target.select()}
                title="Pressione Win + . (Windows) ou Cmd + Ctrl + Espaço (Mac) para emojis"
            />

            <input
                type="text"
                className="trainer-badge-row__input"
                placeholder="Nome da Insígnia..."
                value={badge.name}
                onChange={(e) => onUpdate('name', e.target.value)}
            />

            <button
                type="button"
                className="action-button action-button--red trainer-badge-row__del-btn"
                onClick={onRemove}
                title="Excluir Insígnia"
            >
                X
            </button>
        </div>
    );
}
