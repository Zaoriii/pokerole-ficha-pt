import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { CombatStat, SocialStat, Skill } from '../../types/enums';
import { rollSkillCheck, rollDicePlus } from '../../utils/combatUtils';
import { CollapsingSection } from '../ui/CollapsingSection';
import { NumberSpinner } from '../ui/NumberSpinner';
import './ActionRolls.css';

const ATTRIBUTE_OPTIONS = [...Object.values(CombatStat), ...Object.values(SocialStat), 'will'] as const;

export function ActionRolls() {
    const skillChecks = useCharacterStore((state) => state.skillChecks);
    const addSkillCheck = useCharacterStore((state) => state.addSkillCheck);
    const updateSkillCheck = useCharacterStore((state) => state.updateSkillCheck);
    const removeSkillCheck = useCharacterStore((state) => state.removeSkillCheck);

    const skills = useCharacterStore((state) => state.skills);
    const extraCategories = useCharacterStore((state) => state.extraCategories);

    const [deleteRollId, setDeleteRollId] = useState<string | null>(null);
    const [basicDiceCount, setBasicDiceCount] = useState(1);

    const handleBasicRoll = () => {
        const state = useCharacterStore.getState();
        const nickname = state.identity.nickname || state.identity.species || 'Alguém';
        rollDicePlus(`${Math.max(1, basicDiceCount)}d6>3`, `🎲 ${nickname} rolou dados personalizados!`);
    };

    const headerElements = (
        <div className="action-rolls__header-roller">
            <span className="action-rolls__header-label">Rolagem Rápida:</span>
            <NumberSpinner value={basicDiceCount} onChange={setBasicDiceCount} min={1} max={99} />
            <button
                type="button"
                className="action-button action-button--dark action-rolls__header-btn"
                onClick={handleBasicRoll}
                title="Rolar Dados Personalizados"
            >
                🎲
            </button>
        </div>
    );

    return (
        <CollapsingSection title="ROLAGENS DE AÇÃO" headerElements={headerElements}>
            <div className="table-responsive-wrapper">
                <table className="data-table action-rolls__table">
                    <thead>
                        <tr className="action-rolls__header-row">
                            <th className="action-rolls__name-column">Nome da Ação</th>
                            <th>Atributo</th>
                            <th>Perícia</th>
                            <th className="action-rolls__button-column">Rolar</th>
                            <th className="action-rolls__button-column">Exc.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {skillChecks.map((check) => (
                            <tr key={check.id} className="data-table__row--dynamic action-rolls__row">
                                <td className="data-table__cell--middle">
                                    <input
                                        type="text"
                                        className="identity-grid__input action-rolls__input"
                                        placeholder="ex: Investigar"
                                        value={check.name}
                                        onChange={(event) => updateSkillCheck(check.id, 'name', event.target.value)}
                                    />
                                </td>
                                <td className="data-table__cell--middle action-rolls__select-cell">
                                    <select
                                        className="identity-grid__select action-rolls__select"
                                        value={check.attr}
                                        onChange={(event) => updateSkillCheck(check.id, 'attr', event.target.value)}
                                    >
                                        {ATTRIBUTE_OPTIONS.map((attribute) => (
                                            <option key={attribute} value={attribute}>
                                                {attribute.toUpperCase()}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="data-table__cell--middle action-rolls__select-cell">
                                    <select
                                        className="identity-grid__select action-rolls__select"
                                        value={check.skill}
                                        onChange={(event) => updateSkillCheck(check.id, 'skill', event.target.value)}
                                    >
                                        <option value="none">-- Nenhuma --</option>
                                        {Object.values(Skill).map((skill) => (
                                            <option key={skill} value={skill.toLowerCase()}>
                                                {skills[skill].customName ||
                                                    skill.charAt(0).toUpperCase() + skill.slice(1)}
                                            </option>
                                        ))}
                                        {extraCategories.map((category) => (
                                            <optgroup key={category.id} label={category.name || 'EXTRA'}>
                                                {category.skills.map((extraSkill) => (
                                                    <option key={extraSkill.id} value={extraSkill.id}>
                                                        {extraSkill.name || 'Sem nome'}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </td>
                                <td className="data-table__cell--middle">
                                    <button
                                        type="button"
                                        className="action-button action-button--dark action-rolls__icon-btn"
                                        onClick={() => rollSkillCheck(check, useCharacterStore.getState())}
                                    >
                                        🎲
                                    </button>
                                </td>
                                <td className="data-table__cell--middle">
                                    <button
                                        type="button"
                                        className="action-button action-button--red action-rolls__icon-btn"
                                        onClick={() => setDeleteRollId(check.id)}
                                    >
                                        X
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <button
                type="button"
                className="action-button action-button--dark action-rolls__add-btn"
                onClick={addSkillCheck}
            >
                + Adicionar Rolagem de Ação
            </button>

            {deleteRollId && (
                <div className="action-rolls__modal-overlay">
                    <div className="action-rolls__modal-content">
                        <h3 className="action-rolls__modal-title">⚠️ Confirmar Exclusão</h3>
                        <p className="action-rolls__modal-text">Tem certeza de que deseja excluir esta Rolagem de Ação?</p>
                        <div className="action-rolls__modal-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark action-rolls__modal-btn"
                                onClick={() => setDeleteRollId(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red action-rolls__modal-btn"
                                onClick={() => {
                                    removeSkillCheck(deleteRollId);
                                    setDeleteRollId(null);
                                }}
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CollapsingSection>
    );
}
