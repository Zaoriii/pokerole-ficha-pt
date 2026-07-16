import { useCharacterStore } from '../../store/useCharacterStore';
import './PrintSettingsModal.css';

interface PrintSettingsModalProps {
    onClose: () => void;
}

export function PrintSettingsModal({ onClose }: PrintSettingsModalProps) {
    const printConfig = useCharacterStore((state) => state.identity.printConfig);
    const setPrintConfig = useCharacterStore((state) => state.setPrintConfig);
    const setIdentity = useCharacterStore((state) => state.setIdentity);

    const toggle = (field: keyof typeof printConfig) => {
        setPrintConfig({ [field]: !printConfig[field] });
    };

    const handlePrint = () => {
        setIdentity('isPrinting', true);
        onClose();
    };

    return (
        <div className="print-settings__overlay">
            <div className="print-settings__content print-settings__content--expanded">
                <div className="print-settings__header-row">
                    <h3 className="print-settings__title">🖨️ Configurações de Impressão</h3>
                    <button onClick={onClose} className="print-settings__close-x" title="Fechar">
                        X
                    </button>
                </div>
                <p className="print-settings__desc">Personalize como sua ficha vai ficar no papel.</p>

                <div className="print-settings__grid">
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankName}
                            onChange={() => toggle('blankName')}
                            className="print-settings__checkbox"
                        />
                        Nome em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankSpecies}
                            onChange={() => toggle('blankSpecies')}
                            className="print-settings__checkbox"
                        />
                        Espécie em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankType}
                            onChange={() => toggle('blankType')}
                            className="print-settings__checkbox"
                        />
                        Tipo em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankNature}
                            onChange={() => toggle('blankNature')}
                            className="print-settings__checkbox"
                        />
                        Natureza em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankRank}
                            onChange={() => toggle('blankRank')}
                            className="print-settings__checkbox"
                        />
                        Rank em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankAgeGender}
                            onChange={() => toggle('blankAgeGender')}
                            className="print-settings__checkbox"
                        />
                        Idade/Gênero em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankStats}
                            onChange={() => toggle('blankStats')}
                            className="print-settings__checkbox"
                        />
                        Atributos Base em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankSocials}
                            onChange={() => toggle('blankSocials')}
                            className="print-settings__checkbox"
                        />
                        Sociais em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankSkills}
                            onChange={() => toggle('blankSkills')}
                            className="print-settings__checkbox"
                        />
                        Perícias em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankAbilities}
                            onChange={() => toggle('blankAbilities')}
                            className="print-settings__checkbox"
                        />
                        Habilidades em Branco
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.blankMoves}
                            onChange={() => toggle('blankMoves')}
                            className="print-settings__checkbox"
                        />
                        Golpes em Branco
                    </label>
                </div>

                <div className="print-settings__divider" />
                <p className="print-settings__desc print-settings__desc--sub">Opções de Visibilidade</p>

                <div className="print-settings__grid">
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.hideMoveDesc}
                            onChange={() => toggle('hideMoveDesc')}
                            className="print-settings__checkbox"
                        />
                        Ocultar Descrições dos Golpes
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.hideKnowledgeSkills}
                            onChange={() => toggle('hideKnowledgeSkills')}
                            className="print-settings__checkbox"
                        />
                        Ocultar Perícias de Conhecimento
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.hideCustomSkills}
                            onChange={() => toggle('hideCustomSkills')}
                            className="print-settings__checkbox"
                        />
                        Ocultar Perícias Personalizadas
                    </label>
                    <label className="print-settings__checkbox-label">
                        <input
                            type="checkbox"
                            checked={printConfig.hideAge}
                            onChange={() => toggle('hideAge')}
                            className="print-settings__checkbox"
                        />
                        Ocultar Idade (Somente Gênero)
                    </label>
                    <label className="print-settings__checkbox-label" style={{ gridColumn: 'span 2' }}>
                        <input
                            type="checkbox"
                            checked={printConfig.compactMode}
                            onChange={() => toggle('compactMode')}
                            className="print-settings__checkbox"
                        />
                        Layout Compacto (Cabe Mais na Página 1)
                    </label>
                    <label className="print-settings__checkbox-label" style={{ gridColumn: 'span 2' }}>
                        <input
                            type="checkbox"
                            checked={printConfig.coreSkillsOnly}
                            onChange={() => toggle('coreSkillsOnly')}
                            className="print-settings__checkbox"
                        />
                        Exibir Apenas as 3 Categorias de Perícias Base (Centralizado)
                    </label>
                    <label className="print-settings__checkbox-label" style={{ gridColumn: 'span 2' }}>
                        <input
                            type="checkbox"
                            checked={printConfig.showOnlyActiveAbility}
                            onChange={() => toggle('showOnlyActiveAbility')}
                            className="print-settings__checkbox"
                        />
                        Mostrar Apenas Habilidade Ativa
                    </label>
                </div>

                <div className="print-settings__divider" />
                <p className="print-settings__desc print-settings__desc--sub">Estilos de Exibição</p>

                <div className="print-settings__dropdowns-wrapper">
                    <div className="print-settings__dropdown-container">
                        <label className="print-settings__dropdown-label">Formato de Atributo:</label>
                        <select
                            value={printConfig.statStyle || 'dots'}
                            onChange={(e) =>
                                setPrintConfig({ statStyle: e.target.value as 'dots' | 'numbers' | 'both' })
                            }
                            className="print-settings__select"
                        >
                            <option value="dots">Somente Pontos</option>
                            <option value="numbers">Somente Números</option>
                            <option value="both">Pontos e Números</option>
                        </select>
                    </div>

                    <div className="print-settings__dropdown-container">
                        <label className="print-settings__dropdown-label">Descr. de Habilidade:</label>
                        <select
                            value={printConfig.abilityDescStyle || 'all'}
                            onChange={(e) =>
                                setPrintConfig({ abilityDescStyle: e.target.value as 'all' | 'selected' | 'none' })
                            }
                            className="print-settings__select"
                        >
                            <option value="all">Mostrar Tudo</option>
                            <option value="selected">Somente Ativa</option>
                            <option value="none">Ocultar Tudo</option>
                        </select>
                    </div>
                </div>

                <div className="print-settings__actions">
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="action-button action-button--dark print-settings__btn"
                    >
                        🖨️ Imprimir Ficha
                    </button>
                </div>
            </div>
        </div>
    );
}
