import { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { useCharacterStore } from '../../store/useCharacterStore';
import { POKEMON_TYPES } from '../../data/constants';
import type { TransformationType } from '../../store/storeTypes';
import './TransformationModal.css';

interface TransformationModalProps {
    onClose: () => void;
}

export function TransformationModal({ onClose }: TransformationModalProps) {
    const identityStore = useCharacterStore((state) => state.identity);
    const activeTrans = identityStore.activeTransformation;
    const activeFormId = identityStore.activeFormId;
    const formSaves = identityStore.formSaves;
    const currentType1 = identityStore.type1;

    const toggleTransformation = useCharacterStore((state) => state.toggleTransformation);
    const setIdentity = useCharacterStore((state) => state.setIdentity);
    const willCurr = useCharacterStore((state) => state.will.willCurr);
    const tempWill = useCharacterStore((state) => state.will.temporaryWill);
    const hpCurr = useCharacterStore((state) => state.health.hpCurr);
    const tokenId = useCharacterStore((state) => state.tokenId);

    const roomCustomTypes = useCharacterStore((state) => state.roomCustomTypes);
    const roomCustomForms = useCharacterStore((state) => state.roomCustomForms);
    const role = useCharacterStore((state) => state.role);

    const hasAltForm = !!identityStore.altFormData;
    const hasMaxForm = !!identityStore.maxFormData;

    const cachedTransRaw = localStorage.getItem('pokerole-last-trans') || 'Mega';
    const cachedTrans = cachedTransRaw === 'None' ? 'Mega' : cachedTransRaw;

    const [selectedTrans, setSelectedTrans] = useState<string>(
        activeTrans !== 'None' ? (activeTrans === 'Custom' ? `custom_${activeFormId}` : activeTrans) : cachedTrans
    );

    const [affinity, setAffinity] = useState(currentType1 || 'Normal');
    const [autoMaxMoves, setAutoMaxMoves] = useState(true);
    const [clearConfirmType, setClearConfirmType] = useState<'Mega' | 'Max' | 'Custom' | null>(null);

    const [teraCategory, setTeraCategory] = useState<'Physical' | 'Special'>('Special');

    const allTypes = [
        ...POKEMON_TYPES.filter((t) => t !== '' && t !== 'Stellar'),
        ...roomCustomTypes.filter((t) => role === 'GM' || !t.gmOnly).map((t) => t.name)
    ];

    const handleSelectTrans = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setSelectedTrans(val);
        localStorage.setItem('pokerole-last-trans', val);
    };

    const handleSetImage = async (field: string, isCustomForm = false) => {
        if (!OBR.isAvailable || !tokenId) return;
        try {
            const assetsApi = OBR.assets as unknown as { downloadImages?: () => Promise<unknown[]> };
            let images: unknown[] | null = null;

            if (typeof assetsApi?.downloadImages === 'function') {
                images = await assetsApi.downloadImages();
            } else {
                const url = window.prompt('Insira a URL da Imagem:');
                if (url) {
                    if (isCustomForm) {
                        setIdentity('customFormImages', { ...identityStore.customFormImages, [field]: url });
                    } else {
                        setIdentity(field as keyof typeof identityStore, url);
                    }
                }
                return;
            }

            if (images && images.length > 0) {
                let selectedUrl = '';
                const img = images[0] as Record<string, unknown> | string;

                if (typeof img === 'string') {
                    selectedUrl = img;
                } else if (img && typeof img === 'object') {
                    if (typeof img.url === 'string') selectedUrl = img.url;
                    else if (img.image && typeof (img.image as Record<string, unknown>).url === 'string') {
                        selectedUrl = (img.image as Record<string, unknown>).url as string;
                    } else if (typeof img.src === 'string') {
                        selectedUrl = img.src;
                    }
                }

                if (selectedUrl) {
                    if (isCustomForm) {
                        setIdentity('customFormImages', { ...identityStore.customFormImages, [field]: selectedUrl });
                    } else {
                        setIdentity(field as keyof typeof identityStore, selectedUrl);
                    }
                } else {
                    if (OBR.isAvailable)
                        OBR.notification.show('Não foi possível extrair a URL. Verifique o Console F12!', 'ERROR');
                }
            }
        } catch (e) {
            console.error('Failed to pick image:', e);
        }
    };

    const isTransforming = activeTrans === 'None';

    let targetTrans: TransformationType = selectedTrans as TransformationType;
    let targetFormId: string | undefined = undefined;

    if (selectedTrans.startsWith('custom_')) {
        targetTrans = 'Custom';
        targetFormId = selectedTrans.replace('custom_', '');
    }

    const selectedCustomForm = roomCustomForms.find((f) => f.id === targetFormId);
    const hasCurrentCustomSave = targetFormId ? !!formSaves[targetFormId] : false;

    const hpCost = targetTrans === 'Custom' && selectedCustomForm ? selectedCustomForm.activationCostHp || 0 : 0;
    const willCost =
        targetTrans === 'Custom' && selectedCustomForm
            ? selectedCustomForm.activationCostWill || 0
            : targetTrans === 'Mega' || targetTrans === 'Terastallize'
              ? 1
              : 0;

    const canAffordWill = willCurr + (tempWill || 0) >= willCost;
    const canAffordHp = hpCost === 0 ? true : hpCurr > hpCost;
    const canAfford = canAffordWill && canAffordHp;

    const handleApply = () => {
        if (!canAfford) {
            let msg = `⚠️ Recursos insuficientes! ${targetTrans} requer `;
            if (hpCost > 0 && willCost > 0) msg += `${hpCost} HP e ${willCost} Will.`;
            else if (hpCost > 0) msg += `${hpCost} HP.`;
            else msg += `${willCost} Will.`;

            if (OBR.isAvailable) OBR.notification.show(msg, 'ERROR');
            else alert(msg);
            return;
        }

        toggleTransformation(
            targetTrans,
            affinity,
            autoMaxMoves,
            {
                category: teraCategory,
                acc1: teraCategory === 'Physical' ? 'str' : 'spe',
                acc2: 'channel',
                dmg1: teraCategory === 'Physical' ? 'str' : 'spe'
            },
            targetFormId
        );

        onClose();
    };

    const handleRevert = () => {
        toggleTransformation('None');
        onClose();
    };

    const confirmClearMemory = () => {
        if (clearConfirmType === 'Mega') {
            setIdentity('altFormData', '');
            if (OBR.isAvailable) OBR.notification.show('Memória da Forma Mega apagada!', 'SUCCESS');
        } else if (clearConfirmType === 'Max') {
            setIdentity('maxFormData', '');
            if (OBR.isAvailable) OBR.notification.show('Memória de Dynamax / Gigantamax apagada!', 'SUCCESS');
        } else if (clearConfirmType === 'Custom' && targetFormId) {
            const newFormSaves = { ...formSaves };
            delete newFormSaves[targetFormId];
            setIdentity('formSaves', newFormSaves);
            if (OBR.isAvailable) OBR.notification.show('Memória da Forma Personalizada apagada!', 'SUCCESS');
        }
        setClearConfirmType(null);
    };

    return (
        <div className="transformation-modal__overlay">
            <div className="transformation-modal__content">
                <div className="transformation-modal__header">
                    <h3 className="transformation-modal__title">
                        🧬 {isTransforming ? 'Transformar' : 'Gerenciar Transformação'}
                    </h3>
                    <button onClick={onClose} className="transformation-modal__close-btn" title="Fechar">
                        X
                    </button>
                </div>

                {isTransforming ? (
                    <div className="transformation-modal__section">
                        <label className="transformation-modal__label">Tipo de Transformação:</label>
                        <select
                            value={selectedTrans}
                            onChange={handleSelectTrans}
                            className="transformation-modal__select"
                        >
                            <option value="Mega">Mega Evolução</option>
                            <option value="Dynamax">Dynamax</option>
                            <option value="Gigantamax">Gigantamax</option>
                            <option value="Terastallize">Terastalização</option>
                            {roomCustomForms.length > 0 && (
                                <optgroup label="Formas Homebrew">
                                    {roomCustomForms.map((form) => (
                                        <option key={form.id} value={`custom_${form.id}`}>
                                            {form.name}
                                        </option>
                                    ))}
                                </optgroup>
                            )}
                        </select>

                        {targetTrans === 'Terastallize' && (
                            <>
                                <label className="transformation-modal__label">Afinidade Tera:</label>
                                <select
                                    value={affinity}
                                    onChange={(e) => setAffinity(e.target.value)}
                                    className="transformation-modal__select"
                                >
                                    {allTypes.map((type) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>

                                <div className="transformation-modal__tera-category-box">
                                    <label className="transformation-modal__label transformation-modal__tera-category-label">
                                        Categoria de Tera Blast:
                                    </label>
                                    <select
                                        value={teraCategory}
                                        onChange={(e) => setTeraCategory(e.target.value as 'Physical' | 'Special')}
                                        className="transformation-modal__select"
                                    >
                                        <option value="Physical">Físico (usa FOR)</option>
                                        <option value="Special">Especial (usa ESP)</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {(targetTrans === 'Dynamax' || targetTrans === 'Gigantamax') && !hasMaxForm && (
                            <label className="transformation-modal__label transformation-modal__label--checkbox">
                                <input
                                    type="checkbox"
                                    checked={autoMaxMoves}
                                    onChange={(e) => setAutoMaxMoves(e.target.checked)}
                                    className="transformation-modal__checkbox"
                                />
                                Converter Automaticamente em Golpes Max?
                            </label>
                        )}

                        {['Mega', 'Dynamax', 'Gigantamax', 'Terastallize'].includes(targetTrans) && (
                            <div className="transformation-modal__image-row">
                                <span className="transformation-modal__label">Imagem de {targetTrans}:</span>
                                {(() => {
                                    const fieldMap: Record<string, 'megaImageUrl' | 'maxImageUrl' | 'teraImageUrl'> = {
                                        Mega: 'megaImageUrl',
                                        Dynamax: 'maxImageUrl',
                                        Gigantamax: 'maxImageUrl',
                                        Terastallize: 'teraImageUrl'
                                    };
                                    const field = fieldMap[targetTrans as string];
                                    const url = identityStore[field];
                                    if (url) {
                                        return (
                                            <div className="transformation-modal__image-preview">
                                                <img src={url} alt="Forma" className="transformation-modal__image" />
                                                <button
                                                    type="button"
                                                    onClick={() => setIdentity(field, '')}
                                                    className="action-button action-button--red transformation-modal__clear-img-btn"
                                                >
                                                    Limpar
                                                </button>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleSetImage(field)}
                                            className="action-button action-button--dark transformation-modal__select-img-btn"
                                        >
                                            🖼️ Selecionar Imagem do Token
                                        </button>
                                    );
                                })()}
                            </div>
                        )}

                        {targetTrans === 'Custom' && targetFormId && (
                            <div className="transformation-modal__image-row">
                                <span className="transformation-modal__label">Imagem da Forma Personalizada:</span>
                                {(() => {
                                    const safeId = targetFormId as string;
                                    const url = identityStore.customFormImages[safeId];
                                    if (url) {
                                        return (
                                            <div className="transformation-modal__image-preview">
                                                <img src={url} alt="Forma" className="transformation-modal__image" />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setIdentity('customFormImages', {
                                                            ...identityStore.customFormImages,
                                                            [safeId]: ''
                                                        })
                                                    }
                                                    className="action-button action-button--red transformation-modal__clear-img-btn"
                                                >
                                                    Limpar
                                                </button>
                                            </div>
                                        );
                                    }
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleSetImage(safeId, true)}
                                            className="action-button action-button--dark transformation-modal__select-img-btn"
                                        >
                                            🖼️ Selecionar Imagem do Token
                                        </button>
                                    );
                                })()}
                            </div>
                        )}

                        <div className="transformation-modal__desc-box">
                            {targetTrans === 'Mega' && (
                                <>
                                    Salva seus atributos atuais, cura todo o HP/Will e remove condições.
                                    {hasAltForm && (
                                        <div className="transformation-modal__save-notice">
                                            ✨ Forma Mega salva detectada. Os valores serão restaurados!
                                        </div>
                                    )}
                                    <span className="transformation-modal__cost-warning">Custa 1 Ponto de Vontade.</span>
                                </>
                            )}
                            {targetTrans === 'Dynamax' && (
                                <>
                                    Concede 6 de HP Temporário, ativa um cronômetro de 3 rodadas e impede Evasão/Confronto.
                                    {hasMaxForm && (
                                        <div className="transformation-modal__save-notice">
                                            ✨ Forma Max salva detectada. Os valores serão restaurados!
                                        </div>
                                    )}
                                </>
                            )}
                            {targetTrans === 'Gigantamax' && (
                                <>
                                    Concede 12 de HP Temporário, +2 em FOR/ESP/DES/DEF/VEL, ativa um cronômetro de 3
                                    rodadas e impede Evasão/Confronto.
                                    {hasMaxForm && (
                                        <div className="transformation-modal__save-notice">
                                            ✨ Forma Max salva detectada. Os valores serão restaurados!
                                        </div>
                                    )}
                                </>
                            )}
                            {targetTrans === 'Terastallize' && (
                                <>
                                    Substitui seu tipo por Stellar, aplica STAB ao seu tipo de afinidade e concede
                                    dano bônus ao seu próximo ataque.
                                    <span className="transformation-modal__cost-warning">Custa 1 Ponto de Vontade.</span>
                                </>
                            )}
                            {targetTrans === 'Custom' && selectedCustomForm && (
                                <>
                                    {selectedCustomForm.description ||
                                        `Aplica a Forma Personalizada ${selectedCustomForm.name}.`}
                                    {hasCurrentCustomSave && (
                                        <div className="transformation-modal__save-notice">
                                            ✨ Memória salva detectada. Os valores serão restaurados!
                                        </div>
                                    )}
                                    {(hpCost > 0 || willCost > 0) && (
                                        <span className="transformation-modal__cost-warning">
                                            Custa {hpCost > 0 ? `${hpCost} HP` : ''}
                                            {hpCost > 0 && willCost > 0 ? ' e ' : ''}
                                            {willCost > 0 ? `${willCost} Will` : ''}.
                                        </span>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="transformation-modal__clear-saves-row">
                            {targetTrans === 'Mega' && hasAltForm && (
                                <button
                                    type="button"
                                    className="action-button action-button--dark transformation-modal__clear-save-btn"
                                    onClick={() => setClearConfirmType('Mega')}
                                >
                                    🗑️ Apagar Save de Mega
                                </button>
                            )}
                            {(targetTrans === 'Dynamax' || targetTrans === 'Gigantamax') && hasMaxForm && (
                                <button
                                    type="button"
                                    className="action-button action-button--dark transformation-modal__clear-save-btn"
                                    onClick={() => setClearConfirmType('Max')}
                                >
                                    🗑️ Apagar Save de Max
                                </button>
                            )}
                            {targetTrans === 'Custom' && hasCurrentCustomSave && (
                                <button
                                    type="button"
                                    className="action-button action-button--dark transformation-modal__clear-save-btn"
                                    onClick={() => setClearConfirmType('Custom')}
                                >
                                    🗑️ Apagar Save da Forma
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="transformation-modal__section">
                        <div className="transformation-modal__desc-box transformation-modal__desc-box--center">
                            Você está transformado no momento!
                            <br />
                            <br />
                            Reverter irá restaurar com segurança seus Atributos Base, Tipo, Golpes e Perícias originais.
                        </div>
                    </div>
                )}

                <div className="transformation-modal__actions">
                    {isTransforming ? (
                        <>
                            <button
                                type="button"
                                className="action-button action-button--dark transformation-modal__btn"
                                onClick={onClose}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="action-button action-button--red transformation-modal__btn"
                                onClick={handleApply}
                                style={{ opacity: canAfford ? 1 : 0.6 }}
                            >
                                ✨ Ativar
                            </button>
                        </>
                    ) : (
                        <button
                            type="button"
                            className="action-button transformation-modal__btn transformation-modal__btn--revert"
                            onClick={handleRevert}
                        >
                            🔄 Reverter para Forma Base
                        </button>
                    )}
                </div>
            </div>

            {clearConfirmType && (
                <div className="transformation-modal__confirm-overlay">
                    <div className="transformation-modal__confirm-content">
                        <h3 className="transformation-modal__confirm-title">⚠️ Confirmar Exclusão</h3>
                        <p className="transformation-modal__confirm-text">
                            Tem certeza de que deseja apagar os dados salvos de{' '}
                            {clearConfirmType === 'Mega'
                                ? 'Mega'
                                : clearConfirmType === 'Max'
                                  ? 'Dynamax'
                                  : 'Forma Personalizada'}
                            ? Isso não pode ser desfeito.
                        </p>
                        <div className="transformation-modal__confirm-actions">
                            <button
                                className="action-button action-button--dark transformation-modal__confirm-btn"
                                onClick={() => setClearConfirmType(null)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="action-button action-button--red transformation-modal__confirm-btn"
                                onClick={confirmClearMemory}
                            >
                                Apagar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
