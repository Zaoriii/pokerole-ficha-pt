import { useCharacterStore } from '../../store/useCharacterStore';
import { NumberSpinner } from '../ui/NumberSpinner';
import { TooltipIcon } from '../ui/TooltipIcon';
import './GlobalModifiersModal.css';

interface GlobalModifiersModalProps {
    onClose: () => void;
    setTooltipInfo: (info: { title: string; description: string } | null) => void;
    handleGlobalChanceRoll: () => void;
}

export function GlobalModifiersModal({ onClose, setTooltipInfo, handleGlobalChanceRoll }: GlobalModifiersModalProps) {
    const trackers = useCharacterStore((state) => state.trackers);
    const updateTracker = useCharacterStore((state) => state.updateTracker);
    const painEnabled =
        String(useCharacterStore((state) => state.identity.pain || 'Enabled')).toLowerCase() === 'enabled';

    return (
        <div className="global-modifiers__overlay">
            <div className="global-modifiers__content">
                <h3 className="global-modifiers__title">⚙️ Modificadores Globais</h3>

                <div className="global-modifiers__list">
                    <div className="global-modifiers__row">
                        <span className="global-modifiers__label">
                            Prec
                            <TooltipIcon
                                onClick={() =>
                                    setTooltipInfo({
                                        title: 'Precisão Global',
                                        description: 'Adiciona ou remove dados de bônus em todas as rolagens de Precisão.'
                                    })
                                }
                            />
                        </span>
                        <NumberSpinner
                            value={trackers.globalAcc}
                            onChange={(value) => updateTracker('globalAcc', value)}
                            min={-99}
                        />
                    </div>

                    <div className="global-modifiers__row">
                        <span className="global-modifiers__label">
                            Dano
                            <TooltipIcon
                                onClick={() =>
                                    setTooltipInfo({
                                        title: 'Dano Global',
                                        description: 'Adiciona ou remove dados de bônus em todas as rolagens de Dano.'
                                    })
                                }
                            />
                        </span>
                        <NumberSpinner
                            value={trackers.globalDmg}
                            onChange={(value) => updateTracker('globalDmg', value)}
                            min={-99}
                        />
                    </div>

                    <div className="global-modifiers__row">
                        <span className="global-modifiers__label">
                            Suc
                            <TooltipIcon
                                onClick={() =>
                                    setTooltipInfo({
                                        title: 'Modificador Global de Sucesso',
                                        description: 'Bônus/Penalidade fixo aos Sucessos finais (ex.: Baixa Precisão = -1).'
                                    })
                                }
                            />
                        </span>
                        <NumberSpinner
                            value={trackers.globalSucc}
                            onChange={(value) => updateTracker('globalSucc', value)}
                            min={-99}
                        />
                    </div>

                    <div className="global-modifiers__row">
                        <span className="global-modifiers__label">
                            Chance
                            <button
                                type="button"
                                onClick={handleGlobalChanceRoll}
                                className="action-button action-button--dark global-modifiers__roll-btn"
                            >
                                🎲
                            </button>
                        </span>
                        <NumberSpinner
                            value={trackers.globalChance}
                            onChange={(value) => updateTracker('globalChance', value)}
                            min={0}
                        />
                    </div>

                    {painEnabled && (
                        <div className="global-modifiers__pain-container">
                            <span className="global-modifiers__label global-modifiers__label--pain">
                                Ign.Dor
                                <TooltipIcon
                                    onClick={() =>
                                        setTooltipInfo({
                                            title: 'Dor Ignorada',
                                            description:
                                                "Penalidades de Dor Ignoradas (reinicia por Cena). Use o botão 'Ignorar Penalidades de Dor' na Ficha para aumentar este valor."
                                        })
                                    }
                                />
                            </span>
                            <NumberSpinner
                                value={trackers.ignoredPain}
                                onChange={(value) => updateTracker('ignoredPain', value)}
                                min={0}
                            />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="action-button action-button--dark global-modifiers__close-btn"
                    onClick={onClose}
                >
                    Fechar
                </button>
            </div>
        </div>
    );
}
