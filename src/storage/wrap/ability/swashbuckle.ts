import { Unit, Vector3 } from "github.com/octarine-public/wrapper/index"

import { AbilityWrap } from "./wrap"

export class SwashbuckleAbilityWrap extends AbilityWrap {
	private readonly direction = new Vector3(-2179, 1649, 159)

	public UseAbility(unit: Unit, spawnerPos: Vector3, ignoreunitDmg = false) {
		if (this.Owner === undefined || this.Sleeper.Sleeping(this.SleeperKey)) {
			return
		}

		const position = unit.IsVisible ? unit.Position : spawnerPos

		if (this.Owner.Distance(unit.Position) > this.Ability.CastRange) {
			return
		}

		if (!ignoreunitDmg && this.Ability.GetDamage(unit) / 2 < unit.HP) {
			return
		}

		this.Owner.VectorTargetPosition(this.Ability, position)
		this.Owner.CastPosition(this.Ability, this.direction)
		this.Sleeper.Sleep(this.SleepTime, this.SleeperKey)
	}
}
