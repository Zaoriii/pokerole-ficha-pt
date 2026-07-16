import './SmartTagsGuideModal.css';

export function SmartTagsGuideModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="tags-guide__overlay">
            <div className="tags-guide__content">
                <h3 className="tags-guide__title">🏷️ Guia de Smart Tags</h3>
                <p className="tags-guide__desc">
                    Digite exatamente como mostrado (com colchetes) no Nome ou nas Notas de um item equipado para
                    aplicar mecânicas automaticamente.
                </p>
                <ul className="tags-guide__list">
                    <li>
                        <b>Atributos/Perícias:</b> <code>[Dex -2]</code>, <code>[Brawl +2]</code>, <code>[Def +1]</code>,{' '}
                        <code>[Spd +1]</code>
                    </li>
                    <li>
                        <b>Combate:</b> <code>[Dmg +1]</code>, <code>[Dmg +1: Physical]</code>, <code>[Acc +1]</code>,{' '}
                        <code>[Chance +2]</code>
                    </li>
                    <li>
                        <b>Efetividades:</b> <code>[Immune: Ground]</code>, <code>[Remove Immunity: Type]</code>,{' '}
                        <code>[Remove Immunities]</code>
                    </li>
                    <li>
                        <b>Mecânicas:</b> <code>[High Crit]</code>, <code>[Ignore Low Acc 2]</code>,{' '}
                        <code>[Status: Poison]</code>, <code>[Recoil]</code>
                    </li>
                </ul>
                <div className="tags-guide__actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button action-button--dark tags-guide__btn-close"
                    >
                        Fechar Guia
                    </button>
                </div>
            </div>
        </div>
    );
}
