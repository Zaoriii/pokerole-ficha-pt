import { useState } from 'react';
import { TrackerVisibilityToggles } from './TrackerVisibilityToggles';
import { TrackerBadgeColors } from './TrackerBadgeColors';
import { TrackerPlacementModal } from './TrackerPlacementModal';
import './TrackerSettings.css';

export function TrackerSettingsModal({ onClose }: { onClose: () => void }) {
    const [showPlacementModal, setShowPlacementModal] = useState(false);

    return (
        <div className="tracker-settings__overlay">
            <div className="tracker-settings__content">
                <div className="tracker-settings__header-row">
                    <h3 className="tracker-settings__title">⚙️ Configurações do Rastreador</h3>
                    <button onClick={onClose} className="tracker-settings__close-x" title="Fechar">
                        X
                    </button>
                </div>
                <p className="tracker-settings__description">Personalize o que este token exibe no mapa.</p>

                <div className="tracker-settings__section">
                    <TrackerVisibilityToggles />
                    <hr className="tracker-settings__divider tracker-settings__divider--large" />
                    <TrackerBadgeColors onOpenPlacementModal={() => setShowPlacementModal(true)} />
                </div>
            </div>

            {showPlacementModal && <TrackerPlacementModal onClose={() => setShowPlacementModal(false)} />}
        </div>
    );
}
