import { useState } from 'react';
import { useCharacterStore } from '../../store/useCharacterStore';
import { TooltipIcon } from '../ui/TooltipIcon';
import './RulesModal.css';

export function RulesModal({ onClose }: { onClose: () => void }) {
    const id = useCharacterStore((state) => state.identity);
    const setIdentity = useCharacterStore((state) => state.setIdentity);
    const role = useCharacterStore((state) => state.role);
    const [modalConfig, setModalConfig] = useState<{ title: string; content: string } | null>(null);

    return (
        <div className="rules-modal__overlay">
            <div className="rules-modal__content">
                <div className="rules-modal__header-row">
                    <h3 className="rules-modal__title">📜 Regras e Permissões da Sala</h3>
                    <button onClick={onClose} className="rules-modal__close-x" title="Fechar">
                        X
                    </button>
                </div>

                <div className="rules-modal__form-group">
                    <div>
                        <label className="rules-modal__label">
                            Motor de Dados{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Configurações do Motor de Dados',
                                        content:
                                            'Selecione para qual extensão de dados as rolagens serão transmitidas. Ambos os motores suportam dados 3D e automação completa da ficha, mas o Custom Action Rolls pode ter melhor desempenho e mais precisão em rolagens com muitos dados.'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.diceEngine || 'car'}
                            onChange={(e) => setIdentity('diceEngine', e.target.value as 'dice-plus' | 'car')}
                        >
                            <option value="dice-plus">Dice+ (Dados Físicos 3D)</option>
                            <option value="car">Custom Action Rolls (Dados 3D e Log de Chat)</option>
                        </select>
                    </div>

                    <div>
                        <label className="rules-modal__label">
                            Conjunto de Regras{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Configurações do Conjunto de Regras',
                                        content:
                                            'Determina como HP e Defesa Especial são calculados. (Configuração Global da Sala)'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.ruleset || 'vg-vit-hp'}
                            onChange={(e) => setIdentity('ruleset', e.target.value)}
                        >
                            <option value="vg-vit-hp">VIT = DEF/HP, INS = SPD</option>
                            <option value="tabletop">VIT = DEF/SPD/HP</option>
                            <option value="vg-high-hp">VIT = DEF, INS = SPD; VIT ou INS usado para HP</option>
                        </select>
                    </div>

                    <div>
                        <label className="rules-modal__label">
                            Penalidades de Dor{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Penalidades de Dor',
                                        content:
                                            'Aplica automaticamente penalidades de -1 ou -2 sucessos às rolagens quando o HP está baixo. (Configuração Global da Sala)'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.pain || 'Enabled'}
                            onChange={(e) => setIdentity('pain', e.target.value)}
                        >
                            <option value="Enabled">Ativado</option>
                            <option value="Disabled">Desativado</option>
                        </select>
                    </div>

                    <div>
                        <label className="rules-modal__label">
                            Acesso ao Homebrew{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Acesso ao Homebrew',
                                        content:
                                            'Controla se os jogadores podem visualizar ou editar a Oficina Homebrew. (Configuração Global da Sala)'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.homebrewAccess || 'Full'}
                            onChange={(e) => setIdentity('homebrewAccess', e.target.value)}
                        >
                            <option value="Full">Acesso Total</option>
                            <option value="View Only">Somente Visualização</option>
                            <option value="None">Nenhum (Oculto)</option>
                        </select>
                    </div>

                    <div>
                        <label className="rules-modal__label">
                            Gerador de Itens{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Gerador de Itens',
                                        content:
                                            'Controla se os jogadores podem ver e usar o botão do Gerador de Itens Aleatórios em suas fichas. (Configuração Global da Sala)'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.gmOnlyLootGen === false ? 'Everyone' : 'GM Only'}
                            onChange={(e) => setIdentity('gmOnlyLootGen', e.target.value === 'GM Only')}
                        >
                            <option value="GM Only">Somente Mestre</option>
                            <option value="Everyone">Todos</option>
                        </select>
                    </div>

                    <div>
                        <label className="rules-modal__label">
                            Efetividades de Tipo{' '}
                            <TooltipIcon
                                onClick={() =>
                                    setModalConfig({
                                        title: 'Visibilidade das Efetividades de Tipo',
                                        content:
                                            'Controla se os jogadores podem ver a tabela de Efetividades de Tipo em fichas de NPC bloqueadas. Útil para esconder tipagens customizadas ou fraquezas de chefes dos jogadores. (Configuração Global da Sala)'
                                    })
                                }
                            />
                        </label>
                        <select
                            className="identity-grid__select rules-modal__select"
                            value={id.gmOnlyMatchups ? 'GM Only' : 'Everyone'}
                            onChange={(e) => setIdentity('gmOnlyMatchups', e.target.value === 'GM Only')}
                        >
                            <option value="Everyone">Todos</option>
                            <option value="GM Only">Somente Mestre</option>
                        </select>
                    </div>

                    {role === 'GM' && (
                        <div>
                            <label className="rules-modal__label">
                                Modo Demo do Mestre (Somente CAR){' '}
                                <TooltipIcon
                                    onClick={() =>
                                        setModalConfig({
                                            title: 'Modo de Demonstração do Mestre',
                                            content:
                                                'Quando ativado, intercepta TODAS as suas rolagens de dados e pede para você especificar o número exato de sucessos (ou até o array exato de dados!) que deseja que o motor simule. PERFEITO para gravar tutoriais/vídeos demonstrativos ou para momentos climáticos de mestragem onde você quer que um cenário se desenrole de um jeito específico. (RECURSO EXCLUSIVO DO MESTRE - não afeta as rolagens dos jogadores). Este recurso SÓ funciona com o motor de dados Custom Action Rolls ativado, NÃO é compatível com o Dice+.'
                                        })
                                    }
                                />
                            </label>
                            <select
                                className="identity-grid__select rules-modal__select"
                                value={id.gmDemoMode ? 'Enabled' : 'Disabled'}
                                onChange={(e) => setIdentity('gmDemoMode', e.target.value === 'Enabled')}
                            >
                                <option value="Disabled">Desativado</option>
                                <option value="Enabled">Ativado</option>
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {modalConfig && (
                <div className="rules-info__overlay">
                    <div className="rules-info__content">
                        <h3 className="rules-info__title">{modalConfig.title}</h3>
                        <hr className="rules-info__divider" />
                        <div className="rules-info__text">{modalConfig.content}</div>
                        <div className="rules-info__actions">
                            <button
                                className="action-button action-button--dark rules-modal__close-btn"
                                onClick={() => setModalConfig(null)}
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
