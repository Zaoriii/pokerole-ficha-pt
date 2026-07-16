import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { CombatStat, Skill } from '../../types/enums';
import { ResourceBox } from '../ui/ResourceBox';
import { NumberSpinner } from '../ui/NumberSpinner';
import { rollDicePlus } from '../../utils/diceRoller';
import { CollapsingSection } from '../ui/CollapsingSection';
import { TooltipIcon } from '../ui/TooltipIcon';
import { StatusBox } from '../board/StatusBox';
import { TimerBox } from './TimerBox';
import { parseCombatTags, getAbilityText, calculateStatTotal, calculateSkillTotal } from '../../utils/combatUtils';
import './DerivedBoard.css';

export function DerivedBoard() {
    const ruleset = useCharacterStore((state) => state.identity.ruleset);
    const mode = useCharacterStore((state) => state.identity.mode);
    const ability = useCharacterStore((state) => state.identity.ability);
    const customAbilities = useCharacterStore((state) => state.roomCustomAbilities);

    const health = useCharacterStore((state) => state.health);
    const will = useCharacterStore((state) => state.will);
    const updateHealth = useCharacterStore((state) => state.updateHealth);
    const updateWill = useCharacterStore((state) => state.updateWill);

    // Call selectors to ensure the component re-renders when these change,
    // but without assigning them to unused variables!
    useCharacterStore((state) => state.stats);
    useCharacterStore((state) => state.skills);

    const derived = useCharacterStore((state) => state.derived);
    const setDerived = useCharacterStore((state) => state.setDerived);

    const inventory = useCharacterStore((state) => state.inventory);
    const extraCategories = useCharacterStore((state) => state.extraCategories);

    const [tooltipInfo, setTooltipInfo] = useState<{ title: string; desc: string } | null>(null);

    // HP Modals
    const [showAddTempModal, setShowAddTempModal] = useState(false);
    const [newTempHp, setNewTempHp] = useState(0);
    const [showTempConfirm, setShowTempConfirm] = useState(false);

    // Will Modals
    const [showAddTempWillModal, setShowAddTempWillModal] = useState(false);
    const [newTempWill, setNewTempWill] = useState(0);
    const [showTempWillConfirm, setShowTempWillConfirm] = useState(false);

    const abilityText = getAbilityText(ability, customAbilities);
    const inventoryModifiers = parseCombatTags(inventory, extraCategories, undefined, abilityText);
    const fullState = useCharacterStore.getState();

    const vitTotal = calculateStatTotal(CombatStat.VIT, fullState, inventoryModifiers);
    const insTotal = calculateStatTotal(CombatStat.INS, fullState, inventoryModifiers);
    const dexTotal = calculateStatTotal(CombatStat.DEX, fullState, inventoryModifiers);
    const strTotal = calculateStatTotal(CombatStat.STR, fullState, inventoryModifiers);
    const speTotal = calculateStatTotal(CombatStat.SPE, fullState, inventoryModifiers);

    const defTotal = Math.max(1, vitTotal + derived.defBuff - derived.defDebuff + inventoryModifiers.def);
    let sdefBase = insTotal;
    if (ruleset === 'tabletop') sdefBase = vitTotal;
    const sdefTotal = Math.max(1, sdefBase + derived.sdefBuff - derived.sdefDebuff + inventoryModifiers.spd);

    const alertTotal = calculateSkillTotal(Skill.ALERT, fullState, inventoryModifiers);
    const initiative = dexTotal + alertTotal + inventoryModifiers.init;

    const clashPhysical = strTotal + calculateSkillTotal(Skill.CLASH, fullState, inventoryModifiers);
    const clashSpecial = speTotal + calculateSkillTotal(Skill.CLASH, fullState, inventoryModifiers);

    return (
        <CollapsingSection title="INFORMAÇÕES">
            <div className="derived-board__container">
                <div className="derived-board__health-row">
                    <div className="derived-board__health-box">
                        <ResourceBox
                            title="HP"
                            curr={health.hpCurr}
                            max={health.hpMax}
                            base={health.hpBase}
                            temp={health.temporaryHitPoints}
                            tempMax={health.temporaryHitPointsMax}
                            tempType="hp"
                            color="var(--primary)"
                            onCurrChange={(value: number) => updateHealth('hpCurr', value)}
                            onBaseChange={(value: number) => updateHealth('hpBase', value)}
                            onTempChange={(value: number) => updateHealth('temporaryHitPoints', value)}
                            onClearTemp={() => setShowTempConfirm(true)}
                            onAddTempClick={() => {
                                setNewTempHp(health.temporaryHitPointsMax || 0);
                                setShowAddTempModal(true);
                            }}
                        />
                    </div>
                    <div className="derived-board__health-box">
                        <ResourceBox
                            title="VONTADE"
                            curr={will.willCurr}
                            max={will.willMax}
                            base={will.willBase}
                            temp={will.temporaryWill}
                            tempMax={will.temporaryWillMax}
                            tempType="will"
                            color="#2196F3"
                            onCurrChange={(value: number) => updateWill('willCurr', value)}
                            onBaseChange={(value: number) => updateWill('willBase', value)}
                            onTempChange={(value: number) => updateWill('temporaryWill', value)}
                            onClearTemp={() => setShowTempWillConfirm(true)}
                            onAddTempClick={() => {
                                setNewTempWill(will.temporaryWillMax || 0);
                                setShowAddTempWillModal(true);
                            }}
                        />
                    </div>
                    <StatusBox />
                </div>

                <div className="derived-board__health-row">
                    <div className="sheet-panel health-section__box derived-board__box">
                        <div className="derived-board__box-header derived-board__box-header--primary">DEFESA</div>
                        <div className="derived-board__box-content">
                            <span className="derived-board__total-text">
                                Total: <strong>{defTotal}</strong>
                            </span>
                            <span className="derived-board__plus">+</span>
                            <NumberSpinner
                                value={derived.defBuff}
                                onChange={(value: number) => setDerived('defBuff', value)}
                                min={0}
                            />
                            <span className="derived-board__minus">-</span>
                            <NumberSpinner
                                value={derived.defDebuff}
                                onChange={(value: number) => setDerived('defDebuff', value)}
                                min={0}
                            />
                        </div>
                    </div>

                    <div className="sheet-panel health-section__box derived-board__box">
                        <div className="derived-board__box-header derived-board__box-header--primary">
                            DEF. ESPECIAL
                        </div>
                        <div className="derived-board__box-content">
                            <span className="derived-board__total-text">
                                Total: <strong>{sdefTotal}</strong>
                            </span>
                            <span className="derived-board__plus">+</span>
                            <NumberSpinner
                                value={derived.sdefBuff}
                                onChange={(value: number) => setDerived('sdefBuff', value)}
                                min={0}
                            />
                            <span className="derived-board__minus">-</span>
                            <NumberSpinner
                                value={derived.sdefDebuff}
                                onChange={(value: number) => setDerived('sdefDebuff', value)}
                                min={0}
                            />
                        </div>
                    </div>

                    <TimerBox />
                </div>

                <div className="derived-board__health-row">
                    <div className="sheet-panel health-section__box derived-board__box derived-board__box--large">
                        <div className="derived-board__box-header derived-board__box-header--dark derived-board__box-header--small">
                            INICIATIVA{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setTooltipInfo({ title: 'Iniciativa', desc: 'Iniciativa: Destreza + Alerta' })
                                }
                            />
                        </div>
                        <div className="derived-board__box-content derived-board__box-content--dark-text">
                            1d6 + {initiative}
                            <button
                                className="action-button action-button--dark derived-board__roll-btn"
                                onClick={() =>
                                    rollDicePlus(`1d6+${initiative}`, 'Iniciativa', 'init', String(initiative))
                                }
                            >
                                🎲
                            </button>
                        </div>
                    </div>
                    <div className="sheet-panel health-section__box derived-board__box">
                        <div className="derived-board__box-header derived-board__box-header--dark derived-board__box-header--small">
                            ESQUIVA{' '}
                            <TooltipIcon
                                onClick={() => setTooltipInfo({ title: 'Esquiva', desc: 'Esquiva: Destreza + Evasão' })}
                            />
                        </div>
                        <div className="derived-board__box-content derived-board__box-content--dark-text">
                            {dexTotal + calculateSkillTotal(Skill.EVASION, fullState, inventoryModifiers)}
                        </div>
                    </div>

                    {mode === 'Pokémon' && (
                        <>
                            <div className="sheet-panel health-section__box derived-board__box">
                                <div className="derived-board__box-header derived-board__box-header--dark derived-board__box-header--small">
                                    CONFRONTO(F){' '}
                                    <TooltipIcon
                                        onClick={() =>
                                            setTooltipInfo({
                                                title: 'Confronto Físico',
                                                desc: 'Confronto Físico: Força + Confronto'
                                            })
                                        }
                                    />
                                </div>
                                <div className="derived-board__box-content derived-board__box-content--dark-text">
                                    {clashPhysical}
                                </div>
                            </div>
                            <div className="sheet-panel health-section__box derived-board__box">
                                <div className="derived-board__box-header derived-board__box-header--dark derived-board__box-header--small">
                                    CONFRONTO(E){' '}
                                    <TooltipIcon
                                        onClick={() =>
                                            setTooltipInfo({
                                                title: 'Confronto Especial',
                                                desc: 'Confronto Especial: Especial + Confronto'
                                            })
                                        }
                                    />
                                </div>
                                <div className="derived-board__box-content derived-board__box-content--dark-text">
                                    {clashSpecial}
                                </div>
                            </div>
                            <div className="sheet-panel health-section__box derived-board__box derived-board__box--yellow-border">
                                <div className="derived-board__box-header derived-board__box-header--yellow derived-board__box-header--small">
                                    FELIZ
                                </div>
                                <div className="derived-board__box-content">
                                    <NumberSpinner
                                        value={derived.happy}
                                        onChange={(value: number) => setDerived('happy', value)}
                                        min={0}
                                        max={5}
                                    />
                                </div>
                            </div>
                            <div className="sheet-panel health-section__box derived-board__box derived-board__box--purple-border">
                                <div className="derived-board__box-header derived-board__box-header--purple derived-board__box-header--small">
                                    LEAL
                                </div>
                                <div className="derived-board__box-content">
                                    <NumberSpinner
                                        value={derived.loyal}
                                        onChange={(value: number) => setDerived('loyal', value)}
                                        min={0}
                                        max={5}
                                    />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {tooltipInfo && (
                <div className="derived-board__modal-overlay">
                    <div className="derived-board__modal-content">
                        <h3 className="derived-board__modal-title">{tooltipInfo.title}</h3>
                        <p className="derived-board__modal-desc">{tooltipInfo.desc}</p>
                        <div className="derived-board__modal-btn-container">
                            <button
                                type="button"
                                className="action-button action-button--dark derived-board__modal-btn"
                                onClick={() => setTooltipInfo(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddTempModal && (
                <div className="derived-board__modal-overlay">
                    <div className="derived-board__modal-content">
                        <h3 className="derived-board__modal-title derived-board__modal-title--temp-hp">
                            🛡️ Definir HP Temporário
                        </h3>
                        <p className="derived-board__modal-desc">
                            Insira a quantidade de HP Temporário a conceder. Isso substituirá qualquer escudo existente.
                        </p>
                        <div className="derived-board__spinner-wrapper">
                            <NumberSpinner value={newTempHp} onChange={setNewTempHp} min={0} max={999} />
                        </div>
                        <div className="derived-board__modal-btn-container derived-board__modal-btn-container--spaced">
                            <button
                                type="button"
                                className="action-button action-button--dark derived-board__modal-btn"
                                onClick={() => setShowAddTempModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button derived-board__modal-btn derived-board__modal-btn--temp-hp"
                                onClick={() => {
                                    updateHealth('temporaryHitPointsMax', newTempHp);
                                    updateHealth('temporaryHitPoints', newTempHp);
                                    setShowAddTempModal(false);
                                }}
                            >
                                Aplicar Escudo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTempConfirm && (
                <div className="derived-board__modal-overlay">
                    <div className="derived-board__modal-content">
                        <h3 className="derived-board__modal-title derived-board__modal-title--clear-hp">
                            ⚠️ Limpar HP Temp.
                        </h3>
                        <p className="derived-board__modal-desc">
                            Tem certeza de que deseja remover completamente seu Escudo de HP Temporário?
                        </p>
                        <div className="derived-board__modal-btn-container derived-board__modal-btn-container--spaced">
                            <button
                                type="button"
                                className="action-button action-button--dark derived-board__modal-btn"
                                onClick={() => setShowTempConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red derived-board__modal-btn"
                                onClick={() => {
                                    updateHealth('temporaryHitPoints', 0);
                                    updateHealth('temporaryHitPointsMax', 0);
                                    setShowTempConfirm(false);
                                }}
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showAddTempWillModal && (
                <div className="derived-board__modal-overlay">
                    <div className="derived-board__modal-content">
                        <h3 className="derived-board__modal-title derived-board__modal-title--temp-will">
                            🌟 Definir Vontade Temp.
                        </h3>
                        <p className="derived-board__modal-desc">
                            Insira a quantidade de Vontade Temporária a conceder. Isso substituirá qualquer Vontade Temporária existente.
                        </p>
                        <div className="derived-board__spinner-wrapper">
                            <NumberSpinner value={newTempWill} onChange={setNewTempWill} min={0} max={999} />
                        </div>
                        <div className="derived-board__modal-btn-container derived-board__modal-btn-container--spaced">
                            <button
                                type="button"
                                className="action-button action-button--dark derived-board__modal-btn"
                                onClick={() => setShowAddTempWillModal(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button derived-board__modal-btn derived-board__modal-btn--temp-will"
                                onClick={() => {
                                    updateWill('temporaryWillMax', newTempWill);
                                    updateWill('temporaryWill', newTempWill);
                                    setShowAddTempWillModal(false);
                                }}
                            >
                                Aplicar Vontade Temp.
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showTempWillConfirm && (
                <div className="derived-board__modal-overlay">
                    <div className="derived-board__modal-content">
                        <h3 className="derived-board__modal-title derived-board__modal-title--clear-will">
                            ⚠️ Limpar Vontade Temp.
                        </h3>
                        <p className="derived-board__modal-desc">
                            Tem certeza de que deseja remover completamente sua Vontade Temporária?
                        </p>
                        <div className="derived-board__modal-btn-container derived-board__modal-btn-container--spaced">
                            <button
                                type="button"
                                className="action-button action-button--dark derived-board__modal-btn"
                                onClick={() => setShowTempWillConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red derived-board__modal-btn"
                                onClick={() => {
                                    updateWill('temporaryWill', 0);
                                    updateWill('temporaryWillMax', 0);
                                    setShowTempWillConfirm(false);
                                }}
                            >
                                Limpar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CollapsingSection>
    );
}
