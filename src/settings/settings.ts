import { LocalStorageProvider } from "../storage";
import { getElementOrThrow } from "../utils";
import {
    getFeatureFlagProviderOrThrow,
    type FeatureFlagKey,
} from "../feature-flags";

export class SettingsMenu {
    constructor() {
        const settingsButton = getElementOrThrow({ id: "navbar-settings" });
        const settingsPane = getElementOrThrow({ id: "settings-pane" });
        const closeButton = getElementOrThrow({ id: "settings-pane-close" });
        const clearLocalStorageButton = getElementOrThrow({
            id: "settings-pane-clear-local-storage",
        });

        const featureFlagsList = getElementOrThrow({
            id: "settings-feature-flags-list",
        });

        settingsButton.addEventListener("click", () => {
            settingsPane.classList.toggle("hidden");
        });

        closeButton.addEventListener("click", () => {
            settingsPane.classList.add("hidden");
        });

        clearLocalStorageButton.addEventListener("click", () => {
            LocalStorageProvider.clear();
        });

        const featureFlagProvider = getFeatureFlagProviderOrThrow();

        // TODO: remove partial and use .map
        const checkboxByKey: Partial<Record<FeatureFlagKey, HTMLInputElement>> =
            {};

        Object.entries(featureFlagProvider.featureFlags).forEach(
            ([key, featureFlag]) => {
                // TODO: dont like this cast
                const typedKey = key as FeatureFlagKey;

                const row = document.createElement("div");
                row.className = "settings-feature-flag-row";

                // --- check box
                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.checked = featureFlag.value;
                checkbox.setAttribute("data-feature-flag-key", typedKey);

                // --- text container
                const textContainer = document.createElement("div");
                textContainer.className = "settings-feature-flag-text-flex";

                // bold(FF Name)
                // regular(FF description)
                const nameElement = document.createElement("strong");
                nameElement.textContent = featureFlag.name;
                textContainer.className = "settings-feature-flag-title-text";

                const descriptionElement = document.createElement("span");
                descriptionElement.textContent = featureFlag.description;
                textContainer.className =
                    "settings-feature-flag-description-text";

                textContainer.appendChild(nameElement);
                textContainer.appendChild(descriptionElement);

                row.appendChild(checkbox);
                row.appendChild(textContainer);

                featureFlagsList.appendChild(row);

                checkboxByKey[typedKey] = checkbox;

                checkbox.addEventListener("change", () => {
                    featureFlagProvider.set(typedKey, checkbox.checked);
                });
            },
        );

        featureFlagProvider.addListener(({ key, value }) => {
            const checkbox = checkboxByKey[key];
            if (checkbox) {
                checkbox.checked = value;
            }
        });
    }
}
