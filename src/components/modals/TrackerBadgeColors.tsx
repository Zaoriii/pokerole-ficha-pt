import { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useCharacterStore } from '../../store/useCharacterStore';
import { STATS_META_ID } from '../../utils/graphicsManager';
import { NumberSpinner } from '../ui/NumberSpinner';

interface TrackerBadgeColorsProps {
    onOpenPlacementModal: () => void;
}

export function TrackerBadgeColors({ onOpenPlacementModal }: TrackerBadgeColorsProps) {
    const identityStore = useCharacterStore((state) => state.identity);
    const setIdentity = useCharacterStore((state) => state.setIdentity);
    const role = useCharacterStore((state) => state.role);

    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showSyncConfirm, setShowSyncConfirm] = useState(false);

    const confirmResetColors = () => {
        setIdentity('colorAct', '#4890fc');
        setIdentity('colorEva', '#c387fc');
        setIdentity('colorCla', '#dfad43');
        setShowResetConfirm(false);
    };

    const confirmSyncColors = async () => {
        if (!OBR.isAvailable) return;
        try {
            const items = await OBR.scene.items.getItems(
                (item) => item.layer === 'CHARACTER' && item.metadata[STATS_META_ID] !== undefined
            );
            const updates = {
                'color-act': identityStore.colorAct,
                'color-eva': identityStore.colorEva,
                'color-cla': identityStore.colorCla
            };

            await OBR.scene.items.updateItems(
                items.map((item) => item.id),
                (itemsToUpdate) => {
                    for (const item of itemsToUpdate) {
                        if (!item.metadata[STATS_META_ID]) item.metadata[STATS_META_ID] = {};
                        Object.assign(item.metadata[STATS_META_ID] as Record<string, unknown>, updates);
                    }
                }
            );
            OBR.notification.show('🎨 Cores do rastreador sincronizadas em todos os tokens!');
        } catch (error) {
            console.error('Failed to sync colors:', error);
        }
        setShowSyncConfirm(false);
    };

    return (
        <>
            <div className="tracker-settings__color-group">
                <label className="tracker-settings__subtitle">Cores dos Marcadores</label>

                <div className="tracker-settings__color-row">
                    <span className="tracker-settings__color-label">Ação:</span>
                    <input
                        type="color"
                        value={identityStore.colorAct}
                        onChange={(event) => setIdentity('colorAct', event.target.value)}
                        className="tracker-settings__color-picker"
                        title="Cor do Marcador de Ação"
                    />
                    <input
                        type="text"
                        value={identityStore.colorAct}
                        onChange={(event) => setIdentity('colorAct', event.target.value)}
                        className="tracker-settings__color-input"
                    />
                </div>

                <div className="tracker-settings__color-row">
                    <span className="tracker-settings__color-label">Evasão:</span>
                    <input
                        type="color"
                        value={identityStore.colorEva}
                        onChange={(event) => setIdentity('colorEva', event.target.value)}
                        className="tracker-settings__color-picker"
                        title="Cor do Marcador de Evasão"
                    />
                    <input
                        type="text"
                        value={identityStore.colorEva}
                        onChange={(event) => setIdentity('colorEva', event.target.value)}
                        className="tracker-settings__color-input"
                    />
                </div>

                <div className="tracker-settings__color-row">
                    <span className="tracker-settings__color-label">Confronto:</span>
                    <input
                        type="color"
                        value={identityStore.colorCla}
                        onChange={(event) => setIdentity('colorCla', event.target.value)}
                        className="tracker-settings__color-picker"
                        title="Cor do Marcador de Confronto"
                    />
                    <input
                        type="text"
                        value={identityStore.colorCla}
                        onChange={(event) => setIdentity('colorCla', event.target.value)}
                        className="tracker-settings__color-input"
                    />
                </div>
            </div>

            <div className="tracker-settings__offset-container">
                <label
                    className="tracker-settings__offset-label"
                    title="Escala a HUD inteira para cima ou para baixo! Padrão é 100%."
                >
                    <span className="tracker-settings__offset-text">Tamanho da HUD (%):</span>
                    <NumberSpinner
                        value={identityStore.trackerScale ?? 100}
                        onChange={(value) => setIdentity('trackerScale', value)}
                        min={10}
                        max={500}
                    />
                </label>
            </div>

            <div className="tracker-settings__offset-container">
                <label
                    className="tracker-settings__offset-label"
                    title="Números positivos empurram a UI para baixo, negativos puxam para cima!"
                >
                    <span className="tracker-settings__offset-text">Deslocamento Y:</span>
                    <NumberSpinner
                        value={identityStore.yOffset}
                        onChange={(value) => setIdentity('yOffset', value)}
                        min={-9999}
                        max={9999}
                    />
                </label>
                <label
                    className="tracker-settings__offset-label"
                    title="Números positivos empurram a UI para a direita, negativos puxam para a esquerda!"
                >
                    <span className="tracker-settings__offset-text">Deslocamento X:</span>
                    <NumberSpinner
                        value={identityStore.xOffset}
                        onChange={(value) => setIdentity('xOffset', value)}
                        min={-9999}
                        max={9999}
                    />
                </label>
            </div>

            <div className="tracker-settings__button-row">
                <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="action-button action-button--dark tracker-settings__modal-btn"
                >
                    Redefinir Cores
                </button>
                {role === 'GM' && (
                    <button
                        type="button"
                        onClick={() => setShowSyncConfirm(true)}
                        className="action-button action-button--dark tracker-settings__modal-btn tracker-settings__btn-sync"
                    >
                        🔄 Sincronizar Cores
                    </button>
                )}
            </div>

            <button
                type="button"
                className="action-button action-button--dark tracker-settings__btn-placement"
                onClick={onOpenPlacementModal}
            >
                🎯 Ajustar Posicionamento
            </button>

            {showResetConfirm && (
                <div className="tracker-settings__overlay tracker-settings__overlay--high-z">
                    <div className="tracker-settings__content tracker-settings__content--confirm">
                        <h3 className="tracker-settings__title tracker-settings__title--confirm">⚠️ Redefinir Cores</h3>
                        <p className="tracker-settings__description">
                            Tem certeza de que deseja redefinir as cores do rastreador para o padrão?
                        </p>
                        <div className="tracker-settings__modal-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark tracker-settings__modal-btn"
                                onClick={() => setShowResetConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red tracker-settings__modal-btn"
                                onClick={confirmResetColors}
                            >
                                Redefinir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showSyncConfirm && (
                <div className="tracker-settings__overlay tracker-settings__overlay--high-z">
                    <div className="tracker-settings__content tracker-settings__content--sync">
                        <h3 className="tracker-settings__title tracker-settings__title--sync">🔄 Sincronizar Cores</h3>
                        <p className="tracker-settings__description">
                            Isso vai enviar as cores atuais do rastreador para TODOS os tokens no mapa. Tem certeza?
                        </p>
                        <div className="tracker-settings__modal-actions">
                            <button
                                type="button"
                                className="action-button action-button--dark tracker-settings__modal-btn"
                                onClick={() => setShowSyncConfirm(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--dark tracker-settings__modal-btn tracker-settings__btn-sync"
                                onClick={confirmSyncColors}
                            >
                                Sincronizar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
