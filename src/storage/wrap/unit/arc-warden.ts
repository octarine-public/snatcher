import { PhysicalItem } from "github.com/octarine-public/wrapper/index"

import { UnitWrap } from "./unit"

export class ArcWardenUnitWrap extends UnitWrap {
	public CanPickItem(physicalItem: PhysicalItem) {
		if (!this.ShouldPick(physicalItem) || physicalItem.Item === undefined) {
			return false
		}
		return !this.unit.IsClone && !this.unit.IsIllusion
	}
}
