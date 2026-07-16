import { useCharacterStore } from '../../store/useCharacterStore';
import { NumberSpinner } from '../ui/NumberSpinner';
import './InitiativeSettingsModal.css';

export function InitiativeSettingsModal({ onClose }: { onClose: () => void }) {
    const identityStore = useCharacterStore((state) => state.identity);
    const setIdentity = useCharacterStore((state) => state.setIdentity);

    return (
        <div className="init-settings__overlay">
            <div className="init-settings__content">
                <div className="init-settings__header-row">
                    <h3 className="init-settings__title">⚙️ Configurações de Iniciativa</h3>
                    <button onClick={onClose} className="init-settings__close-x" title="Fechar">
                        X
                    </button>
                </div>
                <p className="init-settings__description">
                    Personalize como e onde o Rastreador de Iniciativa aparece na sua tela.
                </p>

                <div className="init-settings__section">
                    <div className="init-settings__row">
                        <span className="init-settings__label">Canto de Ancoragem:</span>
                        <select
                            className="init-settings__input"
                            value={identityStore.initiativeTrackerPreset || 'center-right'}
                            onChange={(e) => setIdentity('initiativeTrackerPreset', e.target.value)}
                        >
                            <option value="top-left">Superior Esquerdo</option>
                            <option value="top-center">Superior Centro</option>
                            <option value="top-right">Superior Direito</option>
                            <option value="center-left">Centro Esquerdo</option>
                            <option value="center-right">Centro Direito</option>
                            <option value="bottom-left">Inferior Esquerdo</option>
                            <option value="bottom-center">Inferior Centro</option>
                            <option value="bottom-right">Inferior Direito</option>
                        </select>
                    </div>

                    <div className="init-settings__row">
                        <span className="init-settings__label">Estilo de Layout:</span>
                        <select
                            className="init-settings__input"
                            value={identityStore.initiativeTrackerLayout || 'vertical'}
                            onChange={(e) =>
                                setIdentity('initiativeTrackerLayout', e.target.value as 'vertical' | 'horizontal')
                            }
                        >
                            <option value="vertical">Lista Vertical</option>
                            <option value="horizontal">Linha Horizontal</option>
                        </select>
                    </div>

                    <div className="init-settings__row">
                        <span className="init-settings__label">Imagem do Token:</span>
                        <select
                            className="init-settings__input"
                            value={identityStore.initiativeTrackerAvatarShape || 'circle'}
                            onChange={(e) =>
                                setIdentity(
                                    'initiativeTrackerAvatarShape',
                                    e.target.value as 'circle' | 'square' | 'none'
                                )
                            }
                        >
                            <option value="circle">Círculo</option>
                            <option value="square">Quadrado</option>
                            <option value="none">Nenhum (Sem Borda)</option>
                        </select>
                    </div>

                    <div className="init-settings__offset-container">
                        <div className="init-settings__offset-group">
                            <span className="init-settings__offset-text">Deslocamento X:</span>
                            <div className="init-settings__offset-controls">
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerOffsetX',
                                            (identityStore.initiativeTrackerOffsetX || 0) - 10
                                        )
                                    }
                                >
                                    -10
                                </button>
                                <NumberSpinner
                                    value={identityStore.initiativeTrackerOffsetX || 0}
                                    onChange={(value) => setIdentity('initiativeTrackerOffsetX', value)}
                                    min={-9999}
                                    max={9999}
                                />
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerOffsetX',
                                            (identityStore.initiativeTrackerOffsetX || 0) + 10
                                        )
                                    }
                                >
                                    +10
                                </button>
                            </div>
                        </div>
                        <div className="init-settings__offset-group">
                            <span className="init-settings__offset-text">Deslocamento Y:</span>
                            <div className="init-settings__offset-controls">
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerOffsetY',
                                            (identityStore.initiativeTrackerOffsetY || 0) - 10
                                        )
                                    }
                                >
                                    -10
                                </button>
                                <NumberSpinner
                                    value={identityStore.initiativeTrackerOffsetY || 0}
                                    onChange={(value) => setIdentity('initiativeTrackerOffsetY', value)}
                                    min={-9999}
                                    max={9999}
                                />
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerOffsetY',
                                            (identityStore.initiativeTrackerOffsetY || 0) + 10
                                        )
                                    }
                                >
                                    +10
                                </button>
                            </div>
                        </div>
                    </div>

                    <hr className="init-settings__divider" />

                    <p className="init-settings__hint" style={{ marginBottom: 0, paddingBottom: 0 }}>
                        Limites de Tamanho Máximo do Quadro (0 = Automático)
                    </p>
                    <div className="init-settings__offset-container" style={{ marginTop: '0' }}>
                        <div className="init-settings__offset-group">
                            <span className="init-settings__offset-text">Largura Máx. (px):</span>
                            <div className="init-settings__offset-controls">
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerMaxWidth',
                                            Math.max(0, (identityStore.initiativeTrackerMaxWidth || 0) - 50)
                                        )
                                    }
                                >
                                    -50
                                </button>
                                <NumberSpinner
                                    value={identityStore.initiativeTrackerMaxWidth || 0}
                                    onChange={(value) => setIdentity('initiativeTrackerMaxWidth', value)}
                                    min={0}
                                    max={4000}
                                />
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerMaxWidth',
                                            (identityStore.initiativeTrackerMaxWidth || 0) + 50
                                        )
                                    }
                                >
                                    +50
                                </button>
                            </div>
                        </div>
                        <div className="init-settings__offset-group">
                            <span className="init-settings__offset-text">Altura Máx. (px):</span>
                            <div className="init-settings__offset-controls">
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerMaxHeight',
                                            Math.max(0, (identityStore.initiativeTrackerMaxHeight || 0) - 50)
                                        )
                                    }
                                >
                                    -50
                                </button>
                                <NumberSpinner
                                    value={identityStore.initiativeTrackerMaxHeight || 0}
                                    onChange={(value) => setIdentity('initiativeTrackerMaxHeight', value)}
                                    min={0}
                                    max={4000}
                                />
                                <button
                                    className="init-settings__step-btn"
                                    onClick={() =>
                                        setIdentity(
                                            'initiativeTrackerMaxHeight',
                                            (identityStore.initiativeTrackerMaxHeight || 0) + 50
                                        )
                                    }
                                >
                                    +50
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
