import { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useCharacterStore } from '../../store/useCharacterStore';
import { NumberSpinner } from '../ui/NumberSpinner';
import { CombatStat, SocialStat, Skill } from '../../types/enums';
import {
    rollGeneric,
    parseCombatTags,
    getAbilityText,
    getStatusPenalties,
    calculateStatTotal,
    calculateSkillTotal
} from '../../utils/combatUtils';
import { STATUS_COLORS } from '../../data/constants';
import { CollapsingSection } from '../ui/CollapsingSection';
import { TooltipIcon } from '../ui/TooltipIcon';
import { TakeChancesModal } from '../modals/TakeChancesModal';
import { ClashModal } from '../modals/ClashModal';
import { RestModal } from '../modals/RestModal';
import './TrackerSection.css';

export function TrackerSection() {
    const trackers = useCharacterStore((state) => state.trackers);
    const updateTracker = useCharacterStore((state) => state.updateTracker);
    const resetRound = useCharacterStore((state) => state.resetRound);

    const activeTransformation = useCharacterStore((state) => state.identity.activeTransformation);
    const isMaxed = activeTransformation === 'Dynamax' || activeTransformation === 'Gigantamax';

    const painEnabled =
        String(useCharacterStore((state) => state.identity.pain || 'Enabled')).toLowerCase() === 'enabled';
    const will = useCharacterStore((state) => state.will);
    const health = useCharacterStore((state) => state.health);
    const updateWill = useCharacterStore((state) => state.updateWill);

    const stats = useCharacterStore((state) => state.stats);
    const derived = useCharacterStore((state) => state.derived);
    const activeStatuses = useCharacterStore((state) => state.statuses);
    const customStatuses = useCharacterStore((state) => state.roomCustomStatuses);

    const [maneuver, setManeuver] = useState('none');
    const [showClashModal, setShowClashModal] = useState(false);
    const [showRestModal, setShowRestModal] = useState(false);
    const [chancesModalOpen, setChancesModalOpen] = useState(false);
    const [tooltipInfo, setTooltipInfo] = useState<{ title: string; desc: string } | null>(null);

    const handleWillSpend = (cost: number, action: () => void) => {
        const totalWill = will.willCurr + (will.temporaryWill || 0);

        if (totalWill >= cost) {
            let remainingCost = cost;
            let newTemp = will.temporaryWill || 0;
            let newCurr = will.willCurr;

            if (newTemp > 0) {
                const deduct = Math.min(newTemp, remainingCost);
                newTemp -= deduct;
                remainingCost -= deduct;
                updateWill('temporaryWill', newTemp);
            }

            if (remainingCost > 0) {
                newCurr -= remainingCost;
                updateWill('willCurr', newCurr);
            }

            action();
        } else {
            if (OBR.isAvailable) OBR.notification.show('Pontos de Vontade insuficientes!', 'WARNING');
        }
    };

    const handleFateSpend = () => {
        if (trackers.chances > 0) {
            if (OBR.isAvailable)
                OBR.notification.show('Não é possível usar Forçar o Destino no mesmo turno que Tentar a Sorte!', 'WARNING');
            return;
        }
        handleWillSpend(1, () => updateTracker('fate', trackers.fate + 1));
    };

    const handleChanceSpend = () => {
        if (trackers.fate > 0) {
            if (OBR.isAvailable)
                OBR.notification.show('Não é possível usar Tentar a Sorte no mesmo turno que Forçar o Destino!', 'WARNING');
            return;
        }
        handleWillSpend(1, () => updateTracker('chances', trackers.chances + 1));
    };

    const openChancesModal = () => {
        if (trackers.chances <= 0) {
            if (OBR.isAvailable)
                OBR.notification.show('Sem acúmulos de Tentar a Sorte! Gaste Vontade primeiro.', 'WARNING');
            return;
        }
        setChancesModalOpen(true);
    };

    const handleEvadeRoll = () => {
        const state = useCharacterStore.getState();
        const abilityText = getAbilityText(state.identity.ability, state.roomCustomAbilities);
        const itemBuffs = parseCombatTags(state.inventory, state.extraCategories, undefined, abilityText);

        const dexTotal = calculateStatTotal(CombatStat.DEX, state, itemBuffs);
        const evadeTotal = calculateSkillTotal(Skill.EVASION, state, itemBuffs);

        rollGeneric('Evasão', dexTotal + evadeTotal, 'dex', true, false, true);
    };

    const rollManeuver = () => {
        if (maneuver === 'none') return;

        const state = useCharacterStore.getState();
        const abilityText = getAbilityText(state.identity.ability, state.roomCustomAbilities);
        const itemBuffs = parseCombatTags(state.inventory, state.extraCategories, undefined, abilityText);

        if (maneuver === 'ambush')
            rollGeneric(
                'Emboscada',
                calculateStatTotal(CombatStat.DEX, state, itemBuffs) +
                    calculateSkillTotal(Skill.STEALTH, state, itemBuffs),
                'dex',
                false,
                false,
                true
            );
        else if (maneuver === 'cover')
            rollGeneric(
                'Proteger um Aliado',
                3 + calculateStatTotal(CombatStat.INS, state, itemBuffs),
                'will',
                false,
                false,
                true
            );
        else if (maneuver === 'grapple')
            rollGeneric(
                'Agarrar',
                calculateStatTotal(CombatStat.STR, state, itemBuffs) +
                    calculateSkillTotal(Skill.BRAWL, state, itemBuffs),
                'str',
                false,
                false,
                true
            );
        else if (maneuver === 'run')
            rollGeneric(
                'Fugir',
                calculateStatTotal(CombatStat.DEX, state, itemBuffs) +
                    calculateSkillTotal(Skill.ATHLETIC, state, itemBuffs),
                'dex',
                false,
                false,
                true
            );
        else if (maneuver === 'stabilize')
            rollGeneric(
                'Estabilizar Aliado',
                calculateStatTotal(SocialStat.CLE, state, itemBuffs) +
                    calculateSkillTotal(Skill.MEDICINE, state, itemBuffs),
                'cle',
                false,
                false,
                true
            );
        else if (maneuver === 'struggle')
            rollGeneric(
                'Esforço (Precisão)',
                calculateStatTotal(CombatStat.DEX, state, itemBuffs) +
                    calculateSkillTotal(Skill.BRAWL, state, itemBuffs),
                'dex',
                false,
                false,
                true
            );
    };

    // Parse global tags to see if Reactions are blocked
    const currentState = useCharacterStore.getState();
    const abilityTxt = getAbilityText(currentState.identity.ability, currentState.roomCustomAbilities);
    const parsedGlobals = parseCombatTags(currentState.inventory, currentState.extraCategories, undefined, abilityTxt);

    const disableReactions = isMaxed || parsedGlobals.noReactions;

    // --- DERIVE ACTIVE CONDITIONS ---
    const conditions: Array<{ id: string; label: string; bg: string; text: string }> = [];

    // 1. Pain Penalty
    if (painEnabled) {
        const hpCurr = health.hpCurr;
        const hpMax = Math.max(1, health.hpMax);
        let rawPenalty = 0;

        if (hpCurr <= 1) rawPenalty = 3;
        else if (hpCurr <= Math.floor(hpMax / 2)) rawPenalty = 1;

        const finalPenalty = Math.max(0, rawPenalty - trackers.ignoredPain);
        if (finalPenalty > 0) {
            conditions.push({ id: 'pain', label: `Dor (-${finalPenalty} Suc)`, bg: '#c62828', text: '#fff' });
        }
    }

    // 2. Status Effects
    const statusPenalties = getStatusPenalties(useCharacterStore.getState());
    activeStatuses.forEach((status) => {
        if (status.name !== 'Healthy') {
            const customStatusData = customStatuses.find((s) => s.name === status.name || s.name === status.customName);

            if (customStatusData) {
                let label = customStatusData.shorthand || customStatusData.name;

                // Parse effects string to automatically append stat penalties into the Condition Pill!
                const parsedEffects = parseCombatTags([], [], undefined, customStatusData.effects);
                const penalties: string[] = [];
                Object.entries(parsedEffects.stats).forEach(([stat, val]) => {
                    if (val !== 0) penalties.push(`${val > 0 ? '+' : ''}${val} ${stat.toUpperCase()}`);
                });

                if (penalties.length > 0) label += ` (${penalties.join(', ')})`;

                conditions.push({ id: status.id, label, bg: customStatusData.color, text: customStatusData.textColor });
            } else {
                const name = status.name === 'Custom...' ? status.customName || 'Custom' : status.name;
                let label = name;

                if (status.name === 'Paralysis' && statusPenalties.paralysisDexterityPenalty < 0) {
                    label = `Paralisia (${statusPenalties.paralysisDexterityPenalty} Des)`;
                } else if (status.name === 'Confusion' && statusPenalties.confusionPenalty < 0) {
                    label = `Confusão (${statusPenalties.confusionPenalty} Suc)`;
                }

                const colors = STATUS_COLORS[status.name] || { bg: '#9C27B0', text: '#fff' };
                conditions.push({ id: status.id, label, bg: colors.bg, text: colors.text });
            }
        }
    });

    // 3. Stat Buffs & Debuffs
    const addStatCondition = (label: string, buff: number, debuff: number) => {
        if (buff > 0) conditions.push({ id: `buff-${label}`, label: `${label} +${buff}`, bg: '#1976d2', text: '#fff' });
        if (debuff > 0)
            conditions.push({ id: `debuff-${label}`, label: `${label} -${debuff}`, bg: '#d32f2f', text: '#fff' });
    };

    addStatCondition('FOR', stats[CombatStat.STR].buff, stats[CombatStat.STR].debuff);
    addStatCondition('DES', stats[CombatStat.DEX].buff, stats[CombatStat.DEX].debuff);
    addStatCondition('VIT', stats[CombatStat.VIT].buff, stats[CombatStat.VIT].debuff);
    addStatCondition('ESP', stats[CombatStat.SPE].buff, stats[CombatStat.SPE].debuff);
    addStatCondition('INS', stats[CombatStat.INS].buff, stats[CombatStat.INS].debuff);
    addStatCondition('DEF', derived.defBuff, derived.defDebuff);
    addStatCondition('D.ESP', derived.sdefBuff, derived.sdefDebuff);

    return (
        <CollapsingSection title="CONTROLADOR DE RODADA" className="sheet-panel tracker-section">
            <div className="tracker-section__horizontal-wrapper">
                {/* LEFT COLUMN: Turn Economy (Evade, Clash, Actions, Maneuvers, Reset) */}
                <div className="tracker-section__horizontal-col">
                    {/* Row 1: Evade & Clash (Left) | Actions (Right) */}
                    <div className="tracker-section__row-space-between">
                        <div className="tracker-section__buttons-group">
                            <div className="tracker-section__toggle-group">
                                <button
                                    type="button"
                                    onClick={handleEvadeRoll}
                                    disabled={disableReactions}
                                    style={{
                                        opacity: disableReactions ? 0.5 : 1,
                                        cursor: disableReactions ? 'not-allowed' : 'pointer'
                                    }}
                                    title={
                                        disableReactions ? 'Reações desabilitadas por Tags ou Transformações atuais!' : ''
                                    }
                                    className="action-button action-button--dark tracker-section__toggle-btn"
                                >
                                    🎲 Esquiva
                                </button>
                                <input
                                    type="checkbox"
                                    checked={trackers.evade}
                                    disabled={disableReactions}
                                    style={{
                                        opacity: disableReactions ? 0.5 : 1,
                                        cursor: disableReactions ? 'not-allowed' : 'pointer'
                                    }}
                                    title={
                                        disableReactions ? 'Reações desabilitadas por Tags ou Transformações atuais!' : ''
                                    }
                                    onChange={(event) => updateTracker('evade', event.target.checked)}
                                    className="sheet-save tracker-section__checkbox"
                                />
                            </div>

                            <div className="tracker-section__toggle-group">
                                <button
                                    type="button"
                                    onClick={() => setShowClashModal(true)}
                                    disabled={disableReactions}
                                    style={{
                                        opacity: disableReactions ? 0.5 : 1,
                                        cursor: disableReactions ? 'not-allowed' : 'pointer'
                                    }}
                                    title={
                                        disableReactions ? 'Reações desabilitadas por Tags ou Transformações atuais!' : ''
                                    }
                                    className="action-button action-button--dark tracker-section__toggle-btn"
                                >
                                    🎲 Confrontar
                                </button>
                                <input
                                    type="checkbox"
                                    checked={trackers.clash}
                                    disabled={disableReactions}
                                    style={{
                                        opacity: disableReactions ? 0.5 : 1,
                                        cursor: disableReactions ? 'not-allowed' : 'pointer'
                                    }}
                                    title={
                                        disableReactions ? 'Reações desabilitadas por Tags ou Transformações atuais!' : ''
                                    }
                                    onChange={(event) => updateTracker('clash', event.target.checked)}
                                    className="sheet-save tracker-section__checkbox"
                                />
                            </div>
                        </div>

                        <div className="tracker-section__action-group tracker-section__action-group--right">
                            <span className="tracker-section__action-label">Ações</span>
                            <TooltipIcon
                                onClick={() => setTooltipInfo({ title: 'Ações', desc: 'Ações tomadas nesta rodada.' })}
                            />
                            :
                            <NumberSpinner
                                value={trackers.actions}
                                onChange={(value) => updateTracker('actions', Math.max(0, Math.min(5, value)))}
                                min={0}
                                max={5}
                            />
                        </div>
                    </div>

                    {/* Row 2: Maneuvers (Left) | 1st Hit (Right) */}
                    <div className="tracker-section__row-space-between">
                        <div className="tracker-section__maneuver-subrow">
                            <select
                                value={maneuver}
                                onChange={(event) => setManeuver(event.target.value)}
                                className="tracker-section__maneuver-select"
                            >
                                <option value="none">-- Manobra --</option>
                                <option value="ambush">Emboscada (Des+Fur)</option>
                                <option value="cover">Proteger Aliado (Von)</option>
                                <option value="grapple">Agarrar (For+Bri)</option>
                                <option value="run">Fugir (Des+Atl)</option>
                                <option value="stabilize">Estabilizar (Sáb+Med)</option>
                                <option value="struggle">Esforço (Precisão)</option>
                            </select>
                            <button
                                type="button"
                                onClick={rollManeuver}
                                className="action-button action-button--dark tracker-section__maneuver-btn"
                            >
                                🎲
                            </button>
                        </div>

                        <div className="tracker-section__first-hit-group">
                            <span className="tracker-section__first-hit-label">
                                1º Golpe
                                <TooltipIcon
                                    onClick={() =>
                                        setTooltipInfo({
                                            title: 'Modificadores do 1º Golpe',
                                            desc: "Os modificadores do 1º Golpe são usados principalmente para calcular dano bônus ao Terastalizar. A opção de Precisão existe para itens Homebrew. Se você não usa essas mecânicas, pode ignorar essas caixas!"
                                        })
                                    }
                                />
                                :
                            </span>
                            <label className="tracker-section__first-hit-check">
                                <input
                                    type="checkbox"
                                    checked={trackers.firstHitAcc}
                                    onChange={(event) => updateTracker('firstHitAcc', event.target.checked)}
                                    className="sheet-save tracker-section__checkbox"
                                />{' '}
                                Prec
                            </label>
                            <label className="tracker-section__first-hit-check">
                                <input
                                    type="checkbox"
                                    checked={trackers.firstHitDmg}
                                    onChange={(event) => updateTracker('firstHitDmg', event.target.checked)}
                                    className="sheet-save tracker-section__checkbox"
                                />{' '}
                                Dano
                            </label>
                        </div>
                    </div>

                    {/* Row 3: Reset & Rest */}
                    <div className="tracker-section__reset-rest-row">
                        <button
                            type="button"
                            onClick={resetRound}
                            className="action-button action-button--red tracker-section__reset-btn"
                        >
                            🔄 Reiniciar
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowRestModal(true)}
                            className="action-button tracker-section__rest-btn"
                            title="Cura completamente HP/Vontade e limpa status"
                        >
                            🏕️ Descansar
                        </button>
                    </div>
                </div>

                {/* RIGHT COLUMN: Meta Currency & Conditions */}
                <div className="tracker-section__horizontal-col tracker-section__horizontal-col--right">
                    <div className="mobile-stack tracker-section__will-row">
                        {painEnabled && (
                            <button
                                type="button"
                                onClick={() =>
                                    handleWillSpend(1, () => updateTracker('ignoredPain', trackers.ignoredPain + 1))
                                }
                                className="action-button action-button--dark tracker-section__will-btn"
                                title="Superar a Dor: Ignora 1 penalidade de Dor pelo resto da Cena (-1 Vontade)"
                            >
                                Ignorar Penalidades de Dor
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={handleFateSpend}
                            className="action-button action-button--dark tracker-section__will-btn"
                            title="Forçar o Destino: Recebe 1 sucesso automático que não pode ser removido em uma única rolagem (-1 Vontade). (Não acumula com Tentar a Sorte)"
                        >
                            Forçar o Destino
                        </button>
                        <button
                            type="button"
                            onClick={handleChanceSpend}
                            className="action-button action-button--dark tracker-section__will-btn"
                            title="Tentar a Sorte: Rola novamente 1 dado sem sucesso de todas as Rolagens de Ação da Rodada (-1 Vontade). (Não acumula com Forçar o Destino)"
                        >
                            Tentar a Sorte
                        </button>
                    </div>

                    <div className="tracker-section__chances-row">
                        <span className="tracker-section__action-label">Tentar a Sorte</span>
                        <TooltipIcon
                            onClick={() =>
                                setTooltipInfo({
                                    title: 'Tentar a Sorte',
                                    desc: 'Rerola dados que falharam. O uso máximo é igual ao número de Vontade gasta.'
                                })
                            }
                        />
                        :
                        <NumberSpinner
                            value={trackers.chances}
                            onChange={(value) => updateTracker('chances', value)}
                            min={0}
                        />
                        <button
                            type="button"
                            onClick={openChancesModal}
                            className="action-button action-button--dark tracker-section__roll-btn"
                        >
                            🎲 Rolar
                        </button>
                    </div>

                    <div className="tracker-section__conditions-container">
                        <span className="tracker-section__conditions-label">Condições:</span>
                        <div className="tracker-section__conditions-list">
                            {conditions.length === 0 ? (
                                <span className="tracker-section__conditions-empty">Nenhuma</span>
                            ) : (
                                conditions.map((c) => (
                                    <span
                                        key={c.id}
                                        className="tracker-section__condition-pill"
                                        style={{ background: c.bg, color: c.text }}
                                    >
                                        {c.label}
                                    </span>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {chancesModalOpen && <TakeChancesModal onClose={() => setChancesModalOpen(false)} />}
            {showClashModal && <ClashModal onClose={() => setShowClashModal(false)} />}
            {showRestModal && <RestModal onClose={() => setShowRestModal(false)} />}

            {tooltipInfo && (
                <div className="tracker-modal__overlay">
                    <div className="tracker-modal__content">
                        <h3 className="tracker-modal__title">{tooltipInfo.title}</h3>
                        <p className="tracker-modal__description">{tooltipInfo.desc}</p>
                        <div className="tracker-modal__actions tracker-modal__actions--center">
                            <button
                                type="button"
                                className="action-button action-button--dark tracker-modal__btn-cancel"
                                onClick={() => setTooltipInfo(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CollapsingSection>
    );
}
