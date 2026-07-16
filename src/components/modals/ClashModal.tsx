import { useCharacterStore } from '../../store/useCharacterStore';
import { CombatStat, Skill } from '../../types/enums';
import {
    rollGeneric,
    parseCombatTags,
    getAbilityText,
    calculateStatTotal,
    calculateSkillTotal
} from '../../utils/combatUtils';

interface ClashModalProps {
    onClose: () => void;
}

export function ClashModal({ onClose }: ClashModalProps) {
    const handleClashRoll = (isPhysical: boolean) => {
        onClose();
        const state = useCharacterStore.getState();
        const abilityText = getAbilityText(state.identity.ability, state.roomCustomAbilities);
        const itemBuffs = parseCombatTags(state.inventory, state.extraCategories, undefined, abilityText);

        const statistic = isPhysical ? CombatStat.STR : CombatStat.SPE;

        const statTotal = calculateStatTotal(statistic, state, itemBuffs);
        const clashTotal = calculateSkillTotal(Skill.CLASH, state, itemBuffs);

        rollGeneric(
            isPhysical ? 'Confronto Físico' : 'Confronto Especial',
            statTotal + clashTotal,
            statistic,
            false,
            true,
            true
        );
    };

    return (
        <div className="tracker-modal__overlay">
            <div className="tracker-modal__content tracker-modal__content--clash">
                <h3 className="tracker-modal__title">⚔️ Selecionar Tipo de Confronto</h3>
                <p className="tracker-modal__description">Qual atributo você está usando para Confrontar?</p>
                <div className="tracker-modal__clash-actions">
                    <button
                        type="button"
                        onClick={() => handleClashRoll(true)}
                        className="action-button action-button--dark tracker-modal__clash-btn-phys"
                    >
                        💪 Físico (FOR)
                    </button>
                    <button
                        type="button"
                        onClick={() => handleClashRoll(false)}
                        className="action-button action-button--dark tracker-modal__clash-btn-spec"
                    >
                        ✨ Especial (ESP)
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button action-button--dark tracker-modal__clash-btn-cancel"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}
