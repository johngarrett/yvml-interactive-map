export class MiniPlayer {
    display(entry: unknown) {
        const element = document.getElementById("mini-player");
        if (!element) {
            throw Error("no mini-player element found");
        }

        const titleElement = document.getElementById("title");
        if (!titleElement) {
            throw Error("no titleElement found");
        }

        titleElement.textContent = "foobar";
        element?.classList.remove("hidden");
    }

    close() {
        const el = document.getElementById("mini-player")!;
        el.classList.add("hidden");
    }
}

export const miniPlayer = new MiniPlayer();
