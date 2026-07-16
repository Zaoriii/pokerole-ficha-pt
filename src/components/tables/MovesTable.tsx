import { useState, useEffect } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import type { MoveData } from '../../store/storeTypes';
import { CombatStat } from '../../types/enums';
import { loadLocalDataset, ALL_MOVES } from '../../utils/api';
import {
    calculateBaseDamage,
    executeDamageRoll,
    rollDicePlus,
    parseCombatTags,
    getAbilityText,
    calculateStatTotal
} from '../../utils/combatUtils';
import { TargetingModal } from '../modals/TargetingModal';
import { MoveCard } from './MoveCard';
import { MoveRow } from './MoveRow';
import { CollapsingSection } from '../ui/CollapsingSection';
import { GlobalModifiersModal } from '../modals/GlobalModifiersModal';
import { MovesTableModifiers } from './MovesTableModifiers';
import { MovesTableLearnset } from './MovesTableLearnset';
import { DualScaleModal } from '../modals/DualScaleModal';
import { TooltipIcon } from '../ui/TooltipIcon';
import './MovesTable.css';

export function MovesTable() {
    const role = useCharacterStore((state) => state.role);
    const moves = useCharacterStore((state) => state.moves);
    const addMove = useCharacterStore((state) => state.addMove);
    const removeMove = useCharacterStore((state) => state.removeMove);
    const trackers = useCharacterStore((state) => state.trackers);
    const updateTracker = useCharacterStore((state) => state.updateTracker);
    const learnset = useCharacterStore((state) => state.identity.learnset);

    const skills = useCharacterStore((state) => state.skills);
    const extraCategories = useCharacterStore((state) => state.extraCategories);
    const customAbilities = useCharacterStore((state) => state.roomCustomAbilities);
    const ability = useCharacterStore((state) => state.identity.ability);
    const painEnabled = useCharacterStore((state) => state.identity.pain) === 'Enabled';

    const roomCustomMoves = useCharacterStore((state) => state.roomCustomMoves);

    // 🔥 Reactive Selectors for Targeting Modal Syncing
    useCharacterStore((state) => state.trackers.firstHitDmg);
    useCharacterStore((state) => state.trackers.firstHitAcc);
    useCharacterStore((state) => state.stats);

    const [targetingMove, setTargetingMove] = useState<MoveData | null>(null);
    const [deleteMoveId, setDeleteMoveId] = useState<string | null>(null);
    const [moveList, setMoveList] = useState<string[]>([]);

    const [showModifiersModal, setShowModifiersModal] = useState(false);
    const [tooltipInfo, setTooltipInfo] = useState<{ title: string; description: string } | null>(null);

    useEffect(() => {
        loadLocalDataset().then(() => setMoveList([...ALL_MOVES]));
    }, []);

    const state = useCharacterStore.getState();
    const abilityText = getAbilityText(ability, customAbilities);
    const itemBuffs = parseCombatTags(state.inventory, extraCategories, undefined, abilityText);

    // Completely abstracted Insight math!
    const insightTotal = calculateStatTotal(CombatStat.INS, state, itemBuffs);
    const maxMoves = 3 + insightTotal;

    const handleTargetClick = (move: MoveData) => {
        if (move.category === 'Status') {
            alert(`${move.name || 'Este golpe'} é um golpe de Suporte (Sem Dano).`);
            return;
        }

        const moveDescription = (move.desc || '').toLowerCase();
        const setDamageMatch = moveDescription.match(/set damage\s*(\d+)?/i);
        if (setDamageMatch || moveDescription.includes('set damage')) {
            const damageValue = setDamageMatch && setDamageMatch[1] ? setDamageMatch[1] : move.power;
            const currentState = useCharacterStore.getState();
            const nickname = currentState.identity.nickname || currentState.identity.species || 'Alguém';
            rollDicePlus(
                `0d6+${damageValue}`,
                `💥 ${nickname} usou ${move.name || 'um Golpe'}! (Causa exatamente ${damageValue} de Dano Fixo, ignora defesas)`
            );
            return;
        }

        setTargetingMove(move);
    };

    const handleExecuteDamage = (baseDamage: number, isCrit: boolean, isSuperEffective: boolean, reduction: number) => {
        if (targetingMove) {
            executeDamageRoll(
                targetingMove,
                useCharacterStore.getState(),
                baseDamage,
                isCrit,
                isSuperEffective,
                reduction
            );
        }
        setTargetingMove(null);
    };

    const handleGlobalChanceRoll = () => {
        const currentState = useCharacterStore.getState();
        const abilityTxt = getAbilityText(currentState.identity.ability, currentState.roomCustomAbilities);
        const parsedItems = parseCombatTags(
            currentState.inventory,
            currentState.extraCategories,
            undefined,
            abilityTxt
        );
        const totalChance = trackers.globalChance + parsedItems.chance;

        if (totalChance <= 0) return;

        const nickname = currentState.identity.nickname || currentState.identity.species || 'Alguém';
        const tags = parsedItems.chance > 0 ? ` [ Bônus de Item +${parsedItems.chance} ]` : '';
        rollDicePlus(`${totalChance}d6>5`, `🍀 ${nickname} rolou um Teste de Chance!${tags}`, 'chance');
    };

    const headerElements = (
        <MovesTableModifiers
            maxMoves={maxMoves}
            trackers={trackers}
            updateTracker={updateTracker}
            handleGlobalChanceRoll={handleGlobalChanceRoll}
            painEnabled={painEnabled}
            setTooltipInfo={setTooltipInfo}
            setShowModifiersModal={setShowModifiersModal}
        />
    );

    return (
        <div className="sheet-container">
            <datalist id="move-list">
                {[
                    ...moveList,
                    ...roomCustomMoves.filter((move) => role === 'GM' || !move.gmOnly).map((move) => move.name)
                ].map((moveName) => (
                    <option key={moveName} value={moveName} />
                ))}
            </datalist>

            <CollapsingSection title="GOLPES" headerElements={headerElements}>
                <div className="desktop-only-flex table-responsive-wrapper">
                    <table className="data-table moves-table__table">
                        <thead>
                            <tr className="moves-table__header-row">
                                <th className="moves-table__th-checkbox" title="Usado nesta rodada?">
                                    ✔
                                </th>
                                <th className="moves-table__th-acc">Pre</th>
                                <th>
                                    Nome{' '}
                                    <TooltipIcon
                                        onClick={() =>
                                            setTooltipInfo({
                                                title: 'Marcadores de Golpe',
                                                description:
                                                    'Use o menu suspenso ao lado do nome dos golpes para marcá-los visualmente. Por exemplo, use uma ★ para indicar um golpe obtido via Overrank!'
                                            })
                                        }
                                    />
                                </th>
                                <th className="moves-table__th-tag">Tag</th>
                                <th>Pool (Pre)</th>
                                <th>Tipo</th>
                                <th>Cat.</th>
                                <th>Dano</th>
                                <th className="moves-table__th-dmg">Dano</th>
                                <th className="moves-table__th-sort">Ordem</th>
                                <th className="moves-table__th-del">Exc.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moves.map((move) => (
                                <MoveRow
                                    key={move.id}
                                    move={move}
                                    skills={skills}
                                    extraCategories={extraCategories}
                                    onTarget={handleTargetClick}
                                    onDelete={setDeleteMoveId}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-only-flex moves-table__mobile-card-container">
                    {moves.map((move) => (
                        <MoveCard
                            key={move.id}
                            move={move}
                            skills={skills}
                            extraCategories={extraCategories}
                            onTarget={handleTargetClick}
                            onDelete={setDeleteMoveId}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addMove}
                    className="action-button action-button--red action-button--full-width"
                >
                    + Adicionar Espaço de Golpe
                </button>

                <MovesTableLearnset learnset={learnset} />
            </CollapsingSection>

            {showModifiersModal && (
                <GlobalModifiersModal
                    onClose={() => setShowModifiersModal(false)}
                    setTooltipInfo={setTooltipInfo}
                    handleGlobalChanceRoll={handleGlobalChanceRoll}
                />
            )}

            {targetingMove && (
                <TargetingModal
                    move={targetingMove}
                    baseDamage={calculateBaseDamage(targetingMove, useCharacterStore.getState())}
                    onClose={() => setTargetingMove(null)}
                    onRoll={handleExecuteDamage}
                />
            )}

            {deleteMoveId && (
                <div className="moves-table__modal-overlay">
                    <div className="moves-table__modal-content">
                        <h3 className="moves-table__modal-title">⚠️ Confirmar Exclusão</h3>
                        <p className="moves-table__modal-text">Tem certeza de que deseja excluir este Golpe?</p>
                        <div className="moves-table__modal-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark moves-table__modal-btn"
                                onClick={() => setDeleteMoveId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red moves-table__modal-btn"
                                onClick={() => {
                                    removeMove(deleteMoveId);
                                    setDeleteMoveId(null);
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tooltipInfo && (
                <div className="moves-table__modal-overlay">
                    <div className="moves-table__modal-content moves-table__modal-content--tooltip">
                        <h3 className="moves-table__modal-title moves-table__modal-title--tooltip">
                            {tooltipInfo.title}
                        </h3>
                        <p className="moves-table__modal-text moves-table__modal-text--tooltip">
                            {tooltipInfo.description}
                        </p>
                        <div className="moves-table__modal-actions moves-table__modal-actions--center">
                            <button
                                type="button"
                                className="action-button action-button--dark moves-table__modal-btn--full"
                                onClick={() => setTooltipInfo(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <DualScaleModal />
        </div>
    );
}
