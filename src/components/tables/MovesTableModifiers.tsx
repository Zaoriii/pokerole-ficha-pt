import { NumberSpinner } from '../ui/NumberSpinner';
import { TooltipIcon } from '../ui/TooltipIcon';
import type { Trackers } from '../../store/storeTypes';

interface MovesTableModifiersProps {
    maxMoves: number;
    trackers: Trackers;
    updateTracker: <K extends keyof Trackers>(field: K, value: Trackers[K]) => void;
    handleGlobalChanceRoll: () => void;
    painEnabled: boolean;
    setTooltipInfo: (info: { title: string; description: string } | null) => void;
    setShowModifiersModal: (show: boolean) => void;
}

export function MovesTableModifiers({
    maxMoves,
    trackers,
    updateTracker,
    handleGlobalChanceRoll,
    painEnabled,
    setTooltipInfo,
    setShowModifiersModal
}: MovesTableModifiersProps) {
    return (
        <>
            <span className="moves-table__max-label">(Máx: {maxMoves})</span>
            <div className="desktop-only-flex moves-table__desktop-modifiers">
                <span className="moves-table__modifier-item">
                    Pre
                    <TooltipIcon
                        onClick={() =>
                            setTooltipInfo({
                                title: 'Precisão Global',
                                description: 'Adiciona ou remove dados de bônus em todas as rolagens de Precisão.'
                            })
                        }
                    />
                    :{' '}
                    <NumberSpinner
                        value={trackers.globalAcc}
                        onChange={(value: number) => updateTracker('globalAcc', value)}
                        min={-99}
                    />
                </span>
                <span className="moves-table__modifier-item">
                    Dano
                    <TooltipIcon
                        onClick={() =>
                            setTooltipInfo({
                                title: 'Dano Global',
                                description: 'Adiciona ou remove dados de bônus em todas as rolagens de Dano.'
                            })
                        }
                    />
                    :{' '}
                    <NumberSpinner
                        value={trackers.globalDmg}
                        onChange={(value: number) => updateTracker('globalDmg', value)}
                        min={-99}
                    />
                </span>
                <span className="moves-table__modifier-item">
                    Suc
                    <TooltipIcon
                        onClick={() =>
                            setTooltipInfo({
                                title: 'Modificador Global de Sucesso',
                                description: 'Bônus/Penalidade fixo aos Sucessos finais (ex: Baixa Precisão = -1).'
                            })
                        }
                    />
                    :{' '}
                    <NumberSpinner
                        value={trackers.globalSucc}
                        onChange={(value: number) => updateTracker('globalSucc', value)}
                        min={-99}
                    />
                </span>
                <span className="moves-table__modifier-item">
                    Chance
                    <TooltipIcon
                        onClick={() =>
                            setTooltipInfo({
                                title: 'Chance Global',
                                description: 'Adiciona dados de bônus em todas as rolagens de Chance.'
                            })
                        }
                    />
                    :{' '}
                    <NumberSpinner
                        value={trackers.globalChance}
                        onChange={(value: number) => updateTracker('globalChance', value)}
                        min={0}
                    />
                    <button
                        type="button"
                        onClick={handleGlobalChanceRoll}
                        className="action-button action-button--dark moves-table__chance-roll-btn"
                    >
                        🎲
                    </button>
                </span>
                {painEnabled && (
                    <span className="moves-table__modifier-pain">
                        Dor
                        <TooltipIcon
                            onClick={() =>
                                setTooltipInfo({
                                    title: 'Dor Ignorada',
                                    description:
                                        "Penalidades de Dor Ignoradas (Reinicia por Cena). Use o botão 'Ignorar Penalidades de Dor' no Tracker para aumentar isso."
                                })
                            }
                        />
                        :{' '}
                        <NumberSpinner
                            value={trackers.ignoredPain}
                            onChange={(value: number) => updateTracker('ignoredPain', value)}
                            min={0}
                        />
                    </span>
                )}
            </div>

            <button
                type="button"
                className="mobile-only-flex action-button action-button--dark moves-table__mobile-modifiers-btn"
                onClick={() => setShowModifiersModal(true)}
            >
                ⚙️ Modificadores
            </button>
        </>
    );
}
