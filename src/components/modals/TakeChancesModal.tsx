import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { rollDicePlus } from '../../utils/combatUtils';
import { NumberSpinner } from '../ui/NumberSpinner';

interface TakeChancesModalProps {
    onClose: () => void;
}

export function TakeChancesModal({ onClose }: TakeChancesModalProps) {
    const trackers = useCharacterStore((state) => state.trackers);
    const [chancesToRoll, setChancesToRoll] = useState(1);

    const confirmChancesRoll = () => {
        const finalRoll = Math.min(chancesToRoll, trackers.chances);
        if (finalRoll > 0) {
            const state = useCharacterStore.getState();
            const nickname = state.identity.nickname || state.identity.species || 'Alguém';
            rollDicePlus(
                `${finalRoll}d6>3`,
                `🍀 ${nickname} usou Tentar a Sorte para rerolar ${finalRoll} dados que falharam!`
            );
        }
        onClose();
    };

    return (
        <div className="tracker-modal__overlay">
            <div className="tracker-modal__content">
                <h3 className="tracker-modal__title">🍀 Tentar a Sorte</h3>
                <p className="tracker-modal__description">
                    Quantos dados falhos você deseja rerolar? <br />
                    (Você tem {trackers.chances} acúmulo(s) ativo(s) nesta rodada)
                </p>

                <div className="tracker-modal__spinner-container">
                    <NumberSpinner
                        value={chancesToRoll}
                        onChange={(value) => setChancesToRoll(Math.max(1, Math.min(trackers.chances, value)))}
                        min={1}
                        max={trackers.chances}
                    />
                </div>

                <div className="tracker-modal__actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button action-button--dark tracker-modal__btn-cancel"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={confirmChancesRoll}
                        className="action-button action-button--red tracker-modal__btn-confirm"
                    >
                        🎲 Rerolar
                    </button>
                </div>
            </div>
        </div>
    );
}
