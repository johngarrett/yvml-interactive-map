import { LocalStorageProvider } from "../storage";
import { getElementOrThrow } from "../utils";
import { getConfig, type FeatureKey } from "../config";

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

        const configStore = getConfig();

        // --- check box container
        const checkboxContainer = document.createElement("div");
        checkboxContainer.className = "settings-feature-flag-container flex flex-col gap-2";

        Object.entries(configStore.config.features).forEach(([key, feature]) => {
            // --- check box
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = feature.value;
            checkbox.setAttribute("data-feature-flag-key", key);

            // --- text container
            const textContainer = document.createElement("div");
            textContainer.className = "settings-feature-flag-text-flex";

            // bold(FF Name)
            // regular(FF description)
            const nameElement = document.createElement("strong");
            nameElement.textContent = feature.name;
            textContainer.className = "settings-feature-flag-title-text";

            const descriptionElement = document.createElement("span");
            descriptionElement.textContent = feature.description;
            textContainer.className =
                "settings-feature-flag-description-text";

            textContainer.appendChild(nameElement);
            textContainer.appendChild(descriptionElement);

            row.appendChild(checkbox);
            row.appendChild(textContainer);

            checkboxByKey[key] = checkbox;

            checkbox.addEventListener("change", () => {
                configStore.setFeature(key, checkbox.checked);
            });
        });

        featureFlagsList.appendChild(checkboxContainer);

        configStore.addListener((event) => {
            if (event.key !== "features") {
                return;
            }

            const { key, value } = event.value;
            const checkbox = checkboxByKey[key];
            if (checkbox) {
                checkbox.checked = value;
            }
        });
    }
}
