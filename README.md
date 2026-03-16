# yvml-interactive-map

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.8. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## POI Audio Player

Note: the current custom POI audio player implementation was AI-generated and
should be treated like generated code during review and future edits.

The POI popup audio stack is split into three layers:

- `POIController` shows and hides popup content for the active POI.
- `AudioController` owns the custom player UI in the popup. It finds the player DOM nodes, binds the buttons, updates the progress bar, and renders remaining time.
- `AudioElement` wraps the backing HTML `<audio>` element. It loads the active source, restores saved playback position, persists progress, and exposes low-level playback methods and media events.

The backing media element in the popup uses the id `poi-popup-audio-media` to distinguish it from the `AudioElement` class, which is the code wrapper around that DOM node.
