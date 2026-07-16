import { useCharacterStore } from '../../store/useCharacterStore';

export function TrackerVisibilityToggles() {
    const identityStore = useCharacterStore((state) => state.identity);
    const setIdentity = useCharacterStore((state) => state.setIdentity);
    const role = useCharacterStore((state) => state.role);

    return (
        <>
            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingHpBar}
                        onChange={(event) => setIdentity('settingHpBar', event.target.checked)}
                    />{' '}
                    Mostrar Barra de HP
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label" title="Oculta completamente este elemento de UI dos Jogadores.">
                        <input
                            type="checkbox"
                            checked={identityStore.gmHpBar}
                            onChange={(event) => setIdentity('gmHpBar', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>

            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingHpText}
                        onChange={(event) => setIdentity('settingHpText', event.target.checked)}
                    />{' '}
                    Mostrar Números de HP
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label">
                        <input
                            type="checkbox"
                            checked={identityStore.gmHpText}
                            onChange={(event) => setIdentity('gmHpText', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>

            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingWillBar}
                        onChange={(event) => setIdentity('settingWillBar', event.target.checked)}
                    />{' '}
                    Mostrar Barra de Will
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label">
                        <input
                            type="checkbox"
                            checked={identityStore.gmWillBar}
                            onChange={(event) => setIdentity('gmWillBar', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>

            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingWillText}
                        onChange={(event) => setIdentity('settingWillText', event.target.checked)}
                    />{' '}
                    Mostrar Números de Will
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label">
                        <input
                            type="checkbox"
                            checked={identityStore.gmWillText}
                            onChange={(event) => setIdentity('gmWillText', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>

            <hr className="tracker-settings__divider" />

            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingDefBadge}
                        onChange={(event) => setIdentity('settingDefBadge', event.target.checked)}
                    />{' '}
                    Mostrar Defesas
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label">
                        <input
                            type="checkbox"
                            checked={identityStore.gmDefBadge}
                            onChange={(event) => setIdentity('gmDefBadge', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>

            <div className="tracker-settings__toggle-row">
                <label className="tracker-settings__toggle-label">
                    <input
                        type="checkbox"
                        checked={identityStore.settingEcoBadge}
                        onChange={(event) => setIdentity('settingEcoBadge', event.target.checked)}
                    />{' '}
                    Mostrar Ações
                </label>
                {role === 'GM' && (
                    <label className="tracker-settings__gm-label">
                        <input
                            type="checkbox"
                            checked={identityStore.gmEcoBadge}
                            onChange={(event) => setIdentity('gmEcoBadge', event.target.checked)}
                        />{' '}
                        Ocultar dos Jogadores
                    </label>
                )}
            </div>
        </>
    );
}
