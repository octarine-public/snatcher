import { PhysicalItem } from "github.com/octarine-public/wrapper/index"

import { UnitWrap } from "./wrap"

export class ArcWardenUnitWrap extends UnitWrap {
	public CanPickItem(physicalItem: PhysicalItem) {
		if (!this.ShouldPick(physicalItem) || physicalItem.Item === undefined) {
			return false
		}
		return !this.Unit.IsClone && !this.Unit.IsIllusion
	}
}
