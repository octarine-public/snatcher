import { Menu } from "github.com/octarine-public/wrapper/index"

import { BaseMenu } from "./base"

export class StatusMenu extends BaseMenu {
	constructor(tree: Menu.Node) {
		super(tree, "Status", false)

		this.Tree.SortNodes = false

		this.Size = this.Tree.AddSlider("Size", 15, 10, 100)
		this.PositionByX = this.Tree.AddSlider("Position by X", 75, 0, 100)
		this.PositionByY = this.Tree.AddSlider("Position by Y", 1, 0, 100)
	}

	public readonly Size: Menu.Slider
	public readonly PositionByX: Menu.Slider
	public readonly PositionByY: Menu.Slider
}
