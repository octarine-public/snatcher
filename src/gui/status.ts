import {
	Color,
	DOTAGameUIState,
	GameRules,
	GameState,
	GUIInfo,
	Menu,
	RendererSDK
} from "github.com/octarine-public/wrapper/index"

import { MenuManager } from "../menu/manager"
import { StatusMenu } from "../menu/status"
import { BaseGUI } from "./base"

export class StatusGUI extends BaseGUI<{ menu: MenuManager }, StatusMenu> {
	constructor(menu: StatusMenu) {
		super(menu)
	}

	public Draw(params: { menu: MenuManager }): void {
		if (!this.State || GameState.UIState !== DOTAGameUIState.DOTA_GAME_UI_DOTA_INGAME || !GameRules?.IsInGame) {
			return
		}

		const size = GUIInfo.ScaleHeight(this.menu.Size.value)
		const pos = RendererSDK.WindowSize.DivideScalar(100)
			.MultiplyScalarX(GUIInfo.ScaleWidth(this.menu.PositionByX.value))
			.MultiplyScalarY(GUIInfo.ScaleHeight(this.menu.PositionByY.value))

		const state = params.menu.State.value || (params.menu.KeyMode.SelectedID === 1 && params.menu.KeyBind.isPressed)

		const text = ((): string => {
			const assignedKey: string = params.menu.KeyBind.assignedKeyStr

			const stateText: string = state ? Menu.Localization.Localize("On") : Menu.Localization.Localize("Off")
			const keyText: string =
				assignedKey !== "None" ? `(${Menu.Localization.Localize("Key")}): ${assignedKey}` : ""

			return `Snatcher: ${stateText} ${keyText}`
		})()

		RendererSDK.Text(text, pos, state ? Color.Green : Color.Red, RendererSDK.DefaultFontName, size)
	}
}
