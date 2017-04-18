const $ = require("jquery");
const color = require("tinycolor2");

const Template = require("./Template");
const guid = require("./Util/guid");

class Window {
    constructor(options) {
        if (!options.title) throw new Error("Window title must not be missing.");
        if (!options.content) throw new Error("Window content must not be missing.");
        if (!options.size) throw new Error("Window size must not be missing.");
        if (typeof options.title !== "string") throw new TypeError("Window title must be a string.");
        if (typeof options.content !== "string") throw new TypeError("Window content must be a string.");
        if (!Array.isArray(options.size)) throw new TypeError("Window size must be an array.");
        if (!options.size.length || options.size.length > 2) throw new Error("Invalid window size.");

        this.title = options.title;
        this.size = options.size;
        this.content = options.content;
        this.theme = options.theme || "light";
        this.id = guid();
        this.maximized = false;

        this.window = new Template("window").build({
            title: this.title,
            content: this.content,
            id: this.id,
            width: this.size[0],
            height: this.size[1]
        });

        // Initialize events for dragging window around
        this.window.find('.window-title').mousedown((e) => { this.startDrag(e.pageX, e.pageY); });

        // Initialize events for resizing window
        this.window.find('.window-resize').mousedown((e) => { this.startResize(e.pageX, e.pageY); });

        $(document).mousemove((e) => { this.doMousemovement(e.pageX, e.pageY); });
        $(document).mouseup((e) => { this.stopMovements(); });

        if (this.theme === "dark") this.window.addClass("dark");
    }

    openIn(windowArea) {
        $(windowArea).append(this.window);

        const webview = this.window.find("webview");
        const header = this.window.find("header");

        webview.on("did-change-theme-color", event => {
            const theme = event.originalEvent.themeColor;

            header.css("background-color", theme);
            if (color(theme).isDark()) header.addClass("dark");
        });

        webview.on("page-title-updated", event => {
            header.find("h1").text(event.originalEvent.title);
        });

        return this;
    }

    minimize() {
        this.window.addClass("minimized");
    }

    maximize() {
        if (!this.maximized) {
            this.window.width(this.window.parent().width());
            this.window.height(this.window.parent().height());
            this.oldX = this.posX;
            this.oldY = this.posY;
            this.posX = 0;
            this.posY = 0;
            this.window.addClass("maximized");
        } else {
            this.window.width(this.size[0]);
            this.window.height(this.size[1]);
            this.posX = this.oldX;
            this.posY = this.oldY;
            this.window.removeClass("maximized");
        }

        this.maximized = !this.maximized;
    }

    close() {
        this.window.remove();
    }

    startDrag(mouseX, mouseY) {
      this.dragging = true;
      this.startMovement(mouseX, mouseY);
    }

    startResize(mouseX, mouseY) {
      this.resizing = true;
      this.startMovement(mouseX, mouseY);
    }

    startMovement(mouseX, mouseY) {
      this.mx = mouseX;
      this.my = mouseY;
    }
    doMousemovement(mouseX, mouseY) {
      let dx = mouseX - this.mx, dy = mouseY - this.my;
      this.mx = mouseX;
      this.my = mouseY;
      if (this.dragging) {
        this.posX += dx;
        this.posY += dy;
      }
      if (this.resizing) {
        this.width += dx;
        this.height += dy;
      }
    }
    stopMovements () {
      this.resizing = this.dragging = false;
    }

    get posX () {
      return parseInt(this.window.css('left'));
    }
    set posX (val) {
      this.window.css('left', val);
    }
    get posY () {
      return parseInt(this.window.css('top'));
    }
    set posY (val) {
      this.window.css('top', val);
    }

    get width () {
      return parseInt(this.window.css('width'));
    }
    set width (val) {
      this.window.css('width', val);
    }
    get height () {
      return parseInt(this.window.css('height'));
    }
    set height (val) {
      this.window.css('height', val);
    }
}

module.exports = Window;
