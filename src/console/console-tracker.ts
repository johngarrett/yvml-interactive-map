import { getFeatureFlagProviderOrThrow } from "../feature-flags";
import { getElementOrThrow, logger, type LogLevel } from "../utils";

export class ConsoleTracker {
    constructor() {
        this.consoleElement = getElementOrThrow({ id: "console" });
        this.unsubscribeFn = logger.subscribe(this.loggerSubscription);

        // TODO:
        //const showConsole = getFeatureFlagProviderOrThrow().get("console").value;
    }

    //private handleVisibilityChange = (show: boolean) => {
    //  if (show) {
    //    this.unsubscribeFn();
    //    logger.subscribe(this.loggerSubscription);
    //    this.consoleElement.className

    //  }

    //}

    loggerSubscription = (level: LogLevel, messages: unknown[]) => {
        const line = document.createElement("div");
        line.className = `log-line log-line-level-${level}`;

        line.textContent = messages.map((e) => String(e)).join(" ");

        this.consoleElement.appendChild(line);

        // Auto-scroll to bottom
        this.consoleElement.scrollTop = this.consoleElement.scrollHeight;
    };

    private consoleElement: HTMLElement;
    private unsubscribeFn: () => void;
}
