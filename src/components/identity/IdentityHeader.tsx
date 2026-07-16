import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useCharacterStore } from '../../store/useCharacterStore';
import { fetchAbilityData, fetchNatureData } from '../../utils/api';
import { CollapsingSection } from '../ui/CollapsingSection';
import { IdentityGrid } from './IdentityGrid';
import { IdentityControls } from './IdentityControls';
import { HomebrewModal } from '../homebrew/HomebrewModal';
import { GeneratorModal } from '../modals/GeneratorModal';
import { TrackerSettingsModal } from '../modals/TrackerSettingsModal';
import { RulesModal } from '../modals/RulesModal';
import { ChangelogModal } from '../modals/ChangelogModal';
import { PokedexModal } from '../modals/PokedexModal';
import { CURRENT_VERSION } from '../../data/changelog';
import { broadcastInfo } from '../../utils/diceRoller';
import './IdentityHeader.css';

export function IdentityHeader() {
    const identityStore = useCharacterStore((state) => state.identity) || {};
    const setIdentity = useCharacterStore((state) => state.setIdentity);
    const tokenId = useCharacterStore((state) => state.tokenId);
    const role = useCharacterStore((state) => state.role);
    const isGm = role === 'GM';

    const [isDark, setIsDark] = useState(false);

    const [modalConfig, setModalConfig] = useState<{ title: string; content: string | ReactNode } | null>(null);
    const [showHomebrewModal, setShowHomebrewModal] = useState(false);
    const [showGeneratorModal, setShowGeneratorModal] = useState(false);
    const [showTrackerSettings, setShowTrackerSettings] = useState(false);
    const [showRulesModal, setShowRulesModal] = useState(false);
    const [showChangelog, setShowChangelog] = useState(false);
    const [showPokedexModal, setShowPokedexModal] = useState(false);

    useEffect(() => {
        try {
            const savedTheme = localStorage.getItem('pokerole-theme');
            if (savedTheme === 'dark') {
                setIsDark(true);
                document.body.classList.add('dark-mode');
                document.body.setAttribute('data-theme', 'dark');
                document.documentElement.setAttribute('data-theme', 'dark');
            }

            const seenVersion = localStorage.getItem('pkr_changelog_seen');
            if (seenVersion !== CURRENT_VERSION) {
                setShowChangelog(true);
            }
        } catch (e) {
            console.warn('Could not access localStorage', e);
        }
    }, []);

    const toggleTheme = () => {
        const newIsDark = !isDark;
        setIsDark(newIsDark);

        const themeValue = newIsDark ? 'dark' : 'light';

        if (newIsDark) {
            document.body.classList.add('dark-mode');
            document.body.setAttribute('data-theme', 'dark');
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            document.body.setAttribute('data-theme', 'light');
            document.documentElement.setAttribute('data-theme', 'light');
        }

        try {
            localStorage.setItem('pokerole-theme', themeValue);
        } catch (e) {}

        if (OBR.isAvailable) {
            OBR.broadcast.sendMessage('pokerole-pmd-extension/theme-sync', themeValue, { destination: 'LOCAL' });
        }
    };

    const handleCloseChangelog = () => {
        try {
            localStorage.setItem('pkr_changelog_seen', CURRENT_VERSION);
        } catch (e) {}
        setShowChangelog(false);
    };

    const openAbilityModal = async () => {
        if (!identityStore.ability) {
            setModalConfig({ title: 'Habilidade', content: 'Nenhuma habilidade selecionada.' });
            return;
        }
        setModalConfig({ title: 'Habilidade', content: 'Carregando...' });
        const data = await fetchAbilityData(identityStore.ability);

        if (data && (data.Description || data.Effect)) {
            const content = [data.Description, data.Effect].filter(Boolean).join('\n\n');
            setModalConfig({ title: identityStore.ability, content });
        } else {
            setModalConfig({ title: 'Habilidade', content: 'Não foi possível carregar os dados da habilidade.' });
        }
    };

    const openNatureModal = async () => {
        if (!identityStore.nature || identityStore.nature === '-- Select --') {
            setModalConfig({ title: 'Natureza', content: 'Nenhuma natureza selecionada.' });
            return;
        }
        setModalConfig({ title: 'Natureza', content: 'Carregando...' });
        const data = await fetchNatureData(identityStore.nature);

        if (data) {
            const content = [];

            const safeData = data as Record<string, unknown>;
            const keywords = safeData.Keywords || safeData.keywords;
            const desc = safeData.Description || safeData.description;
            const confidence = safeData.Confidence || safeData.confidence;
            const statUp = safeData['Stat Up'] || safeData['stat up'] || safeData.StatUp;
            const statDown = safeData['Stat Down'] || safeData['stat down'] || safeData.StatDown;

            if (keywords) content.push(`Palavras-chave: ${keywords}`);
            if (confidence) content.push(`Confiança: ${confidence}`);
            if (statUp) content.push(`Aumento de Atributo: ${statUp}`);
            if (statDown) content.push(`Diminuição de Atributo: ${statDown}`);
            if (desc) content.push(String(desc));

            if (content.length === 0) content.push(JSON.stringify(data, null, 2));

            setModalConfig({ title: `Natureza: ${identityStore.nature}`, content: content.join('\n\n') });
        } else {
            setModalConfig({ title: 'Natureza', content: 'Não foi possível carregar os dados da natureza.' });
        }
    };

    const handleUpdateTokenImage = async () => {
        if (!isGm) {
            if (OBR.isAvailable) OBR.notification.show('Apenas o Mestre pode atualizar a imagem do token da cena.', 'ERROR');
            return;
        }

        if (!OBR.isAvailable || !tokenId) {
            const url = window.prompt(`Insira a URL da Imagem:`);
            if (url) {
                setIdentity('tokenImageUrl', url);
            }
            return;
        }

        try {
            const assetsApi = OBR.assets as unknown as { downloadImages?: () => Promise<unknown[]> };
            let images: unknown[] | null = null;

            if (typeof assetsApi?.downloadImages === 'function') {
                images = await assetsApi.downloadImages();
            } else {
                const url = window.prompt('Insira a URL da Imagem:');
                if (url) {
                    setIdentity('tokenImageUrl', url);
                    await OBR.scene.items.updateItems([tokenId], (items) => {
                        for (const item of items) {
                            const imgItem = item as Record<string, unknown>;
                            if (imgItem.image) (imgItem.image as Record<string, unknown>).url = url;
                        }
                    });
                }
                return;
            }

            if (images && images.length > 0) {
                let selectedUrl = '';
                let selectedWidth = 0;
                let selectedHeight = 0;

                const img = images[0] as Record<string, unknown> | string;

                if (typeof img === 'string') {
                    selectedUrl = img;
                } else if (img && typeof img === 'object') {
                    if (typeof img.url === 'string') {
                        selectedUrl = img.url;
                    } else if (img.image && typeof (img.image as Record<string, unknown>).url === 'string') {
                        selectedUrl = (img.image as Record<string, unknown>).url as string;
                        selectedWidth = ((img.image as Record<string, unknown>).width as number) || 0;
                        selectedHeight = ((img.image as Record<string, unknown>).height as number) || 0;
                    } else if (typeof img.src === 'string') {
                        selectedUrl = img.src;
                    }
                }

                if (selectedUrl) {
                    setIdentity('tokenImageUrl', selectedUrl);
                    await OBR.scene.items.updateItems([tokenId], (items) => {
                        for (const item of items) {
                            const imgItem = item as Record<string, unknown>;
                            if (imgItem.image) {
                                const imageRecord = imgItem.image as Record<string, unknown>;
                                const oldWidth = (imageRecord.width as number) || 1;
                                const oldScaleX = item.scale.x || 1;
                                const oldScaleY = item.scale.y || 1;

                                imageRecord.url = selectedUrl;
                                if (selectedWidth && selectedHeight) {
                                    imageRecord.width = selectedWidth;
                                    imageRecord.height = selectedHeight;

                                    // Preserve the visual size on the board, maintaining the new aspect ratio
                                    const physicalWidth = oldWidth * Math.abs(oldScaleX);
                                    const newScale = physicalWidth / selectedWidth;

                                    item.scale = {
                                        x: newScale * (oldScaleX < 0 ? -1 : 1),
                                        y: newScale * (oldScaleY < 0 ? -1 : 1)
                                    };
                                }
                            }
                        }
                    });
                } else {
                    if (OBR.isAvailable)
                        OBR.notification.show('Não foi possível extrair a URL. Verifique o console F12!', 'ERROR');
                }
            }
        } catch (e) {
            console.error('Failed to pick manual token image:', e);
        }
    };

    const headerElements = (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isGm && OBR.isAvailable && (
                <button
                    type="button"
                    className="action-button action-button--dark identity-header__changelog-btn"
                    onClick={handleUpdateTokenImage}
                    title="Alterar a arte deste token manualmente (Útil para Evolução)."
                >
                    🖼️ Atualizar Imagem do Token
                </button>
            )}
            <button
                type="button"
                className="action-button action-button--dark identity-header__changelog-btn"
                onClick={() => setShowChangelog(true)}
                title="Ver Registro de Atualizações"
            >
                📢 Novidades
            </button>
        </div>
    );

    return (
        <CollapsingSection
            title="IDENTIDADE DO PERSONAGEM"
            headerElements={headerElements}
            className="sheet-panel identity-header"
        >
            <IdentityGrid
                onOpenGenerator={() => setShowGeneratorModal(true)}
                onOpenAbility={openAbilityModal}
                onOpenNature={openNatureModal}
                onOpenPokedex={() => setShowPokedexModal(true)}
            />

            <IdentityControls
                onOpenHomebrew={() => setShowHomebrewModal(true)}
                onOpenTrackerSettings={() => setShowTrackerSettings(true)}
                onOpenRules={() => setShowRulesModal(true)}
                isDark={isDark}
                toggleTheme={toggleTheme}
            />

            {showHomebrewModal && <HomebrewModal onClose={() => setShowHomebrewModal(false)} />}
            {showGeneratorModal && <GeneratorModal onClose={() => setShowGeneratorModal(false)} />}
            {showTrackerSettings && <TrackerSettingsModal onClose={() => setShowTrackerSettings(false)} />}
            {showRulesModal && <RulesModal onClose={() => setShowRulesModal(false)} />}
            {showChangelog && <ChangelogModal onClose={handleCloseChangelog} />}
            {showPokedexModal && <PokedexModal onClose={() => setShowPokedexModal(false)} />}

            {modalConfig && (
                <div className="identity-header__modal-overlay identity-header__modal-overlay--high-z">
                    <div className="identity-header__modal-content identity-header__modal-content--large">
                        <h3 className="identity-header__modal-title identity-header__modal-title--large">
                            {modalConfig.title}
                        </h3>
                        <hr className="identity-header__modal-divider" />
                        <div className="identity-header__modal-text identity-header__modal-text--pre-wrap">
                            {modalConfig.content}
                        </div>
                        <div className="identity-header__modal-actions">
                            <button
                                className="action-button action-button--dark identity-header__modal-btn"
                                onClick={() => setModalConfig(null)}
                            >
                                Fechar
                            </button>
                            <button
                                className="action-button identity-header__modal-btn"
                                style={{ backgroundColor: '#1565c0', borderColor: '#1565c0', color: 'white' }}
                                onClick={() => {
                                    if (typeof modalConfig.content === 'string') {
                                        broadcastInfo(modalConfig.title, modalConfig.content);
                                        setModalConfig(null);
                                    }
                                }}
                            >
                                📢 Transmitir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CollapsingSection>
    );
}
