import { Item, Rune } from "github.com/octarine-public/wrapper"

import { AbilityWrap } from "./wrap/ability/ability"
import { UnitWrap } from "./wrap/unit/unit"

export class Storage {
	public static readonly Units: UnitWrap[] = []
	public static readonly Abilities: AbilityWrap[] = []
	public static readonly IgnoredRunes: Rune[] = []
	public static readonly IgnoredItems: Item[] = []
}
