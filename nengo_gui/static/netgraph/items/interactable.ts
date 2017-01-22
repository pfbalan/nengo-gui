import { VNode, dom, h  } from "maquette";

import { MenuItem } from "../../menu";
import { Shape } from "../../utils";
import { NetGraphItem, NetGraphItemArg } from "./item";
import { MinimapItem } from "./minimap";

export interface InteractableItemArg {
    miniItem: MinimapItem;
    label: string;
}

export abstract class InteractableItem extends NetGraphItem {
    minimap;
    miniItem;
    uid;
    gNetworks;
    gItems;
    label: VNode;
    labelBelow: boolean;

    root: SVGElement;

    constructor(ngiArg: NetGraphItemArg, interArg: InteractableItemArg) {
        super(ngiArg);
        this.gNetworks = this.ng.gNetworksMini;
        this.gItems = this.ng.gItemsMini;

        this.label = h("text", {innerHTML: interArg.label, transform: ""});
        this.miniItem = interArg.miniItem;
        this.g.children.push(this.label);


        if (ngiArg.parent !== null) {
            this.parent.children.push(this);
        }

        // TODO: HOW IS THIS SUPPOSED TO BE DRAWN?
        this.root = dom.create(this.g).domNode as SVGElement;

        interact(this.root).draggable({
            onend: event => {
                const item = this.ng.svgObjects[this.uid];
                item.constrainPosition();
                this.ng.notify("pos", {uid: this.uid, x: item.x, y: item.y});

                item.redraw();
            },
            onmove: event => {
                const item = this.ng.svgObjects[this.uid];
                let w = this.ng.getScaledWidth();
                let h = this.ng.getScaledHeight();
                let parent = item.parent;
                while (parent !== null) {
                    w *= parent.width * 2;
                    h *= parent.height * 2;
                    parent = parent.parent;
                }
                item.x += event.dx / w;
                item.y += event.dy / h;
                item.redraw();

                if (this.depth === 1) {
                    this.ng.scaleMiniMap();
                }
            },
            onstart: () => {
                this.menu.hideAny();
            },
        });
        // Determine when to pull up the menu
        interact(this.root)
            .on("hold", event => {
                // Change to "tap" for right click
                if (event.button === 0) {
                    if (this.menu.visibleAny()) {
                        this.menu.hideAny();
                    } else {
                        this.menu.show(event.clientX,
                                       event.clientY,
                                       this.generateMenu());
                    }
                    event.stopPropagation();
                }
            })
            .on("tap", event => {
                // Get rid of menus when clicking off
                if (event.button === 0) {
                    if (this.menu.visibleAny()) {
                        this.menu.hideAny();
                    }
                }
            })
            .on("doubletap", event => {
                // Get rid of menus when clicking off
                if (event.button === 0) {
                    if (this.menu.visibleAny()) {
                        this.menu.hideAny();
                    }
                }
            });
        this.g = h("g", {contextmenu: event => {
            event.preventDefault();
            event.stopPropagation();
            if (this.menu.visibleAny()) {
                this.menu.hideAny();
            } else {
                this.menu.show(
                    event.clientX, event.clientY, this.generateMenu());
            }
        }});
    }

    // TODO: How do I make sure this is implemented by subclasses?
    abstract generateMenu(): MenuItem[];

    // TODO: there doesn't seem to be a way to `super` call a setter
    set height(val: number) {
        this._height = val;
        this.miniItem.height = val;
    }

    set width(val: number) {
        this._width = val;
        this.miniItem.width = val;
    }

    set x(val: number) {
        this._x = val;
        this.miniItem.x = val;
    }

    set y(val: number) {
        this._y = val;
        this.miniItem.y = val;
    }

    remove() {
        // Remove the item from the parent's children list
        if (this.parent !== null) {
            const index = this.parent.children.indexOf(this);
            this.parent.children.splice(index, 1);
        }

        super.remove();

        this.miniItem.remove();
    }

    redrawSize() {
        const screenD = super.redrawSize();
        this.label = h("text", {
            transform: "translate(0, " + (screenD.height / 2) + ")",
        });
        return screenD;
    }

    _getScreenW() {
        return this.getNestedWidth() * this.ng.width * this.ng.scale;
    }

    _getScreenH() {
        return this.getNestedHeight() * this.ng.height * this.ng.scale;
    }

    redraw() {
        super.redraw();
        // if (this.ng.mmDisplay) {
        //     this.miniItem.redraw();
        // }
    }

    _getPos() {
        const w = this.ng.width * this.ng.scale;
        const h = this.ng.height * this.ng.scale;

        const offsetX = this.ng.offsetX * w;
        const offsetY = this.ng.offsetY * h;

        return {w, h, offsetX, offsetY};
    }

    setLabel(label) {
        this.label = h("text", {innerHTML: label});
    }

    // TODO: what is the expected functionality of this thing?
    setLabelBelow(flag) {
        if (flag && !this.labelBelow) {
            const screenH = this.getScreenHeight();
            this.label = h("text", {
                transform: "translate(0, " + (screenH / 2) + ")",
            });
        } else if (!flag && this.labelBelow) {
            this.label = h("text", {transform: ""});
        }
    }
}

export class PassthroughItem extends InteractableItem {
    constructor(ngiArg: NetGraphItemArg, interArg: InteractableItemArg) {
        super(ngiArg, interArg);

        this.shape = h("ellipse.passthrough");
        // TODO: WTF can this be avoided?
        // I have to make a sepcific minimap subclass for this...
        // or something better?
        // if (this.minimap === false) {
        //     this.fixedWidth = 10;
        //     this.fixedHeight = 10;
        // } else {
        //     this.fixedWidth = 3;
        //     this.fixedHeight = 3;
        // }
        this.fixedWidth = 3;
        this.fixedHeight = 3;
    }

    // TODO: What type of menu is this thing supposed to generate?
    generateMenu() {
        return [];
    }

    reshapeSize() {
        const screenD = super.redrawSize();

        this.shape = h("ellipse", {
            rx: screenD.width / 2,
            ry: screenD.height / 2,
        });

        return screenD;
    }
}