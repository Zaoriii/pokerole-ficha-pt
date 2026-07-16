import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { generateBuild } from '../../utils/generatorUtils';
import type { TempBuild } from '../../store/storeTypes';
import { CombatStat, SocialStat } from '../../types/enums';
import { GeneratorPreviewModal } from './GeneratorPreviewModal';
import { TooltipIcon } from '../ui/TooltipIcon';
import { NumberSpinner } from '../ui/NumberSpinner';
import './GeneratorModal.css';

export function GeneratorModal({ onClose }: { onClose: () => void }) {
    const state = useCharacterStore();
    const config = useCharacterStore((s) => s.generatorConfig);
    const setConfig = useCharacterStore((s) => s.setGeneratorConfig);
    const speciesName = state.identity.species;

    const [isGenerating, setIsGenerating] = useState(false);
    const [previewBuild, setPreviewBuild] = useState<TempBuild | null>(null);
    const [tooltipInfo, setTooltipInfo] = useState<{ title: string; desc: string } | null>(null);

    const hasType2 = state.identity.type2 && state.identity.type2 !== 'None';
    const type1Label = state.identity.type1 || 'Primário';
    const type2Label = hasType2 ? state.identity.type2 : 'Secundário';

    const setMinStat = (stat: string, val: number) => {
        setConfig({ minStats: { ...(config.minStats || {}), [stat]: val } });
    };

    const setMinSocial = (stat: string, val: number) => {
        setConfig({ minSocials: { ...(config.minSocials || {}), [stat]: val } });
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const result = await generateBuild(config, state);
            if (result) {
                setPreviewBuild(result);
            } else {
                alert(`Falha ao gerar o build. Verifique o console para detalhes.`);
            }
        } catch (error) {
            console.error('Auto-Build Error:', error);
            alert(
                `Ocorreu um erro ao gerar o build: ${error instanceof Error ? error.message : 'Erro Desconhecido'}`
            );
        } finally {
            setIsGenerating(false);
        }
    };

    if (previewBuild) {
        return (
            <GeneratorPreviewModal
                build={previewBuild}
                onClose={() => {
                    setPreviewBuild(null);
                    onClose();
                }}
                onReroll={handleGenerate}
            />
        );
    }

    return (
        <div className="generator-modal__overlay">
            <div className="generator-modal__content">
                <h3 className="generator-modal__title">🎲 Geração Automática de Pokémon</h3>
                <p className="generator-modal__desc">Gera atributos, perícias e golpes com base no Rank atual.</p>

                <div className="generator-modal__form-group">
                    <div className="generator-modal__row">
                        <div className="generator-modal__col">
                            <label className="generator-modal__label">Nível de Build:</label>
                            <select
                                value={config.buildType}
                                onChange={(e) => setConfig({ buildType: e.target.value })}
                                className="generator-modal__select"
                            >
                                <option value="wild">Selvagem (Aleatório)</option>
                                <option value="average">Médio</option>
                                <option value="minmax">Min-Max</option>
                            </select>
                        </div>
                        <div className="generator-modal__col">
                            <label className="generator-modal__label">Tendência de Combate:</label>
                            <select
                                value={config.combatBias}
                                onChange={(e) => setConfig({ combatBias: e.target.value })}
                                className="generator-modal__select"
                                disabled={config.randomizeSpecies && config.autoSelectBias}
                            >
                                <option value="balanced">Equilibrado</option>
                                <option value="physical">Atacante Físico</option>
                                <option value="special">Atacante Especial</option>
                                <option value="tank">Tanque / Defensor</option>
                                <option value="support">Status / Suporte</option>
                            </select>
                        </div>
                    </div>

                    <div className="generator-modal__side-by-side">
                        {/* COLUMN 1: Min Stats */}
                        <div className="generator-modal__composition">
                            <label className="generator-modal__comp-title">Ranks Mínimos Garantidos</label>
                            <p className="generator-modal__comp-desc">
                                Força o gerador a alocar pontos aqui antes de processar sua lógica principal.
                            </p>

                            <div className="generator-modal__min-wrapper">
                                <div className="generator-modal__min-grid">
                                    {Object.values(CombatStat).map((stat) => (
                                        <div key={stat} className="generator-modal__min-item">
                                            <span className="generator-modal__min-label">{stat.toUpperCase()}</span>
                                            <input
                                                type="number"
                                                value={config.minStats?.[stat] || 0}
                                                onChange={(e) => setMinStat(stat, Number(e.target.value))}
                                                min="0"
                                                max="5"
                                                className="generator-modal__comp-input"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="generator-modal__min-grid generator-modal__min-grid--spaced">
                                    {Object.values(SocialStat).map((stat) => (
                                        <div key={stat} className="generator-modal__min-item">
                                            <span className="generator-modal__min-label">{stat.toUpperCase()}</span>
                                            <input
                                                type="number"
                                                value={config.minSocials?.[stat] || 0}
                                                onChange={(e) => setMinSocial(stat, Number(e.target.value))}
                                                min="0"
                                                max="5"
                                                className="generator-modal__comp-input"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* COLUMN 2: Move Composition */}
                        <div className="generator-modal__composition">
                            <label className="generator-modal__comp-title">Composição de Golpes</label>
                            <p className="generator-modal__comp-desc">
                                Insight vai se ajustar automaticamente para atingir esse total.
                            </p>
                            <div className="generator-modal__comp-row">
                                <div className="generator-modal__comp-item">
                                    <span className="generator-modal__comp-label">Ataques</span>
                                    <input
                                        type="number"
                                        value={config.targetAtkCount}
                                        onChange={(e) => setConfig({ targetAtkCount: Number(e.target.value) })}
                                        min="0"
                                        max="6"
                                        className="generator-modal__comp-input"
                                    />
                                </div>
                                <div className="generator-modal__comp-item">
                                    <span className="generator-modal__comp-label">Suporte</span>
                                    <input
                                        type="number"
                                        value={config.targetSupCount}
                                        onChange={(e) => setConfig({ targetSupCount: Number(e.target.value) })}
                                        min="0"
                                        max="6"
                                        className="generator-modal__comp-input"
                                    />
                                </div>
                            </div>

                            <div className="generator-modal__spillover-section">
                                <label className="generator-modal__checkbox-label generator-modal__checkbox-label--bold">
                                    <input
                                        type="checkbox"
                                        checked={config.useSpilloverRatio}
                                        onChange={(e) => setConfig({ useSpilloverRatio: e.target.checked })}
                                        className="generator-modal__checkbox"
                                    />
                                    Usar Proporção de Transbordo Personalizada?
                                    <TooltipIcon
                                        onClick={() =>
                                            setTooltipInfo({
                                                title: 'Proporção de Transbordo',
                                                desc: 'Se um Insight alto conceder mais Golpes Máximos do que suas metas iniciais, essa proporção determina como os espaços extras são preenchidos. (ex: 2 Ataques para cada 1 Suporte).'
                                            })
                                        }
                                    />
                                </label>

                                {config.useSpilloverRatio && (
                                    <>
                                        <div className="generator-modal__spillover-inputs">
                                            <div className="generator-modal__comp-item generator-modal__comp-item--row">
                                                <NumberSpinner
                                                    value={config.spilloverAtkRatio}
                                                    onChange={(val) => setConfig({ spilloverAtkRatio: val })}
                                                    min={0}
                                                    max={9}
                                                />
                                                <span className="generator-modal__spillover-text">Atq</span>
                                            </div>
                                            <span className="generator-modal__spillover-colon">:</span>
                                            <div className="generator-modal__comp-item generator-modal__comp-item--row">
                                                <NumberSpinner
                                                    value={config.spilloverSupRatio}
                                                    onChange={(val) => setConfig({ spilloverSupRatio: val })}
                                                    min={0}
                                                    max={9}
                                                />
                                                <span className="generator-modal__spillover-text">Sup</span>
                                            </div>
                                        </div>
                                        <label className="generator-modal__checkbox-label generator-modal__checkbox-label--center">
                                            <input
                                                type="checkbox"
                                                checked={config.spilloverJitter}
                                                onChange={(e) => setConfig({ spilloverJitter: e.target.checked })}
                                                className="generator-modal__checkbox"
                                            />
                                            Adicionar Variação de +/- 25%
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* COLUMN 3: Attack Type Ratios */}
                        {config.buildType !== 'wild' ? (
                            <div className="generator-modal__composition">
                                <label className="generator-modal__comp-title">Proporção de Tipos de Ataque</label>
                                <p className="generator-modal__comp-desc">Sobrescreve contagens de STAB e Cobertura.</p>
                                <div className="generator-modal__coverage-section">
                                    <div className="generator-modal__coverage-row">
                                        <label className="generator-modal__checkbox-label" title={type1Label}>
                                            <input
                                                type="checkbox"
                                                checked={config.overridePrimaryStab}
                                                onChange={(e) => setConfig({ overridePrimaryStab: e.target.checked })}
                                                className="generator-modal__checkbox"
                                            />
                                            STAB 1
                                        </label>
                                        <input
                                            type="number"
                                            value={config.primaryStabCount}
                                            onChange={(e) => setConfig({ primaryStabCount: Number(e.target.value) })}
                                            min="0"
                                            max="6"
                                            className="generator-modal__comp-input"
                                            disabled={!config.overridePrimaryStab}
                                        />
                                    </div>
                                    {hasType2 && (
                                        <div className="generator-modal__coverage-row">
                                            <label className="generator-modal__checkbox-label" title={type2Label}>
                                                <input
                                                    type="checkbox"
                                                    checked={config.overrideSecondaryStab}
                                                    onChange={(e) =>
                                                        setConfig({ overrideSecondaryStab: e.target.checked })
                                                    }
                                                    className="generator-modal__checkbox"
                                                />
                                                STAB 2
                                            </label>
                                            <input
                                                type="number"
                                                value={config.secondaryStabCount}
                                                onChange={(e) =>
                                                    setConfig({ secondaryStabCount: Number(e.target.value) })
                                                }
                                                min="0"
                                                max="6"
                                                className="generator-modal__comp-input"
                                                disabled={!config.overrideSecondaryStab}
                                            />
                                        </div>
                                    )}

                                    <div className="generator-modal__coverage-select-wrapper">
                                        <label className="generator-modal__coverage-select-label">
                                            Preferência de Cobertura
                                        </label>
                                        <select
                                            value={config.coveragePreference}
                                            onChange={(e) => setConfig({ coveragePreference: e.target.value })}
                                            className="generator-modal__select generator-modal__coverage-select"
                                        >
                                            <option value="balanced">Equilibrado (Automático)</option>
                                            <option value="heavy">Priorizar Cobertura</option>
                                            <option value="none">Somente STAB (Sem Cobertura)</option>
                                            <option value="fixed">Quantidade Fixa</option>
                                        </select>
                                        {config.coveragePreference === 'fixed' && (
                                            <div className="generator-modal__coverage-fixed-row">
                                                <span className="generator-modal__coverage-fixed-label">
                                                    Quantidade de Cobertura
                                                </span>
                                                <input
                                                    type="number"
                                                    value={config.coverageCount}
                                                    onChange={(e) =>
                                                        setConfig({ coverageCount: Number(e.target.value) })
                                                    }
                                                    min="0"
                                                    max="6"
                                                    className="generator-modal__comp-input"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="generator-modal__composition generator-modal__composition--disabled">
                                <label className="generator-modal__comp-title generator-modal__comp-title--disabled">
                                    Proporção de Tipos de Ataque
                                </label>
                                <p className="generator-modal__comp-desc">Desativado durante a Geração Selvagem (Aleatória).</p>
                            </div>
                        )}
                    </div>

                    {/* 2-Column Checkbox Grid */}
                    <div className="generator-modal__checkbox-group">
                        {/* LEFT COLUMN: Basic Settings */}
                        <div className="generator-modal__checkbox-col">
                            <label className="generator-modal__checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.ensureDefenses}
                                    onChange={(e) => setConfig({ ensureDefenses: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                <strong>Garantir Defesas Mínimas (Escala com o Rank)</strong>
                                <TooltipIcon
                                    onClick={() =>
                                        setTooltipInfo({
                                            title: 'Garantir Defesas Mínimas',
                                            desc: 'Calcula uma cota de defesa dividindo o total de pontos de atributo por 4. Garante que Vitalidade e Insight atinjam essa cota mínima antes de alocar pontos em atributos ofensivos. Desative para builds tipo canhão-de-vidro.'
                                        })
                                    }
                                />
                            </label>

                            <label className="generator-modal__checkbox-label" style={{ marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={config.includePmd}
                                    onChange={(e) => setConfig({ includePmd: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                Incluir Perícias de Conhecimento (Conhecimento Geral, Medicina, etc.)
                            </label>
                            <label className="generator-modal__checkbox-label" style={{ marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={config.includeCustom}
                                    onChange={(e) => setConfig({ includeCustom: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                Incluir Perícias Homebrew Personalizadas
                            </label>

                            <label className="generator-modal__checkbox-label" style={{ marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={config.randomizeSpecies}
                                    onChange={(e) => setConfig({ randomizeSpecies: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                <strong>Randomizar Espécie (Sobrescreve Identidade)</strong>
                            </label>
                            {config.randomizeSpecies && (
                                <label className="generator-modal__checkbox-label generator-modal__checkbox-label--indented">
                                    <input
                                        type="checkbox"
                                        checked={config.autoSelectBias}
                                        onChange={(e) => setConfig({ autoSelectBias: e.target.checked })}
                                        className="generator-modal__checkbox"
                                    />
                                    Detectar Automaticamente a Tendência de Ataque (Físico vs Especial)
                                </label>
                            )}
                        </div>

                        {/* RIGHT COLUMN: Advanced Engine Settings */}
                        <div className="generator-modal__checkbox-col">
                            <label className="generator-modal__checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={config.includePreEvolutions}
                                    onChange={(e) => setConfig({ includePreEvolutions: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                <strong>Incluir Golpes de Pré-Evolução</strong>
                                <TooltipIcon
                                    onClick={() =>
                                        setTooltipInfo({
                                            title: 'Busca de Pré-Evolução',
                                            desc: "Traça automaticamente a linha evolutiva do seu Pokémon para trás, gerando um pool de golpes mais amplo! Use os seletores de offset de rank abaixo para simular quantos ranks atrás esse Pokémon evoluiu. Mega evoluções são reconhecidas automaticamente e compartilham o rank da forma base."
                                        })
                                    }
                                />
                            </label>
                            {config.includePreEvolutions && (
                                <div className="generator-modal__evo-group">
                                    <div className="generator-modal__evo-box">
                                        <strong className="generator-modal__evo-title">
                                            Linhas de 2 Estágios (ex: Vulpix → Ninetales)
                                        </strong>
                                        <div className="generator-modal__evo-row">
                                            <span className="generator-modal__evo-label">Forma Base (Offset para Baixo)</span>
                                            <NumberSpinner
                                                value={config.evo2Stage1Offset}
                                                onChange={(val) => setConfig({ evo2Stage1Offset: val })}
                                                min={0}
                                                max={7}
                                            />
                                        </div>
                                    </div>
                                    <div className="generator-modal__evo-box">
                                        <strong className="generator-modal__evo-title">
                                            Linhas de 3 Estágios (ex: Charmander → Charizard)
                                        </strong>
                                        <div className="generator-modal__evo-row generator-modal__evo-row--spaced">
                                            <span className="generator-modal__evo-label">
                                                Forma Intermediária (Offset para Baixo)
                                            </span>
                                            <NumberSpinner
                                                value={config.evo3Stage2Offset}
                                                onChange={(val) => setConfig({ evo3Stage2Offset: val })}
                                                min={0}
                                                max={7}
                                            />
                                        </div>
                                        <div className="generator-modal__evo-row">
                                            <span className="generator-modal__evo-label">Forma Base (Offset para Baixo)</span>
                                            <NumberSpinner
                                                value={config.evo3Stage1Offset}
                                                onChange={(val) => setConfig({ evo3Stage1Offset: val })}
                                                min={0}
                                                max={7}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label className="generator-modal__checkbox-label" style={{ marginTop: '4px' }}>
                                <input
                                    type="checkbox"
                                    checked={config.allowOverrank}
                                    onChange={(e) => setConfig({ allowOverrank: e.target.checked })}
                                    className="generator-modal__checkbox"
                                />
                                <strong>Permitir Overrank (Escolher 1 Golpe de Rank Superior)</strong>
                                <TooltipIcon
                                    onClick={() =>
                                        setTooltipInfo({
                                            title: 'Geração de Overrank',
                                            desc: 'Força o gerador a selecionar exatamente um golpe que normalmente pertence a um rank superior, ampliando suas opções táticas.'
                                        })
                                    }
                                />
                            </label>
                            {config.allowOverrank && (
                                <div className="generator-modal__evo-group">
                                    <div className="generator-modal__evo-box generator-modal__evo-row">
                                        <span className="generator-modal__evo-label" style={{ fontWeight: 'bold' }}>
                                            Máx. de Ranks Acima
                                        </span>
                                        <NumberSpinner
                                            value={config.overrankAmount}
                                            onChange={(val) => setConfig({ overrankAmount: val })}
                                            min={1}
                                            max={7}
                                        />
                                    </div>
                                    <label className="generator-modal__checkbox-label" style={{ fontSize: '0.75rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.allowPreEvoOverrank}
                                            onChange={(e) => setConfig({ allowPreEvoOverrank: e.target.checked })}
                                            className="generator-modal__checkbox"
                                            disabled={!config.includePreEvolutions}
                                        />
                                        Incluir Pré-Evoluções no Pool
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="generator-modal__warning">
                    ⚠️ ATENÇÃO: Isso vai sobrescrever completamente os atributos, perícias e golpes atuais deste
                    token!
                </div>

                <div className="generator-modal__actions">
                    <button
                        type="button"
                        onClick={onClose}
                        className="action-button action-button--dark generator-modal__btn"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || (!config.randomizeSpecies && !speciesName)}
                        className="action-button action-button--red generator-modal__btn"
                    >
                        {isGenerating ? '⏳' : '🎲 Gerar'}
                    </button>
                </div>
            </div>

            {tooltipInfo && (
                <div className="generator-modal__tooltip-overlay">
                    <div className="generator-modal__tooltip-content">
                        <h3 className="generator-modal__tooltip-title">{tooltipInfo.title}</h3>
                        <p className="generator-modal__tooltip-desc">{tooltipInfo.desc}</p>
                        <div className="generator-modal__tooltip-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark generator-modal__tooltip-btn"
                                onClick={() => setTooltipInfo(null)}
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
