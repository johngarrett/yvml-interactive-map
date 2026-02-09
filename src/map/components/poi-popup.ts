type PopupConfiguartion = {
    title: string;
};

/**
 * returns HTML for popup
 */
export const poiPopup = (config: PopupConfiguartion): string =>
    `<div>
       <div class="poi-label">${config.title}</div>
    </div>`;
